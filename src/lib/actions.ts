"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CATEGORIES, DomainError, UNITS, categoryImages, validateLot, type LotInput, type Reservation, type SiteState, type Viewer } from "@/lib/domain";
import { getViewer } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { toReservation } from "@/lib/db/mappers";
import { PANEL_COOKIE, canUseArea, loadState, managedEstablishment, type Area } from "@/lib/db/queries";

export type ActionResult = { ok: true; state: SiteState; reservation?: Reservation } | { ok: false; message: string };

const id = z.string().trim().min(1).max(120);
const area = z.enum(["public", "panel", "admin"]);
const iso = z.string().datetime();

const lotInput = z.object({
  establishmentId: z.string(), name: z.string().max(200), description: z.string().max(2000),
  category: z.enum(CATEGORIES), quantity: z.number().finite(), unit: z.enum(UNITS),
  regularPrice: z.number().finite(), price: z.number().finite(), entryAt: iso,
  dateType: z.enum(["Límite de oferta", "Consumo preferente", "Vencimiento"]), foodDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  commercializationEndsAt: iso, pickupStartsAt: iso, pickupEndsAt: iso, alertMinutes: z.number().int(), suitabilityDeclared: z.boolean(),
});

const actionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("publish"), input: lotInput }),
  z.object({ type: z.literal("reserve"), offerId: id, quantity: z.number().finite() }),
  z.object({ type: z.literal("cancel"), reservationId: id }),
  z.object({ type: z.literal("collect"), reservationId: id }),
  z.object({ type: z.literal("price"), offerId: id, price: z.number().finite() }),
  z.object({ type: z.literal("toggle-offer"), offerId: id }),
  z.object({ type: z.literal("select-establishment"), establishmentId: id }),
]);
export type Action = z.infer<typeof actionSchema>;

const GENERIC_ERROR = "No se pudo completar la operación. Inténtalo de nuevo.";
const NO_ACCESS = "Tu sesión no tiene permiso para esta operación. Vuelve a ingresar.";

/** Messages raised by our SQL functions (code P0001) are written for people; anything else stays generic. */
function rpcError(error: { code?: string; message: string } | null): string | null {
  if (!error) return null;
  return error.code === "P0001" ? error.message : GENERIC_ERROR;
}

async function selectedEstablishment(viewer: Viewer | null): Promise<string> {
  const store = await cookies();
  const { data, error } = await getDb().from("establishments").select("id").order("name");
  if (error || !data?.length) throw new DomainError("No hay establecimientos disponibles.");
  const establishment = managedEstablishment(viewer, data.map((row) => row.id as string), store.get(PANEL_COOKIE)?.value);
  if (!establishment) throw new DomainError("Ingresa con una cuenta de establecimiento para gestionar ofertas.");
  return establishment;
}

/** Reloads the data for an area, e.g. to pick up other customers' reservations. */
export async function refreshState(rawArea: Area): Promise<ActionResult> {
  const parsedArea = area.safeParse(rawArea);
  if (!parsedArea.success) return { ok: false, message: GENERIC_ERROR };
  try {
    if (!canUseArea(parsedArea.data, await getViewer())) return { ok: false, message: NO_ACCESS };
    return { ok: true, state: await loadState(parsedArea.data) };
  } catch { return { ok: false, message: "No pudimos actualizar la información. Revisa tu conexión." }; }
}

