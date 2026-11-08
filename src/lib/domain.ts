import { z } from "zod";

export const UNITS = ["porciones", "unidades", "kg"] as const;
export type Unit = (typeof UNITS)[number];
export const CATEGORIES = ["Cocina del día", "Panadería", "Frutas y verduras", "Lácteos", "Despensa"] as const;
export type Category = (typeof CATEGORIES)[number];
export const ZONES = ["Tupuraya", "Cala Cala", "Centro", "La Recoleta"] as const;
export const TIME_ZONE = "America/La_Paz";
export const STORAGE_KEY = "ecorescate-demo-v1";

export interface Establishment {
  id: string;
  name: string;
  type: "Restaurante" | "Supermercado";
  zone: string;
  address: string;
  initials: string;
  color: string;
}

const lotSchema = z.object({
  id: z.string().min(1),
  establishmentId: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1200),
  category: z.enum(CATEGORIES),
  unit: z.enum(UNITS),
  initialQuantity: z.number().positive().finite(),
  availableQuantity: z.number().nonnegative().finite(),
  entryAt: z.string().datetime(),
  dateType: z.enum(["Límite de oferta", "Consumo preferente", "Vencimiento"]),
  foodDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  commercializationEndsAt: z.string().datetime(),
  pickupStartsAt: z.string().datetime(),
  pickupEndsAt: z.string().datetime(),
  alertMinutes: z.number().positive().finite(),
  suitabilityDeclared: z.literal(true),
});

const offerSchema = z.object({
  id: z.string().min(1),
  lotId: z.string().min(1),
  regularPrice: z.number().positive().finite(),
  price: z.number().positive().finite(),
  image: z.string().startsWith("/images/"),
  publishedAt: z.string().datetime(),
  paused: z.boolean(),
});

const reservationSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  offerId: z.string().min(1),
  quantity: z.number().positive().finite(),
  unitPrice: z.number().positive().finite(),
  createdAt: z.string().datetime(),
  status: z.enum(["Reservada", "Retirada", "Cancelada", "No retirada"]),
  closedAt: z.string().datetime().nullable(),
});

const movementSchema = z.object({
  id: z.string().min(1),
  lotId: z.string().min(1),
  reservationId: z.string().nullable(),
  type: z.enum(["Publicación", "Reserva", "Retiro", "Cancelación", "Plazo finalizado", "Cambio de precio"]),
  quantity: z.number().nonnegative().finite(),
  createdAt: z.string().datetime(),
  detail: z.string(),
});

export const demoSchema = z.object({
  version: z.literal(1),
  startedAt: z.string().datetime(),
  selectedEstablishmentId: z.string().min(1),
  lots: z.array(lotSchema).max(500),
  offers: z.array(offerSchema).max(500),
  reservations: z.array(reservationSchema).max(3000),
  movements: z.array(movementSchema).max(10000),
});

export type Lot = z.infer<typeof lotSchema>;
export type Offer = z.infer<typeof offerSchema>;
export type Reservation = z.infer<typeof reservationSchema>;
export type Movement = z.infer<typeof movementSchema>;
export type DemoState = z.infer<typeof demoSchema>;
export type OfferStatus = "Disponible" | "Agotada" | "Finalizada" | "Pausada";

export interface OfferView {
  offer: Offer;
  lot: Lot;
  establishment: Establishment;
}

export interface LotInput {
  establishmentId: string;
  name: string;
  description: string;
  category: Category;
  quantity: number;
  unit: Unit;
  regularPrice: number;
  price: number;
  entryAt: string;
  dateType: Lot["dateType"];
  foodDate: string;
  commercializationEndsAt: string;
  pickupStartsAt: string;
  pickupEndsAt: string;
  alertMinutes: number;
  suitabilityDeclared: boolean;
}

export type DemoAction =
  | { type: "publish"; input: LotInput }
  | { type: "reserve"; offerId: string; quantity: number }
  | { type: "cancel"; reservationId: string }
  | { type: "collect"; reservationId: string; establishmentId: string }
  | { type: "price"; offerId: string; price: number; establishmentId: string }
  | { type: "toggle-offer"; offerId: string; establishmentId: string }
  | { type: "select-establishment"; establishmentId: string }
  | { type: "expire" };

