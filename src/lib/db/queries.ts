import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import type { Establishment, Reservation, SiteState } from "@/lib/domain";
import { getDb } from "./client";
import { ESTABLISHMENT_COLUMNS, LOT_COLUMNS, MOVEMENT_COLUMNS, OFFER_COLUMNS, RESERVATION_COLUMNS, toEstablishment, toLot, toMovement, toOffer, toReservation } from "./mappers";

/** Which part of the site is asking: decides how much reservation and history data is sent. */
export type Area = "public" | "panel" | "admin";

export const VISITOR_COOKIE = "eco_cid";
export const PANEL_COOKIE = "eco_panel_est";

function check<T>(result: { data: T | null; error: { message: string } | null }, what: string): T {
  if (result.error) throw new Error(`No se pudo leer ${what}: ${result.error.message}`);
  return result.data as T;
}

export async function getEstablishments(): Promise<Establishment[]> {
  await connection();
  const rows = check(await getDb().from("establishments").select(ESTABLISHMENT_COLUMNS).order("name"), "los establecimientos");
  return rows.map(toEstablishment);
}

export async function getEstablishmentBySlug(slug: string): Promise<Establishment | null> {
  await connection();
  const row = check(await getDb().from("establishments").select(ESTABLISHMENT_COLUMNS).eq("slug", slug).maybeSingle(), "el establecimiento");
  return row ? toEstablishment(row) : null;
}

export async function getOfferSummary(id: string): Promise<{ name: string; description: string; establishment: string } | null> {
  await connection();
  const offer = check<{ lot_id: string } | null>(await getDb().from("offers").select("lot_id").eq("id", id).maybeSingle(), "la oferta");
  if (!offer) return null;
  const lot = check<{ name: string; description: string; establishment_id: string } | null>(await getDb().from("lots").select("name, description, establishment_id").eq("id", offer.lot_id).maybeSingle(), "el lote");
  if (!lot) return null;
  const establishment = check<{ name: string } | null>(await getDb().from("establishments").select("name").eq("id", lot.establishment_id).maybeSingle(), "el establecimiento");
  return { name: lot.name, description: lot.description, establishment: establishment?.name ?? "" };
}

/** Time of the current request, so client clocks start from the same instant the data was read. */
export async function requestTime(): Promise<number> {
  await connection();
  return Date.now();
}

/** Closes reservations whose pickup period ended. Idempotent and safe to call on every read. */
export async function expireReservations(): Promise<void> {
  const { error } = await getDb().rpc("expire_reservations");
  if (error) throw new Error(`No se pudieron actualizar las reservas vencidas: ${error.message}`);
}

/**
 * Builds the state a page needs. Public pages only get the visitor's own reservations and no history;
 * the business panel adds the selected establishment's reservations and movements; admin gets everything.
 * Visitor tokens never leave the server.
 */
export async function loadState(area: Area): Promise<SiteState> {
  await connection();
  const store = await cookies();
  const token = store.get(VISITOR_COOKIE)?.value;
  const db = getDb();
  await expireReservations();

  const [establishmentRows, lotRows, offerRows] = await Promise.all([
    db.from("establishments").select(ESTABLISHMENT_COLUMNS).order("name"),
    db.from("lots").select(LOT_COLUMNS),
    db.from("offers").select(OFFER_COLUMNS).order("published_at", { ascending: false }).order("id"),
  ]);
  const establishments = check(establishmentRows, "los establecimientos").map(toEstablishment);
  const lots = check(lotRows, "los lotes").map(toLot);
  const offers = check(offerRows, "las ofertas").map(toOffer);

  const requested = store.get(PANEL_COOKIE)?.value;
  const selectedEstablishmentId = establishments.some((item) => item.id === requested) ? requested! : establishments[0]?.id ?? "";

  const reservations = new Map<string, Reservation>();
  const addReservations = (rows: Record<string, unknown>[]) => rows.forEach((row) => reservations.set(String(row.id), toReservation(row, token)));
  if (token) addReservations(check(await db.from("reservations").select(RESERVATION_COLUMNS).eq("customer_token", token).order("created_at", { ascending: false }), "tus reservas"));

  let movements: SiteState["movements"] = [];
  if (area === "panel") {
    const lotIds = lots.filter((lot) => lot.establishmentId === selectedEstablishmentId).map((lot) => lot.id);
    const offerIds = offers.filter((offer) => lotIds.includes(offer.lotId)).map((offer) => offer.id);
    if (offerIds.length) addReservations(check(await db.from("reservations").select(RESERVATION_COLUMNS).in("offer_id", offerIds).order("created_at", { ascending: false }), "las reservas del establecimiento"));
    if (lotIds.length) movements = check(await db.from("movements").select(MOVEMENT_COLUMNS).in("lot_id", lotIds).order("created_at", { ascending: false }).limit(1000), "el historial").map(toMovement);
  } else if (area === "admin") {
    addReservations(check(await db.from("reservations").select(RESERVATION_COLUMNS).order("created_at", { ascending: false }).limit(5000), "las reservas"));
    movements = check(await db.from("movements").select(MOVEMENT_COLUMNS).order("created_at", { ascending: false }).limit(1000), "el historial").map(toMovement);
  }

  return {
    establishments, selectedEstablishmentId, lots, offers,
    reservations: [...reservations.values()].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    movements,
  };
}

export interface BusinessApplication { id: string; businessName: string; businessType: string; zone: string; contactName: string; phone: string; email: string | null; message: string | null; createdAt: string }
export interface ContactMessage { id: string; name: string; email: string; subject: string; message: string; createdAt: string }

export async function getBusinessApplications(): Promise<BusinessApplication[]> {
  await connection();
  const rows = check(await getDb().from("business_applications").select("*").order("created_at", { ascending: false }).limit(500), "las solicitudes");
  return rows.map((row) => ({ id: row.id, businessName: row.business_name, businessType: row.business_type, zone: row.zone, contactName: row.contact_name, phone: row.phone, email: row.email, message: row.message, createdAt: new Date(row.created_at).toISOString() }));
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  await connection();
  const rows = check(await getDb().from("contact_messages").select("*").order("created_at", { ascending: false }).limit(500), "los mensajes");
  return rows.map((row) => ({ id: row.id, name: row.name, email: row.email, subject: row.subject, message: row.message, createdAt: new Date(row.created_at).toISOString() }));
}
