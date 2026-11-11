import { strict as assert } from "node:assert";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import type { Client } from "pg";
import { createClient } from "@supabase/supabase-js";
import { connect } from "../scripts/db";

/*
 * Business rules enforced by the SQL functions in supabase/migrations.
 * Every test runs inside a transaction that is rolled back, so the shared database is left untouched.
 * Run with: npm run test:db (needs .env.local from `vercel env pull`).
 */

let client: Client;
before(async () => { client = await connect(); });
after(async () => { await client.end(); });

type LotOptions = { unit?: "unidades" | "kg"; quantity?: number; pickupFrom?: string; end?: string; foodDays?: number };

async function inTransaction(run: (ids: { establishment: string }) => Promise<void>) {
  const establishment = `est-test-${randomUUID()}`;
  await client.query("begin");
  try {
    await client.query(
      "insert into establishments (id, slug, name, type, zone, address, description, opening_hours, initials, color) values ($1, $1, 'Local de prueba', 'Restaurante', 'Centro', 'Calle 1', 'Descripción de prueba', 'Todos los días', 'LP', '#cccccc')",
      [establishment],
    );
    await run({ establishment });
  } finally {
    await client.query("rollback");
  }
}

async function createOffer(establishment: string, options: LotOptions = {}) {
  const { unit = "unidades", quantity = 3, pickupFrom = "-30 minutes", end = "2 hours", foodDays = 1 } = options;
  const lot = await client.query<{ id: string }>(
    `insert into lots (establishment_id, name, description, category, unit, initial_quantity, available_quantity, entry_at, date_type, food_date,
       commercialization_ends_at, pickup_starts_at, pickup_ends_at, alert_minutes, suitability_declared)
     values ($1, 'Lote de prueba', 'Descripción suficientemente larga', 'Panadería', $2, $3, $3, now() - interval '3 hours', 'Consumo preferente',
       ((now() at time zone 'America/La_Paz')::date + $6::int), now() + $5::interval, now() + $4::interval, now() + $5::interval, 60, true)
     returning id`,
    [establishment, unit, quantity, pickupFrom, end, foodDays],
  );
  const offer = await client.query<{ id: string }>("insert into offers (lot_id, regular_price, price, image) values ($1, 20, 10, '/images/bread.webp') returning id", [lot.rows[0].id]);
  return { lotId: lot.rows[0].id, offerId: offer.rows[0].id };
}

const available = async (lotId: string) => Number((await client.query("select available_quantity from lots where id = $1", [lotId])).rows[0].available_quantity);
const reserve = async (offerId: string, quantity: number, token = "token-a") =>
  (await client.query("select * from reserve_offer($1, $2, 'Ana Prueba', $3)", [offerId, quantity, token])).rows[0];

/** Runs a statement that should fail, without aborting the surrounding transaction. */
async function rejects(sql: string, params: unknown[], message: RegExp) {
  await client.query("savepoint attempt");
  await assert.rejects(client.query(sql, params), message);
  await client.query("rollback to savepoint attempt");
}

test("la última unidad se reserva una sola vez y no admite sobre-reserva", () => inTransaction(async ({ establishment }) => {
  const { lotId, offerId } = await createOffer(establishment);
  const reservation = await reserve(offerId, 3);
  assert.match(reservation.code, /^ECO-[A-F0-9]{6}$/);
  assert.equal(await available(lotId), 0);
  await rejects("select reserve_offer($1, 1, 'Ana', 't')", [offerId], /no está disponible/);
}));

test("cantidades inválidas se rechazan sin modificar existencias", () => inTransaction(async ({ establishment }) => {
  const { lotId, offerId } = await createOffer(establishment);
  for (const amount of [0, -1, 1.5, 4]) await rejects("select reserve_offer($1, $2, 'Ana', 't')", [offerId, amount], /cantidad|existencias/);
  assert.equal(await available(lotId), 3);
}));