export class DemoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DemoError";
  }
}

export const quantity = (value: number) => Math.round(value * 1000) / 1000;
export const money = (value: number) =>
  `Bs ${new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 }).format(value)}`;
export const number = (value: number) =>
  new Intl.NumberFormat("es-BO", { maximumFractionDigits: 3 }).format(value);
export const dateLabel = (value: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("es-BO", { timeZone: TIME_ZONE, day: "numeric", month: "short", ...options }).format(new Date(value));
export const timeLabel = (value: string) =>
  new Intl.DateTimeFormat("es-BO", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));
export const localDate = (value: number | Date = Date.now()) => {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(value);
  const part = (name: string) => parts.find((p) => p.type === name)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
};
export const localInput = (value: number | Date = Date.now()) => {
  const date = new Date(value);
  return `${localDate(date)}T${timeLabel(date.toISOString())}`;
};
export const fromLocalInput = (value: string) => new Date(`${value}:00-04:00`).toISOString();
export const foodDateEnd = (value: string) => new Date(`${value}T23:59:59.999-04:00`).getTime();
export const discount = (offer: Offer) => Math.round((1 - offer.price / offer.regularPrice) * 100);
export const unitLabel = (unit: Unit) => unit === "kg" ? "kg" : unit === "porciones" ? "porción" : "unidad";

export function effectiveEnd(lot: Lot): number {
  return Math.min(Date.parse(lot.commercializationEndsAt), Date.parse(lot.pickupEndsAt), foodDateEnd(lot.foodDate));
}

export function offerStatus(offer: Offer, lot: Lot, now = Date.now()): OfferStatus {
  if (now >= effectiveEnd(lot)) return "Finalizada";
  if (offer.paused) return "Pausada";
  if (lot.availableQuantity <= 0) return "Agotada";
  return "Disponible";
}

export function lotUrgency(lot: Lot, now = Date.now()): "finalizada" | "pronto" | "en-plazo" {
  const remaining = effectiveEnd(lot) - now;
  return remaining <= 0 ? "finalizada" : remaining <= lot.alertMinutes * 60_000 ? "pronto" : "en-plazo";
}

export function remainingLabel(lot: Lot, now = Date.now()): string {
  const remaining = effectiveEnd(lot) - now;
  if (remaining <= 0) return "Plazo finalizado";
  const minutes = Math.ceil(remaining / 60_000);
  if (minutes < 60) return `Quedan ${minutes} min`;
  if (minutes < 1440) return `Quedan ${Math.floor(minutes / 60)} h${minutes % 60 >= 30 ? " y media" : ""}`;
  return `Hasta el ${dateLabel(new Date(effectiveEnd(lot)).toISOString())}`;
}

export function getOfferViews(state: DemoState, establishments: readonly Establishment[]): OfferView[] {
  return state.offers.flatMap((offer) => {
    const lot = state.lots.find((item) => item.id === offer.lotId);
    const establishment = establishments.find((item) => item.id === lot?.establishmentId);
    return lot && establishment ? [{ offer, lot, establishment }] : [];
  });
}

const newId = (prefix: string) => `${prefix}-${globalThis.crypto.randomUUID()}`;
function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new DemoError(message);
}

function addMovement(
  state: DemoState,
  data: Omit<Movement, "id" | "createdAt">,
  now: number,
): void {
  state.movements.unshift({ ...data, id: newId("mov"), createdAt: new Date(now).toISOString() });
}

function findOffer(state: DemoState, id: string) {
  const offer = state.offers.find((item) => item.id === id);
  const lot = state.lots.find((item) => item.id === offer?.lotId);
  if (!offer || !lot) throw new DemoError("No encontramos esta oferta. Vuelve al catálogo.");
  return { offer, lot };
}

