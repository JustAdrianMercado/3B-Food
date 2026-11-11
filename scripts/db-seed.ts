import { createSeed } from "../src/lib/seed";
import { connect } from "./db";

/**
 * Replaces establishments, offers, reservations and history with the sample data (dates relative to now).
 * Business applications and contact messages are left untouched.
 */
async function main() {
  const state = createSeed(Date.now());
  const client = await connect();
  try {
    await client.query("begin");
    await client.query("delete from movements; delete from reservations; delete from offers; delete from lots; delete from establishments;");
    for (const item of state.establishments) {
      await client.query(
        "insert into establishments (id, slug, name, type, zone, address, description, opening_hours, initials, color) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
        [item.id, item.slug, item.name, item.type, item.zone, item.address, item.description, item.openingHours, item.initials, item.color],
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
        "insert into reservations (id, code, offer_id, quantity, unit_price, customer_name, status, created_at, closed_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [reservation.id, reservation.code, reservation.offerId, reservation.quantity, reservation.unitPrice, reservation.customerName, reservation.status, reservation.createdAt, reservation.closedAt],
      );
    }
    for (const movement of state.movements) {
      await client.query("insert into movements (id, lot_id, reservation_id, type, quantity, detail, created_at) values ($1,$2,$3,$4,$5,$6,$7)",
        [movement.id, movement.lotId, movement.reservationId, movement.type, movement.quantity, movement.detail, movement.createdAt]);
    }
    await client.query("commit");
    console.log(`Datos de ejemplo cargados: ${state.establishments.length} establecimientos, ${state.offers.length} ofertas, ${state.reservations.length} reservas.`);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