export async function perform(rawArea: Area, rawAction: Action): Promise<ActionResult> {
  const parsedArea = area.safeParse(rawArea);
  const parsed = actionSchema.safeParse(rawAction);
  if (!parsedArea.success || !parsed.success) return { ok: false, message: parsed.error?.issues[0]?.message ?? GENERIC_ERROR };
  const action = parsed.data;
  const db = getDb();
  let reservation: Reservation | undefined;
  try {
    const viewer = await getViewer();
    if (!canUseArea(parsedArea.data, viewer)) return { ok: false, message: NO_ACCESS };
    let message: string | null = null;
    switch (action.type) {
      case "publish": {
        const establishmentId = await selectedEstablishment(viewer);
        const input: LotInput = { ...action.input, establishmentId };
        validateLot(input);
        const { error } = await db.rpc("publish_lot", {
          p_establishment_id: establishmentId, p_name: input.name, p_description: input.description, p_category: input.category, p_unit: input.unit,
          p_quantity: input.quantity, p_regular_price: input.regularPrice, p_price: input.price, p_image: categoryImages[input.category],
          p_entry_at: input.entryAt, p_date_type: input.dateType, p_food_date: input.foodDate, p_commercialization_ends_at: input.commercializationEndsAt,
          p_pickup_starts_at: input.pickupStartsAt, p_pickup_ends_at: input.pickupEndsAt, p_alert_minutes: input.alertMinutes,
        });
        message = rpcError(error);
        break;
      }
      case "reserve": {
        if (viewer?.role !== "consumidor") { message = viewer ? "Las reservas se hacen con una cuenta de cliente." : "Inicia sesión para reservar."; break; }
        const { data, error } = await db.rpc("reserve_offer", { p_offer_id: action.offerId, p_quantity: action.quantity, p_user_id: viewer.id });
        message = rpcError(error);
        if (!message && data) reservation = toReservation(data as Record<string, unknown>, viewer.id);
        break;
      }
      case "cancel": {
        const panel = parsedArea.data !== "public";
        if (!panel && !viewer) { message = "Inicia sesión para gestionar tus reservas."; break; }
        const { error } = await db.rpc("cancel_reservation", {
          p_reservation_id: action.reservationId,
          p_user_id: panel ? null : viewer!.id,
          p_establishment_id: panel ? await selectedEstablishment(viewer) : null,
        });
        message = rpcError(error);
        break;
      }
      case "collect": {
        const { error } = await db.rpc("collect_reservation", { p_reservation_id: action.reservationId, p_establishment_id: await selectedEstablishment(viewer) });
        message = rpcError(error);
        break;
      }
      case "price": {
        const { error } = await db.rpc("update_offer_price", { p_offer_id: action.offerId, p_establishment_id: await selectedEstablishment(viewer), p_price: action.price });
        message = rpcError(error);
        break;
      }
      case "toggle-offer": {
        const { error } = await db.rpc("toggle_offer", { p_offer_id: action.offerId, p_establishment_id: await selectedEstablishment(viewer) });
        message = rpcError(error);
        break;
      }
      case "select-establishment": {
        if (viewer?.role !== "administrador") { message = NO_ACCESS; break; }
        const { data } = await db.from("establishments").select("id").eq("id", action.establishmentId).maybeSingle();
        if (!data) { message = "El establecimiento no existe."; break; }
        (await cookies()).set(PANEL_COOKIE, action.establishmentId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 180 });
        break;
      }
    }
    if (message) return { ok: false, message };
    revalidatePath("/", "layout");
    return { ok: true, state: await loadState(parsedArea.data), reservation };
  } catch (error) {
    return { ok: false, message: error instanceof DomainError ? error.message : GENERIC_ERROR };
  }
}

const contactSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre.").max(80),
  email: z.email("Revisa el correo electrónico.").max(160),
  subject: z.string().trim().min(3, "Escribe un asunto.").max(120),
  message: z.string().trim().min(10, "Cuéntanos un poco más (al menos 10 caracteres).").max(2000),
});

export type FormState = { status: "idle" | "success" | "error"; message?: string };

const field = (data: FormData, name: string) => String(data.get(name) ?? "");

export async function submitContact(_previous: FormState, data: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse({ name: field(data, "name"), email: field(data, "email").trim(), subject: field(data, "subject"), message: field(data, "message") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };
  const { error } = await getDb().from("contact_messages").insert(parsed.data);
  if (error) return { status: "error", message: GENERIC_ERROR };
  revalidatePath("/admin/mensajes");
  return { status: "success" };
}