export function validateLot(input: LotInput, now = Date.now()): void {
  ensure(input.name.trim().length >= 3 && input.name.trim().length <= 100, "Escribe un nombre de entre 3 y 100 caracteres.");
  ensure(input.description.trim().length >= 10 && input.description.trim().length <= 1200, "Describe el contenido y sus condiciones de conservación (10 a 1200 caracteres).");
  ensure(CATEGORIES.includes(input.category), "Selecciona una categoría válida.");
  ensure(UNITS.includes(input.unit), "Selecciona una unidad válida.");
  ensure(Number.isFinite(input.quantity) && input.quantity > 0 && input.quantity <= 10000, "La cantidad debe ser mayor que cero y no superar 10.000.");
  ensure(input.unit === "kg" || Number.isInteger(input.quantity), "Las porciones y unidades deben registrarse en números enteros.");
  ensure(Number.isFinite(input.regularPrice) && Number.isFinite(input.price) && input.regularPrice > input.price && input.price > 0 && input.regularPrice <= 100000, "El precio de oferta debe ser positivo y menor al precio habitual.");
  const entry = Date.parse(input.entryAt);
  const end = Date.parse(input.commercializationEndsAt);
  const startPickup = Date.parse(input.pickupStartsAt);
  const endPickup = Date.parse(input.pickupEndsAt);
  ensure([entry, end, startPickup, endPickup, foodDateEnd(input.foodDate)].every(Number.isFinite), "Revisa las fechas y los horarios.");
  ensure(entry <= now, "La fecha de ingreso no puede estar en el futuro.");
  ensure(end > now && endPickup > now, "El límite de comercialización y el retiro deben estar en el futuro.");
  ensure(entry <= startPickup && startPickup < endPickup && endPickup <= end, "El retiro debe comenzar después del ingreso y terminar dentro del plazo comercial.");
  ensure(end <= foodDateEnd(input.foodDate), "La oferta no puede superar la fecha alimentaria declarada.");
  ensure(input.dateType !== "Límite de oferta" || localDate(entry) === localDate(end), "Los alimentos del día deben comercializarse el mismo día de su ingreso.");
  ensure(Number.isFinite(input.alertMinutes) && input.alertMinutes > 0 && input.alertMinutes <= 43200, "Selecciona una anticipación de alerta válida.");
  ensure(input.suitabilityDeclared, "Debes respaldar la aptitud y las condiciones de conservación del alimento.");
}

