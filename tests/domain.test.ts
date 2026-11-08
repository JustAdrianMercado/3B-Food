import { strict as assert } from "node:assert";
import { test } from "node:test";
import { STORAGE_KEY, effectiveEnd, getMetrics, localDate, offerStatus, parsePersistedState, reportCsv, transition, validateLot, type LotInput } from "../src/lib/domain";
import { createSeed, establishments } from "../src/lib/seed";

const now = Date.parse("2026-11-12T14:00:00.000Z");
const ids = establishments.map((item) => item.id);
const validLot = (): LotInput => ({ establishmentId: "est-espiga", name: "Pack de la exposición", description: "Seis panes de la producción del día. Conservar en lugar fresco. Contiene gluten.", category: "Panadería", unit: "unidades", quantity: 3, regularPrice: 30, price: 18, entryAt: "2026-11-12T04:00:00.000Z", dateType: "Límite de oferta", foodDate: "2026-11-12", commercializationEndsAt: "2026-11-12T22:00:00.000Z", pickupStartsAt: "2026-11-12T14:00:00.000Z", pickupEndsAt: "2026-11-12T21:00:00.000Z", alertMinutes: 120, suitabilityDeclared: true });

test("el conjunto inicial se recupera sin discrepancias de existencias", () => {
  const state = createSeed(now);
  assert.deepEqual(parsePersistedState(JSON.stringify(state), ids), state);
  assert.equal(STORAGE_KEY, "ecorescate-demo-v1");
});

test("la última cantidad se reserva una sola vez y no admite sobre-reserva", () => {
  const state = createSeed(now);
  const lot = state.lots.find((item) => item.id === "lot-pan-artesanal")!;
  const reserved = transition(state, { type: "reserve", offerId: "pan-artesanal", quantity: lot.availableQuantity }, now);
  const changedLot = reserved.lots.find((item) => item.id === lot.id)!;
  assert.equal(changedLot.availableQuantity, 0);
  assert.equal(offerStatus(reserved.offers[0], changedLot, now), "Agotada");
  assert.throws(() => transition(reserved, { type: "reserve", offerId: "pan-artesanal", quantity: 1 }, now), /no está disponible/);
  assert.equal(lot.availableQuantity, 9, "La transición no modifica el estado anterior");
});

test("cantidades inválidas se rechazan sin modificar el inventario", () => {
  const state = createSeed(now);
  const original = structuredClone(state);
  for (const amount of [0, -1, NaN, Infinity, 1.5, 1000]) {
    assert.throws(() => transition(state, { type: "reserve", offerId: "pan-artesanal", quantity: amount }, now));
    assert.deepEqual(state, original);
  }
});

test("los kilogramos admiten decimales y conservan sus cantidades", () => {
  const state = transition(createSeed(now), { type: "reserve", offerId: "caja-de-huerta", quantity: 0.1 }, now);
  assert.equal(state.lots.find((item) => item.id === "lot-caja-de-huerta")!.availableQuantity, 6.4);
  const cancelled = transition(state, { type: "cancel", reservationId: state.reservations[0].id }, now);
  assert.equal(cancelled.lots.find((item) => item.id === "lot-caja-de-huerta")!.availableQuantity, 6.5);
});

test("cancelar libera existencias una sola vez y conserva el historial", () => {
  const reserved = transition(createSeed(now), { type: "reserve", offerId: "pan-artesanal", quantity: 2 }, now);
  const id = reserved.reservations[0].id;
  const cancelled = transition(reserved, { type: "cancel", reservationId: id }, now);
  assert.equal(cancelled.lots[0].availableQuantity, 9);
  assert.equal(cancelled.reservations[0].status, "Cancelada");
  assert.equal(cancelled.movements[0].type, "Cancelación");
  assert.throws(() => transition(cancelled, { type: "cancel", reservationId: id }, now), /ya está cerrada/);
});

test("el retiro exige el establecimiento correcto y un horario vigente", () => {
  const state = createSeed(now);
  const id = "res-demo-pendiente";
  assert.throws(() => transition(state, { type: "collect", reservationId: id, establishmentId: "est-verde" }, now), /otro establecimiento/);
  assert.throws(() => transition(state, { type: "collect", reservationId: id, establishmentId: "est-espiga" }, now - 3_600_000), /no comenzó/);
  const next = transition(state, { type: "collect", reservationId: id, establishmentId: "est-espiga" }, now);
  assert.equal(next.reservations.find((item) => item.id === id)!.status, "Retirada");
  assert.equal(next.lots[0].availableQuantity, state.lots[0].availableQuantity, "El stock se descontó en la reserva, no dos veces");
  assert.throws(() => transition(next, { type: "collect", reservationId: id, establishmentId: "est-espiga" }, now), /ya está cerrada/);
});

test("el vencimiento automático no reactiva una oferta ni libera stock dos veces", () => {
  const state = createSeed(now);
  const expiredAt = effectiveEnd(state.lots[0]) + 1;
  const expired = transition(state, { type: "expire" }, expiredAt);
  assert.equal(expired.reservations.find((item) => item.id === "res-demo-pendiente")!.status, "No retirada");
  assert.equal(expired.lots[0].availableQuantity, 10);
  assert.equal(offerStatus(expired.offers[0], expired.lots[0], expiredAt), "Finalizada");
  assert.equal(transition(expired, { type: "expire" }, expiredAt), expired);
  assert.throws(() => transition(expired, { type: "reserve", offerId: "pan-artesanal", quantity: 1 }, expiredAt));
});

