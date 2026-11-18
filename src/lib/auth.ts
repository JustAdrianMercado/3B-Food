import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "./db/client";
import { hashToken, newSessionToken } from "./password";
import { ROLES, type Role, type Viewer } from "./domain";

export const SESSION_COOKIE = "eco_session";
const SESSION_DAYS = 30;

/** The signed-in account for this request, or null. Cached per request. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = getDb();
  const { data: session } = await db.from("sessions").select("user_id, expires_at").eq("token_hash", hashToken(token)).maybeSingle();
  if (!session || Date.parse(session.expires_at) <= Date.now()) return null;
  const { data: user } = await db.from("users").select("id, name, email, role, establishment_id").eq("id", session.user_id).maybeSingle();
  if (!user || !ROLES.includes(user.role)) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role as Role, establishmentId: user.establishment_id ?? null };
});

export async function startSession(userId: string): Promise<void> {
  const token = newSessionToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const { error } = await getDb().from("sessions").insert({ token_hash: hashToken(token), user_id: userId, expires_at: expires.toISOString() });
  if (error) throw new Error(`No se pudo iniciar la sesión: ${error.message}`);
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await getDb().from("sessions").delete().eq("token_hash", hashToken(token));
  store.delete(SESSION_COOKIE);
}

/** Guards a page: sends visitors to the sign-in page and other roles to a page that explains the restriction. */
export async function requireViewer(roles: readonly Role[], next: string): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/ingresar?next=${encodeURIComponent(next)}`);
  if (!roles.includes(viewer.role)) redirect(`/ingresar?next=${encodeURIComponent(next)}&acceso=${roles[0]}`);
  return viewer;
}
