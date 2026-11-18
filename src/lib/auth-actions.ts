"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ZONES, roleHome, type Role } from "@/lib/domain";
import { endSession, startSession } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { hashPassword, verifyPassword } from "@/lib/password";

/** `values` returns what the person typed so the form can keep it after an error. */
export type AuthState = { error?: string; values?: Record<string, string> };

const GENERIC_ERROR = "No pudimos completar el registro. Inténtalo de nuevo.";
const email = z.string().trim().toLowerCase().pipe(z.email("Revisa el correo electrónico.").max(160, "Revisa el correo electrónico."));
const password = z.string().min(8, "La contraseña debe tener al menos 8 caracteres.").max(72, "La contraseña puede tener hasta 72 caracteres.");
const personName = z.string().trim().min(2, "Escribe tu nombre (2 a 80 caracteres).").max(80, "Escribe tu nombre (2 a 80 caracteres).");
const phone = z.string().trim().min(6, "Escribe un teléfono o WhatsApp de contacto.").max(30, "Revisa el teléfono.");

/** Only same-site paths, so the sign-in form cannot be used to send people elsewhere. */
function safeNext(value: unknown, role: Role): string {
  const next = typeof value === "string" ? value : "";
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/ingresar") || next.startsWith("/registro")) return roleHome(role);
  if (role === "consumidor" && (next.startsWith("/panel") || next.startsWith("/admin"))) return roleHome(role);
  if (role === "establecimiento" && next.startsWith("/admin")) return roleHome(role);
  return next;
}

async function emailTaken(address: string): Promise<boolean> {
  const { data } = await getDb().from("users").select("id").eq("email", address).maybeSingle();
  return Boolean(data);
}

export async function login(_previous: AuthState, data: FormData): Promise<AuthState> {
  const parsed = z.object({ email, password: z.string().min(1, "Escribe tu contraseña.").max(200) }).safeParse({ email: data.get("email"), password: data.get("password") });
  const values = { email: String(data.get("email") ?? "") };
  if (!parsed.success) return { error: parsed.error.issues[0].message, values };
  const { data: user } = await getDb().from("users").select("id, role, password_hash").eq("email", parsed.data.email).maybeSingle();
  if (!user || !(await verifyPassword(parsed.data.password, user.password_hash))) return { error: "El correo o la contraseña no coinciden.", values };
  await startSession(user.id);
  revalidatePath("/", "layout");
  redirect(safeNext(data.get("next"), user.role as Role));
}

export async function logout(data: FormData): Promise<void> {
  await endSession();
  revalidatePath("/", "layout");
  const target = String(data.get("redirectTo") ?? "");
  redirect(target.startsWith("/") && !target.startsWith("//") ? target : "/");
}

export async function registerCustomer(_previous: AuthState, data: FormData): Promise<AuthState> {
  const parsed = z.object({ name: personName, email, password }).safeParse({ name: data.get("name"), email: data.get("email"), password: data.get("password") });
  const values = { name: String(data.get("name") ?? ""), email: String(data.get("email") ?? "") };
  if (!parsed.success) return { error: parsed.error.issues[0].message, values };
  if (await emailTaken(parsed.data.email)) return { error: "Ya existe una cuenta con ese correo. Ingresa con tu contraseña.", values };
  const { data: user, error } = await getDb().from("users")
    .insert({ name: parsed.data.name, email: parsed.data.email, password_hash: await hashPassword(parsed.data.password), role: "consumidor" })
    .select("id").single();
  if (error || !user) return { error: GENERIC_ERROR, values };
  await startSession(user.id);
  revalidatePath("/", "layout");
  redirect(safeNext(data.get("next"), "consumidor"));
}

const businessSchema = z.object({
  businessName: z.string().trim().min(3, "Escribe el nombre del establecimiento (3 a 80 caracteres).").max(80, "Escribe el nombre del establecimiento (3 a 80 caracteres)."),
  businessType: z.enum(["Restaurante", "Supermercado"], { error: "Selecciona si es restaurante o supermercado." }),
  zone: z.enum(ZONES, { error: "Selecciona la zona del establecimiento." }),
  address: z.string().trim().min(5, "Escribe la dirección del local.").max(140, "La dirección puede tener hasta 140 caracteres."),
  openingHours: z.string().trim().min(5, "Indica los días y el horario de atención.").max(100, "El horario puede tener hasta 100 caracteres."),
  description: z.string().trim().min(20, "Describe tu negocio en al menos 20 caracteres.").max(400, "La descripción puede tener hasta 400 caracteres."),
  contactName: personName, phone, email, password,
});
export type BusinessInput = z.input<typeof businessSchema>;

const COLORS = ["#e5b07b", "#a9bf94", "#d7bd76", "#d7a797", "#c9a98b", "#e0b49a", "#b7c4a0", "#cdbf86"];
const slugify = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "local";
const initials = (value: string) => value.split(/\s+/).filter((word) => word.length > 2 || /^[A-ZÁÉÍÓÚÑ]/.test(word)).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || value.slice(0, 2).toUpperCase();

/** Creates the establishment and its account in one step, then opens the business panel. */
export async function registerBusiness(input: BusinessInput): Promise<AuthState> {
  const parsed = businessSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const value = parsed.data;
  if (await emailTaken(value.email)) return { error: "Ya existe una cuenta con ese correo. Ingresa con tu contraseña." };
  const db = getDb();
  const base = slugify(value.businessName);
  const { data: existing } = await db.from("establishments").select("slug").like("slug", `${base}%`);
  const used = new Set((existing ?? []).map((row) => row.slug as string));
  let slug = base;
  for (let index = 2; used.has(slug); index++) slug = `${base}-${index}`;
  const establishmentId = `est-${slug}`;
  const { error: establishmentError } = await db.from("establishments").insert({
    id: establishmentId, slug, name: value.businessName, type: value.businessType, zone: value.zone, address: `${value.address}, zona ${value.zone}, Cochabamba`,
    description: value.description, opening_hours: value.openingHours, initials: initials(value.businessName), color: COLORS[used.size % COLORS.length],
  });
  if (establishmentError) return { error: GENERIC_ERROR };
  const { data: user, error } = await db.from("users").insert({
    name: value.contactName, email: value.email, phone: value.phone, password_hash: await hashPassword(value.password), role: "establecimiento", establishment_id: establishmentId,
  }).select("id").single();
  if (error || !user) {
    await db.from("establishments").delete().eq("id", establishmentId);
    return { error: GENERIC_ERROR };
  }
  await startSession(user.id);
  revalidatePath("/", "layout");
  redirect("/panel");
}