test("una cancelación tardía no vuelve a hacer reservable un producto", () => {
  const state = createSeed(now);
  const late = effectiveEnd(state.lots[0]) + 1;
  const next = transition(state, { type: "cancel", reservationId: "res-demo-pendiente" }, late);
  assert.equal(offerStatus(next.offers[0], next.lots[0], late), "Finalizada");
});

test("cambiar el descuento conserva el precio de las reservas y el total publicado", () => {
  const state = createSeed(now);
  const before = getMetrics(state);
  const next = transition(state, { type: "price", offerId: "pan-artesanal", price: 12, establishmentId: "est-espiga" }, now);
  assert.equal(next.offers[0].price, 12);
  assert.equal(next.reservations.find((item) => item.id === "res-demo-pendiente")!.unitPrice, 18);
  assert.deepEqual(getMetrics(next), before);
  assert.throws(() => transition(state, { type: "price", offerId: "pan-artesanal", price: 35, establishmentId: "est-espiga" }, now));
});

test("pausar retira la oferta del catálogo sin cancelar reservas existentes", () => {
  const state = createSeed(now);
  const next = transition(state, { type: "toggle-offer", offerId: "pan-artesanal", establishmentId: "est-espiga" }, now);
  assert.equal(offerStatus(next.offers[0], next.lots[0], now), "Pausada");
  assert.deepEqual(next.reservations, state.reservations);
  const resumed = transition(next, { type: "toggle-offer", offerId: "pan-artesanal", establishmentId: "est-espiga" }, now);
  assert.equal(offerStatus(resumed.offers[0], resumed.lots[0], now), "Disponible");
});

test("publicar crea lote, oferta y trazabilidad coherentes", () => {
  const state = createSeed(now);
  const next = transition(state, { type: "publish", input: validLot() }, now);
  assert.equal(next.lots[0].initialQuantity, 3);
  assert.equal(next.lots[0].availableQuantity, 3);
  assert.equal(next.offers[0].lotId, next.lots[0].id);
  assert.equal(next.movements[0].type, "Publicación");
  assert.ok(parsePersistedState(JSON.stringify(next), ids));
});

test("la publicación rechaza fechas vencidas, horarios incoherentes y falta de declaración", () => {
  const input = validLot();
  validateLot(input, now);
  for (const changes of [
    { foodDate: "2026-11-11" }, { entryAt: "2026-11-13T04:00:00.000Z" },
    { pickupEndsAt: "2026-11-12T23:00:00.000Z" }, { commercializationEndsAt: "2026-11-12T13:00:00.000Z" },
    { suitabilityDeclared: false }, { quantity: 1.5 }, { price: 31 },
    { commercializationEndsAt: "2026-11-13T06:00:00.000Z", pickupEndsAt: "2026-11-13T05:00:00.000Z", foodDate: "2026-11-13" },
  ]) assert.throws(() => validateLot({ ...input, ...changes }, now));
});

test("los reportes separan unidades y no cuentan reservas pendientes como retiros", () => {
  const state = createSeed(now);
  const metrics = getMetrics(state);
  assert.equal(metrics.length, 3);
  assert.deepEqual(metrics.find((item) => item.unit === "unidades"), { unit: "unidades", published: 30, reserved: 1, collected: 2, cancelled: 0, uncollected: 0, proportion: 6.7 });
  assert.equal(metrics.find((item) => item.unit === "porciones")!.published, 16);
  assert.equal(metrics.find((item) => item.unit === "kg")!.collected, 1.5);
  assert.equal(getMetrics(state, { establishmentId: "est-espiga" })[0].unit, "unidades");
  assert.deepEqual(getMetrics(state, { since: now + 1 }), []);
});

test("el almacenamiento corrupto o con referencias rotas se recupera de forma segura", () => {
  assert.equal(parsePersistedState("{broken", ids), null);
  const state = createSeed(now);
  for (const mutate of [
    (item: typeof state) => { item.version = 2 as 1; },
    (item: typeof state) => { item.lots[0].availableQuantity = -1; },
    (item: typeof state) => { item.reservations[0].offerId = "not-found"; },
    (item: typeof state) => { item.offers[0].lotId = "not-found"; },
    (item: typeof state) => { item.lots[0].availableQuantity += 1; },
  ]) { const changed = structuredClone(state); mutate(changed); assert.equal(parsePersistedState(JSON.stringify(changed), ids), null); }
});

test("el CSV incluye unidades separadas y declara que los datos son simulados", () => {
  const csv = reportCsv(getMetrics(createSeed(now)), 'Local "de prueba"', new Date(now).toISOString());
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes('Local ""de prueba""'));
  assert.ok(csv.includes('"kg";"8";"0";"1.5"'));
  assert.ok(csv.includes("Datos simulados"));
  assert.ok(csv.includes("No demuestran reducción de desperdicio"));
});

test("las fechas de la demo usan Cochabamba aunque el equipo esté en UTC", () => {
  assert.equal(localDate(new Date("2026-11-12T02:00:00.000Z")), "2026-11-11");
});
