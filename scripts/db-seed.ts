import { hashPassword } from "../src/lib/password";
import { SEED_PASSWORD, accounts, contactMessages, createSeed, reservationOwner } from "../src/lib/seed";
import { connect } from "./db";

/**
 * Replaces establishments, accounts, offers, reservations, history and contact messages with the initial data
 * (dates relative to now). Every account starts with the password in SEED_PASSWORD.
 */
async function main() {
  const now = Date.now();
  const state = createSeed(now);
  const hashes = await Promise.all(accounts.map(() => hashPassword(SEED_PASSWORD)));
  const client = await connect();
  try {
    await client.query("begin");
    await client.query("delete from movements; delete from reservations; delete from offers; delete from lots; delete from sessions; delete from users; delete from establishments; delete from contact_messages; delete from business_applications;");
    for (const item of state.establishments) {
      await client.query(
        "insert into establishments (id, slug, name, type, zone, address, description, opening_hours, initials, color) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
        [item.id, item.slug, item.name, item.type, item.zone, item.address, item.description, item.openingHours, item.initials, item.color],
      );
    }
    for (const [index, account] of accounts.entries()) {
      await client.query(
        "insert into users (id, name, email, phone, password_hash, role, establishment_id, created_at) values ($1,$2,$3,$4,$5,$6,$7,$8)",
        [account.id, account.name, account.email, account.phone, hashes[index], account.role, account.establishmentId, new Date(now - (40 - index) * 86_400_000).toISOString()],
      );
    }
    for (const lot of state.lots) {
      await client.query(
        `insert into lots (id, establishment_id, name, description, category, unit, initial_quantity, available_quantity, entry_at, date_type, food_date,
          commercialization_ends_at, pickup_starts_at, pickup_ends_at, alert_minutes, suitability_declared)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
        [lot.id, lot.establishmentId, lot.name, lot.description, lot.category, lot.unit, lot.initialQuantity, lot.availableQuantity, lot.entryAt, lot.dateType,
          lot.foodDate, lot.commercializationEndsAt, lot.pickupStartsAt, lot.pickupEndsAt, lot.alertMinutes, lot.suitabilityDeclared],
      );
    }
    for (const offer of state.offers) {
      await client.query("insert into offers (id, lot_id, regular_price, price, image, published_at, paused) values ($1,$2,$3,$4,$5,$6,$7)",
        [offer.id, offer.lotId, offer.regularPrice, offer.price, offer.image, offer.publishedAt, offer.paused]);
    }
    for (const reservation of state.reservations) {
      await client.query(
        "insert into reservations (id, code, offer_id, quantity, unit_price, customer_name, user_id, status, created_at, closed_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
        [reservation.id, reservation.code, reservation.offerId, reservation.quantity, reservation.unitPrice, reservation.customerName, reservationOwner(reservation), reservation.status, reservation.createdAt, reservation.closedAt],
      );
    }
    for (const movement of state.movements) {
      await client.query("insert into movements (id, lot_id, reservation_id, type, quantity, detail, created_at) values ($1,$2,$3,$4,$5,$6,$7)",
        [movement.id, movement.lotId, movement.reservationId, movement.type, movement.quantity, movement.detail, movement.createdAt]);
    }
    for (const message of contactMessages) {
      await client.query("insert into contact_messages (id, name, email, subject, message, created_at) values ($1,$2,$3,$4,$5,$6)",
        [message.id, message.name, message.email, message.subject, message.message, new Date(now - message.hoursAgo * 3_600_000).toISOString()]);
    }
    await client.query("commit");
    console.log(`Datos cargados: ${state.establishments.length} establecimientos, ${accounts.length} cuentas, ${state.offers.length} ofertas, ${state.reservations.length} reservas.`);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
