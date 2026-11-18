import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import type { Establishment, Reservation, Role, SiteState, Viewer } from "@/lib/domain";
import { getViewer } from "@/lib/auth";
import { getDb } from "./client";
import { ESTABLISHMENT_COLUMNS, LOT_COLUMNS, MOVEMENT_COLUMNS, OFFER_COLUMNS, RESERVATION_COLUMNS, toEstablishment, toLot, toMovement, toOffer, toReservation } from "./mappers";

/** Which part of the site is asking: decides how much reservation and history data is sent. */
export type Area = "public" | "panel" | "admin";

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

/** Whether the signed-in account may load or act on an area of the site. */
export function canUseArea(area: Area, viewer: Viewer | null): boolean {
  if (area === "panel") return viewer?.role === "establecimiento" || viewer?.role === "administrador";
  if (area === "admin") return viewer?.role === "administrador";
  return true;
}

/** Establishment accounts always manage their own; administrators choose one in the panel (saved in a cookie). */
export function managedEstablishment(viewer: Viewer | null, establishmentIds: string[], requested: string | undefined): string | null {
  if (viewer?.role === "establecimiento") return viewer.establishmentId;
  if (viewer?.role === "administrador") return establishmentIds.includes(requested ?? "") ? requested! : establishmentIds[0] ?? null;
  return null;
}

/**
 * Builds the state a page needs. Public pages only get the signed-in customer's own reservations and no history;
 * the business panel adds the managed establishment's reservations and movements; admin gets everything.
 */
export async function loadState(area: Area): Promise<SiteState> {
  await connection();
  const store = await cookies();
  const viewer = await getViewer();
  if (!canUseArea(area, viewer)) throw new Error("Acceso no autorizado.");
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

  const selectedEstablishmentId = managedEstablishment(viewer, establishments.map((item) => item.id), store.get(PANEL_COOKIE)?.value) ?? establishments[0]?.id ?? "";

  const reservations = new Map<string, Reservation>();
  const addReservations = (rows: Record<string, unknown>[]) => rows.forEach((row) => reservations.set(String(row.id), toReservation(row, viewer?.id)));
  if (viewer?.role === "consumidor") addReservations(check(await db.from("reservations").select(RESERVATION_COLUMNS).eq("user_id", viewer.id).order("created_at", { ascending: false }), "tus reservas"));

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
    viewer, establishments, selectedEstablishmentId, lots, offers,
    reservations: [...reservations.values()].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    movements,
  };
}

export interface ContactMessage { id: string; name: string; email: string; subject: string; message: string; createdAt: string }

export interface Account { id: string; name: string; email: string; phone: string | null; role: Role; establishment: string | null; createdAt: string; reservations: number }

export async function getAccounts(): Promise<Account[]> {
  await connection();
  const db = getDb();
  const [userRows, establishmentRows, reservationRows] = await Promise.all([
    db.from("users").select("id, name, email, phone, role, establishment_id, created_at").order("created_at", { ascending: false }).limit(1000),
    db.from("establishments").select("id, name"),
    db.from("reservations").select("user_id").not("user_id", "is", null).limit(10000),
  ]);
  const names = new Map(check(establishmentRows, "los establecimientos").map((row) => [row.id as string, row.name as string]));
  const counts = new Map<string, number>();
  for (const row of check(reservationRows, "las reservas")) counts.set(row.user_id as string, (counts.get(row.user_id as string) ?? 0) + 1);
  return check(userRows, "las cuentas").map((row) => ({
    id: row.id, name: row.name, email: row.email, phone: row.phone ?? null, role: row.role as Role,
    establishment: row.establishment_id ? names.get(row.establishment_id) ?? null : null,
    createdAt: new Date(row.created_at).toISOString(), reservations: counts.get(row.id) ?? 0,
  }));
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  await connection();
  const rows = check(await getDb().from("contact_messages").select("*").order("created_at", { ascending: false }).limit(500), "los mensajes");
  return rows.map((row) => ({ id: row.id, name: row.name, email: row.email, subject: row.subject, message: row.message, createdAt: new Date(row.created_at).toISOString() }));
}
