import "server-only";
import { lotSchema, movementSchema, offerSchema, reservationSchema, type Establishment, type Lot, type Movement, type Offer, type Reservation } from "@/lib/domain";

type Row = Record<string, unknown>;

const iso = (value: unknown) => new Date(String(value)).toISOString();
const isoOrNull = (value: unknown) => value === null || value === undefined ? null : iso(value);
const num = (value: unknown) => Number(value);

export const ESTABLISHMENT_COLUMNS = "id, slug, name, type, zone, address, description, opening_hours, initials, color";
export const LOT_COLUMNS = "id, establishment_id, name, description, category, unit, initial_quantity, available_quantity, entry_at, date_type, food_date, commercialization_ends_at, pickup_starts_at, pickup_ends_at, alert_minutes, suitability_declared";
export const OFFER_COLUMNS = "id, lot_id, regular_price, price, image, published_at, paused";
export const RESERVATION_COLUMNS = "id, code, offer_id, quantity, unit_price, customer_name, customer_token, status, created_at, closed_at";
export const MOVEMENT_COLUMNS = "id, lot_id, reservation_id, type, quantity, detail, created_at";

export function toEstablishment(row: Row): Establishment {
  return {
    id: String(row.id), slug: String(row.slug), name: String(row.name), type: row.type === "Supermercado" ? "Supermercado" : "Restaurante",
    zone: String(row.zone), address: String(row.address), description: String(row.description), openingHours: String(row.opening_hours),
    initials: String(row.initials), color: String(row.color),
  };
}

export function toLot(row: Row): Lot {
  return lotSchema.parse({
    id: row.id, establishmentId: row.establishment_id, name: row.name, description: row.description, category: row.category, unit: row.unit,
    initialQuantity: num(row.initial_quantity), availableQuantity: num(row.available_quantity), entryAt: iso(row.entry_at), dateType: row.date_type,
    foodDate: String(row.food_date).slice(0, 10), commercializationEndsAt: iso(row.commercialization_ends_at), pickupStartsAt: iso(row.pickup_starts_at),
    pickupEndsAt: iso(row.pickup_ends_at), alertMinutes: num(row.alert_minutes), suitabilityDeclared: row.suitability_declared,
  });
}

export function toOffer(row: Row): Offer {
  return offerSchema.parse({
    id: row.id, lotId: row.lot_id, regularPrice: num(row.regular_price), price: num(row.price), image: row.image,
    publishedAt: iso(row.published_at), paused: row.paused,
  });
}

/** The visitor token stays on the server; the client only learns whether the reservation is theirs. */
export function toReservation(row: Row, visitorToken: string | undefined): Reservation {
  return reservationSchema.parse({
    id: row.id, code: row.code, offerId: row.offer_id, quantity: num(row.quantity), unitPrice: num(row.unit_price),
    createdAt: iso(row.created_at), status: row.status, closedAt: isoOrNull(row.closed_at),
    customerName: row.customer_name ?? null, mine: Boolean(visitorToken && row.customer_token === visitorToken),
  });
}

export function toMovement(row: Row): Movement {
  return movementSchema.parse({
    id: row.id, lotId: row.lot_id, reservationId: row.reservation_id ?? null, type: row.type, quantity: num(row.quantity),
    createdAt: iso(row.created_at), detail: row.detail,
  });
}