/** Pure domain transition. The local demo deliberately makes no multi-user concurrency guarantee. */
export function transition(state: DemoState, action: DemoAction, now = Date.now()): DemoState {
  const next = structuredClone(state);
  const timestamp = new Date(now).toISOString();

  if (action.type === "select-establishment") {
    next.selectedEstablishmentId = action.establishmentId;
    return next;
  }

  if (action.type === "publish") {
    const input = action.input;
    validateLot(input, now);
    const lot: Lot = {
      id: newId("lot"), establishmentId: input.establishmentId,
      name: input.name.trim(), description: input.description.trim(), category: input.category,
      unit: input.unit, initialQuantity: quantity(input.quantity), availableQuantity: quantity(input.quantity),
      entryAt: input.entryAt, dateType: input.dateType, foodDate: input.foodDate,
      commercializationEndsAt: input.commercializationEndsAt, pickupStartsAt: input.pickupStartsAt,
      pickupEndsAt: input.pickupEndsAt, alertMinutes: input.alertMinutes, suitabilityDeclared: true,
    };
    const imageByCategory: Record<Category, string> = {
      "Cocina del día": "/images/bowl.webp", "Panadería": "/images/bread.webp",
      "Frutas y verduras": "/images/produce.webp", "Lácteos": "/images/yogurt.webp", "Despensa": "/images/pantry.webp",
    };
    next.lots.unshift(lot);
    next.offers.unshift({ id: newId("offer"), lotId: lot.id, regularPrice: input.regularPrice, price: input.price, image: imageByCategory[input.category], publishedAt: timestamp, paused: false });
    addMovement(next, { lotId: lot.id, reservationId: null, type: "Publicación", quantity: lot.initialQuantity, detail: `Se publicó ${lot.name}.` }, now);
    return next;
  }

  if (action.type === "reserve") {
    const { offer, lot } = findOffer(next, action.offerId);
    ensure(offerStatus(offer, lot, now) === "Disponible", "Esta oferta ya no está disponible.");
    ensure(Number.isFinite(action.quantity) && action.quantity > 0, "Selecciona una cantidad mayor que cero.");
    ensure(lot.unit === "kg" || Number.isInteger(action.quantity), "Selecciona una cantidad entera.");
    const amount = quantity(action.quantity);
    ensure(amount > 0 && amount <= lot.availableQuantity, "No hay existencias suficientes para esa cantidad.");
    lot.availableQuantity = quantity(lot.availableQuantity - amount);
    let code: string;
    do { code = `ECO-${globalThis.crypto.randomUUID().slice(0, 6).toUpperCase()}`; }
    while (next.reservations.some((item) => item.code === code));
    const reservation: Reservation = { id: newId("res"), code, offerId: offer.id, quantity: amount, unitPrice: offer.price, createdAt: timestamp, status: "Reservada", closedAt: null };
    next.reservations.unshift(reservation);
    addMovement(next, { lotId: lot.id, reservationId: reservation.id, type: "Reserva", quantity: amount, detail: `Reserva ${code} registrada.` }, now);
    return next;
  }

  if (action.type === "price" || action.type === "toggle-offer") {
    const { offer, lot } = findOffer(next, action.offerId);
    ensure(lot.establishmentId === action.establishmentId, "Esta oferta pertenece a otro establecimiento.");
    ensure(now < effectiveEnd(lot), "El plazo de esta oferta ya finalizó.");
    if (action.type === "price") {
      ensure(Number.isFinite(action.price) && action.price > 0 && action.price < offer.regularPrice, "El nuevo precio debe ser positivo y menor al precio habitual.");
      offer.price = Math.round(action.price * 100) / 100;
      addMovement(next, { lotId: lot.id, reservationId: null, type: "Cambio de precio", quantity: 0, detail: `Precio actualizado a ${money(offer.price)}. Las reservas existentes conservan su precio.` }, now);
    } else {
      offer.paused = !offer.paused;
    }
    return next;
  }

  if (action.type === "expire") {
    let changed = false;
    for (const reservation of next.reservations) {
      if (reservation.status !== "Reservada") continue;
      const { lot } = findOffer(next, reservation.offerId);
      if (now < effectiveEnd(lot)) continue;
      reservation.status = "No retirada";
      reservation.closedAt = timestamp;
      lot.availableQuantity = quantity(lot.availableQuantity + reservation.quantity);
      addMovement(next, { lotId: lot.id, reservationId: reservation.id, type: "Plazo finalizado", quantity: reservation.quantity, detail: `La reserva ${reservation.code} terminó sin retiro. La oferta permanece cerrada.` }, now);
      changed = true;
    }
    return changed ? next : state;
  }

  const reservation = next.reservations.find((item) => item.id === action.reservationId);
  ensure(reservation, "No encontramos esta reserva.");
  ensure(reservation.status === "Reservada", "Esta reserva ya está cerrada y no puede procesarse de nuevo.");
  const { lot } = findOffer(next, reservation.offerId);
  if (action.type === "collect") {
    ensure(lot.establishmentId === action.establishmentId, "La reserva pertenece a otro establecimiento.");
    ensure(now >= Date.parse(lot.pickupStartsAt), "El horario de retiro todavía no comenzó.");
    ensure(now < effectiveEnd(lot), "El plazo de retiro ya finalizó.");
    reservation.status = "Retirada";
    reservation.closedAt = timestamp;
    addMovement(next, { lotId: lot.id, reservationId: reservation.id, type: "Retiro", quantity: reservation.quantity, detail: `Retiro ${reservation.code} confirmado manualmente.` }, now);
  } else {
    reservation.status = "Cancelada";
    reservation.closedAt = timestamp;
    lot.availableQuantity = quantity(lot.availableQuantity + reservation.quantity);
    addMovement(next, { lotId: lot.id, reservationId: reservation.id, type: "Cancelación", quantity: reservation.quantity, detail: `Reserva ${reservation.code} cancelada.${now >= effectiveEnd(lot) ? " El plazo de la oferta ya terminó." : " Cantidad liberada."}` }, now);
  }
  return next;
}