test("los kilogramos admiten decimales y cancelar libera exactamente lo reservado", () => inTransaction(async ({ establishment }) => {
  const { lotId, offerId } = await createOffer(establishment, { unit: "kg", quantity: 2.5 });
  const reservation = await reserve(offerId, 0.1);
  assert.equal(await available(lotId), 2.4);
  await client.query("select cancel_reservation($1, 'token-a', null)", [reservation.id]);
  assert.equal(await available(lotId), 2.5);
}));

test("cancelar exige ser el titular o el establecimiento y solo libera una vez", () => inTransaction(async ({ establishment }) => {
  const { lotId, offerId } = await createOffer(establishment);
  const reservation = await reserve(offerId, 2);
  await rejects("select cancel_reservation($1, 'otro-token', null)", [reservation.id], /No encontramos esta reserva/);
  await rejects("select cancel_reservation($1, null, 'est-otro')", [reservation.id], /No encontramos esta reserva/);
  await client.query("select cancel_reservation($1, null, $2)", [reservation.id, establishment]);
  assert.equal(await available(lotId), 3);
  await rejects("select cancel_reservation($1, 'token-a', null)", [reservation.id], /ya está cerrada/);
  assert.equal(await available(lotId), 3);
  const types = (await client.query("select type from movements where reservation_id = $1 order by created_at", [reservation.id])).rows.map((row) => row.type);
  assert.deepEqual(types.sort(), ["Cancelación", "Reserva"]);
}));

test("el retiro exige el establecimiento correcto y un horario vigente", () => inTransaction(async ({ establishment }) => {
  const early = await createOffer(establishment, { pickupFrom: "1 hour" });
  const pending = await reserve(early.offerId, 1);
  await rejects("select collect_reservation($1, $2)", [pending.id, establishment], /todavía no comenzó/);

  const { lotId, offerId } = await createOffer(establishment);
  const reservation = await reserve(offerId, 2);
  await rejects("select collect_reservation($1, 'est-otro')", [reservation.id], /otro establecimiento/);
  await client.query("select collect_reservation($1, $2)", [reservation.id, establishment]);
  assert.equal(await available(lotId), 1, "El stock se descontó al reservar, no otra vez al retirar");
  await rejects("select collect_reservation($1, $2)", [reservation.id, establishment], /ya está cerrada/);
}));

test("las reservas vencidas pasan a no retiradas una sola vez y la oferta queda cerrada", () => inTransaction(async ({ establishment }) => {
  const { lotId, offerId } = await createOffer(establishment, { pickupFrom: "-2 hours", end: "2 hours" });
  const reservation = await reserve(offerId, 2);
  await client.query("update lots set commercialization_ends_at = now() - interval '1 minute', pickup_ends_at = now() - interval '1 minute' where id = $1", [lotId]);
  await client.query("select expire_reservations()");
  const row = (await client.query("select status, closed_at from reservations where id = $1", [reservation.id])).rows[0];
  assert.equal(row.status, "No retirada");
  assert.ok(row.closed_at);
  assert.equal(await available(lotId), 3);
  await client.query("select expire_reservations()");
  assert.equal(await available(lotId), 3, "Una segunda ejecución no libera existencias otra vez");
  await rejects("select reserve_offer($1, 1, 'Ana', 't')", [offerId], /no está disponible/);
}));

test("cambiar el precio conserva el de las reservas existentes", () => inTransaction(async ({ establishment }) => {
  const { offerId } = await createOffer(establishment);
  const reservation = await reserve(offerId, 1);
  await client.query("select update_offer_price($1, $2, 8)", [offerId, establishment]);
  assert.equal(Number((await client.query("select price from offers where id = $1", [offerId])).rows[0].price), 8);
  assert.equal(Number((await client.query("select unit_price from reservations where id = $1", [reservation.id])).rows[0].unit_price), 10);
  await rejects("select update_offer_price($1, $2, 20)", [offerId, establishment], /menor al precio habitual/);
  await rejects("select update_offer_price($1, 'est-otro', 5)", [offerId], /otro establecimiento/);
}));

