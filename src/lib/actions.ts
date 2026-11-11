"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CATEGORIES, DomainError, UNITS, categoryImages, validateLot, type LotInput, type Reservation, type SiteState } from "@/lib/domain";
import { getDb } from "@/lib/db/client";
import { toReservation } from "@/lib/db/mappers";
import { PANEL_COOKIE, VISITOR_COOKIE, loadState, type Area } from "@/lib/db/queries";

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
  z.object({ type: z.literal("reserve"), offerId: id, quantity: z.number().finite(), customerName: z.string().trim().min(2, "Escribe tu nombre para el retiro (2 a 80 caracteres).").max(80, "Escribe tu nombre para el retiro (2 a 80 caracteres).") }),
  z.object({ type: z.literal("cancel"), reservationId: id }),
  z.object({ type: z.literal("collect"), reservationId: id }),
  z.object({ type: z.literal("price"), offerId: id, price: z.number().finite() }),
  z.object({ type: z.literal("toggle-offer"), offerId: id }),
  z.object({ type: z.literal("select-establishment"), establishmentId: id }),
]);
export type Action = z.infer<typeof actionSchema>;

const GENERIC_ERROR = "No se pudo completar la operación. Inténtalo de nuevo.";

/** Messages raised by our SQL functions (code P0001) are written for people; anything else stays generic. */
function rpcError(error: { code?: string; message: string } | null): string | null {
  if (!error) return null;
  return error.code === "P0001" ? error.message : GENERIC_ERROR;
}

async function selectedEstablishment(): Promise<string> {
  const store = await cookies();
  const requested = store.get(PANEL_COOKIE)?.value;
  const { data, error } = await getDb().from("establishments").select("id").order("name");
  if (error || !data?.length) throw new DomainError("No hay establecimientos disponibles.");
  return data.some((row) => row.id === requested) ? requested! : data[0].id;
}

async function visitorToken(create: boolean): Promise<string | undefined> {
  const store = await cookies();
  const existing = store.get(VISITOR_COOKIE)?.value;
  if (existing || !create) return existing;
  const token = randomUUID();
  store.set(VISITOR_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return token;
}

/** Reloads the data for an area, e.g. to pick up other visitors' reservations. */
export async function refreshState(rawArea: Area): Promise<ActionResult> {
  const parsedArea = area.safeParse(rawArea);
  if (!parsedArea.success) return { ok: false, message: GENERIC_ERROR };
  try { return { ok: true, state: await loadState(parsedArea.data) }; }
  catch { return { ok: false, message: "No pudimos actualizar la información. Revisa tu conexión." }; }
}

export async function perform(rawArea: Area, rawAction: Action): Promise<ActionResult> {
  const parsedArea = area.safeParse(rawArea);
  const parsed = actionSchema.safeParse(rawAction);
  if (!parsedArea.success || !parsed.success) return { ok: false, message: parsed.error?.issues[0]?.message ?? GENERIC_ERROR };
  const action = parsed.data;
  const db = getDb();
  let reservation: Reservation | undefined;
  try {
    let message: string | null = null;
    switch (action.type) {
      case "publish": {
        const establishmentId = await selectedEstablishment();
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
        const token = await visitorToken(true);
        const { data, error } = await db.rpc("reserve_offer", { p_offer_id: action.offerId, p_quantity: action.quantity, p_customer_name: action.customerName, p_customer_token: token });
        message = rpcError(error);
        if (!message && data) reservation = toReservation(data as Record<string, unknown>, token);
        break;
      }
      case "cancel": {
        const panel = parsedArea.data !== "public";
        const { error } = await db.rpc("cancel_reservation", {
          p_reservation_id: action.reservationId,
          p_customer_token: await visitorToken(false) ?? null,
          p_establishment_id: panel ? await selectedEstablishment() : null,
        });
        message = rpcError(error);
        break;
      }
      case "collect": {
        const { error } = await db.rpc("collect_reservation", { p_reservation_id: action.reservationId, p_establishment_id: await selectedEstablishment() });
        message = rpcError(error);
        break;
      }
      case "price": {
        const { error } = await db.rpc("update_offer_price", { p_offer_id: action.offerId, p_establishment_id: await selectedEstablishment(), p_price: action.price });
        message = rpcError(error);
        break;
      }
      case "toggle-offer": {
        const { error } = await db.rpc("toggle_offer", { p_offer_id: action.offerId, p_establishment_id: await selectedEstablishment() });
        message = rpcError(error);
        break;
      }
      case "select-establishment": {
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

const applicationSchema = z.object({
  businessName: z.string().trim().min(2, "Escribe el nombre del establecimiento.").max(120),
  businessType: z.enum(["Restaurante", "Supermercado", "Otro"], { error: "Selecciona el tipo de establecimiento." }),
  zone: z.string().trim().min(2, "Indica la zona del establecimiento.").max(80),
  contactName: z.string().trim().min(2, "Escribe el nombre de la persona de contacto.").max(80),
  phone: z.string().trim().min(6, "Escribe un teléfono o WhatsApp de contacto.").max(30),
  email: z.union([z.literal(""), z.email("Revisa el correo electrónico.").max(160)]),
  message: z.string().trim().max(1500, "El mensaje puede tener hasta 1500 caracteres."),
});

const contactSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre.").max(80),
  email: z.email("Revisa el correo electrónico.").max(160),
  subject: z.string().trim().min(3, "Escribe un asunto.").max(120),
  message: z.string().trim().min(10, "Cuéntanos un poco más (al menos 10 caracteres).").max(2000),
});

export type FormState = { status: "idle" | "success" | "error"; message?: string };

const field = (data: FormData, name: string) => String(data.get(name) ?? "");

export async function submitApplication(_previous: FormState, data: FormData): Promise<FormState> {
  const parsed = applicationSchema.safeParse({
    businessName: field(data, "businessName"), businessType: field(data, "businessType"), zone: field(data, "zone"),
    contactName: field(data, "contactName"), phone: field(data, "phone"), email: field(data, "email").trim(), message: field(data, "message"),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };
  const value = parsed.data;
  const { error } = await getDb().from("business_applications").insert({
    business_name: value.businessName, business_type: value.businessType, zone: value.zone, contact_name: value.contactName,
    phone: value.phone, email: value.email || null, message: value.message || null,
  });
  if (error) return { status: "error", message: GENERIC_ERROR };
  revalidatePath("/admin/solicitudes");
  return { status: "success" };
}

export async function submitContact(_previous: FormState, data: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse({ name: field(data, "name"), email: field(data, "email").trim(), subject: field(data, "subject"), message: field(data, "message") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };
  const { error } = await getDb().from("contact_messages").insert(parsed.data);
  if (error) return { status: "error", message: GENERIC_ERROR };
  revalidatePath("/admin/mensajes");
  return { status: "success" };
}