export function parsePersistedState(raw: string, establishmentIds: readonly string[]): DemoState | null {
  try {
    const result = demoSchema.safeParse(JSON.parse(raw));
    if (!result.success) return null;
    const state = result.data;
    if (!establishmentIds.includes(state.selectedEstablishmentId)) return null;
    if (new Set(state.lots.map((item) => item.id)).size !== state.lots.length || new Set(state.offers.map((item) => item.id)).size !== state.offers.length || new Set(state.reservations.map((item) => item.id)).size !== state.reservations.length || new Set(state.reservations.map((item) => item.code)).size !== state.reservations.length) return null;
    for (const lot of state.lots) {
      if (!establishmentIds.includes(lot.establishmentId) || lot.availableQuantity > lot.initialQuantity || !Number.isFinite(foodDateEnd(lot.foodDate)) || (lot.unit !== "kg" && (!Number.isInteger(lot.initialQuantity) || !Number.isInteger(lot.availableQuantity)))) return null;
    }
    if (new Set(state.offers.map((item) => item.lotId)).size !== state.offers.length) return null;
    if (state.offers.some((offer) => !state.lots.some((lot) => lot.id === offer.lotId) || offer.price >= offer.regularPrice)) return null;
    if (state.reservations.some((reservation) => !state.offers.some((offer) => offer.id === reservation.offerId))) return null;
    if (state.movements.some((movement) => !state.lots.some((lot) => lot.id === movement.lotId))) return null;
    for (const lot of state.lots) {
      const offer = state.offers.find((item) => item.lotId === lot.id);
      const consumed = state.reservations.filter((item) => item.offerId === offer?.id && (item.status === "Reservada" || item.status === "Retirada")).reduce((total, item) => total + item.quantity, 0);
      if (Math.abs(quantity(consumed + lot.availableQuantity) - lot.initialQuantity) > 0.001) return null;
    }
    return state;
  } catch { return null; }
}

export interface UnitMetrics {
  unit: Unit;
  published: number;
  reserved: number;
  collected: number;
  cancelled: number;
  uncollected: number;
  proportion: number;
}

export function getMetrics(state: DemoState, options: { establishmentId?: string; since?: number } = {}): UnitMetrics[] {
  const lots = state.lots.filter((lot) => !options.establishmentId || lot.establishmentId === options.establishmentId);
  const offers = state.offers.filter((offer) => lots.some((lot) => lot.id === offer.lotId) && (!options.since || Date.parse(offer.publishedAt) >= options.since));
  return UNITS.map((unit) => {
    const unitLots = lots.filter((lot) => lot.unit === unit && offers.some((offer) => offer.lotId === lot.id));
    const offerIds = new Set(offers.filter((offer) => unitLots.some((lot) => lot.id === offer.lotId)).map((offer) => offer.id));
    const reservations = state.reservations.filter((item) => offerIds.has(item.offerId));
    const sum = (status: Reservation["status"]) => quantity(reservations.filter((item) => item.status === status).reduce((total, item) => total + item.quantity, 0));
    const published = quantity(unitLots.reduce((total, lot) => total + lot.initialQuantity, 0));
    const collected = sum("Retirada");
    return { unit, published, reserved: sum("Reservada"), collected, cancelled: sum("Cancelada"), uncollected: sum("No retirada"), proportion: published ? Math.round(collected / published * 1000) / 10 : 0 };
  }).filter((item) => item.published > 0);
}

export function reportCsv(metrics: UnitMetrics[], label: string, generatedAt = new Date().toISOString()): string {
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  return "\uFEFF" + [
    ["EcoRescate - DEMOSTRACIÓN - Datos simulados", label, generatedAt],
    ["Unidad", "Publicado", "Reserva pendiente", "Retirado", "Cancelado", "No retirado", "Proporción retirada (%)"],
    ...metrics.map((item) => [item.unit, item.published, item.reserved, item.collected, item.cancelled, item.uncollected, item.proportion]),
    ["Las cifras muestran operaciones simuladas. No demuestran reducción de desperdicio."],
  ].map((row) => row.map(escape).join(";")).join("\r\n");
}