test("pausar impide nuevas reservas y reactivar las permite", () => inTransaction(async ({ establishment }) => {
  const { offerId } = await createOffer(establishment);
  await client.query("select toggle_offer($1, $2)", [offerId, establishment]);
  await rejects("select reserve_offer($1, 1, 'Ana', 't')", [offerId], /no está disponible/);
  await client.query("select toggle_offer($1, $2)", [offerId, establishment]);
  await reserve(offerId, 1);
}));

test("publicar crea lote, oferta y movimiento coherentes", () => inTransaction(async ({ establishment }) => {
  const offer = (await client.query(
    `select * from publish_lot($1, 'Pan del día', 'Seis panes de la producción del día.', 'Panadería', 'unidades', 4, 30, 18, '/images/bread.webp',
      now() - interval '1 hour', 'Consumo preferente', (now() at time zone 'America/La_Paz')::date + 1, now() + interval '3 hours', now(), now() + interval '3 hours', 120)`,
    [establishment],
  )).rows[0];
  const lot = (await client.query("select * from lots where id = $1", [offer.lot_id])).rows[0];
  assert.equal(Number(lot.initial_quantity), 4);
  assert.equal(Number(lot.available_quantity), 4);
  const movement = (await client.query("select type, quantity from movements where lot_id = $1", [offer.lot_id])).rows;
  assert.deepEqual(movement.map((row) => [row.type, Number(row.quantity)]), [["Publicación", 4]]);
  await rejects(
    "select publish_lot($1, 'Pan', 'Descripción larga', 'Panadería', 'unidades', 1.5, 30, 18, '/images/bread.webp', now(), 'Consumo preferente', current_date + 1, now() + interval '1 hour', now(), now() + interval '1 hour', 60)",
    [establishment], /check constraint/,
  );
}));

test("dos personas que reservan la última unidad a la vez: solo una lo consigue", async () => {
  const establishment = `est-test-${randomUUID()}`;
  await client.query(
    "insert into establishments (id, slug, name, type, zone, address, description, opening_hours, initials, color) values ($1, $1, 'Local de prueba', 'Restaurante', 'Centro', 'Calle 1', 'Descripción de prueba', 'Todos los días', 'LP', '#cccccc')",
    [establishment],
  );
  const [first, second] = await Promise.all([connect(), connect()]);
  try {
    const { lotId, offerId } = await createOffer(establishment, { quantity: 1 });
    const results = await Promise.allSettled([
      first.query("select * from reserve_offer($1, 1, 'Persona A', 'token-a')", [offerId]),
      second.query("select * from reserve_offer($1, 1, 'Persona B', 'token-b')", [offerId]),
    ]);
    assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
    assert.equal(results.filter((result) => result.status === "rejected").length, 1);
    assert.equal(await available(lotId), 0);
  } finally {
    await Promise.all([first.end(), second.end()]);
    await client.query("delete from movements where lot_id in (select id from lots where establishment_id = $1)", [establishment]);
    await client.query("delete from reservations where offer_id in (select o.id from offers o join lots l on l.id = o.lot_id where l.establishment_id = $1)", [establishment]);
    await client.query("delete from offers where lot_id in (select id from lots where establishment_id = $1)", [establishment]);
    await client.query("delete from lots where establishment_id = $1", [establishment]);
    await client.query("delete from establishments where id = $1", [establishment]);
  }
});

test("la clave pública de Supabase no puede leer ni modificar datos", async () => {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  assert.ok(url && anonKey, "Faltan SUPABASE_URL y SUPABASE_ANON_KEY");
  const anon = createClient(url, anonKey, { auth: { persistSession: false } });
  for (const table of ["establishments", "lots", "offers", "reservations", "movements", "business_applications", "contact_messages"]) {
    const { data } = await anon.from(table).select("*").limit(1);
    assert.deepEqual(data ?? [], [], `La tabla ${table} no debe ser legible con la clave pública`);
  }
  const { error: insertError } = await anon.from("contact_messages").insert({ name: "Intruso", email: "x@example.com", subject: "Prueba", message: "No debería guardarse." });
  assert.ok(insertError, "Insertar con la clave pública debe fallar");
  const { error: rpcError } = await anon.rpc("expire_reservations");
  assert.ok(rpcError, "Las funciones no deben ser ejecutables con la clave pública");
});
