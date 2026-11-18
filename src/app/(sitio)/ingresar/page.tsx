import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, ShieldCheck, ShoppingBag, Store } from "lucide-react";
import { LoginForm } from "@/components/auth-forms";
import { LogoutButton } from "@/components/account-menu";
import { getViewer } from "@/lib/auth";
import { ROLES, roleHome, roleLabel, type Role } from "@/lib/domain";

export const metadata: Metadata = { title: "Ingresar", description: "Ingresa a tu cuenta de EcoRescate para reservar ofertas o gestionar tu establecimiento." };

const required: Record<Role, string> = {
  consumidor: "una cuenta de cliente",
  establecimiento: "una cuenta de establecimiento",
  administrador: "una cuenta de administración",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; acceso?: string }> }) {
  const { next, acceso } = await searchParams;
  const viewer = await getViewer();
  const access = ROLES.find((role) => role === acceso);
  if (viewer && !access) redirect(roleHome(viewer.role));
  return <div className="container auth-page">
    <section className="auth-card">
      <span className="eyebrow">TU CUENTA ECORESCATE</span>
      <h1>Qué bueno verte de nuevo.</h1>
      <p className="auth-lead">Ingresa para reservar ofertas o, si tienes un negocio, para gestionar tus ofertas y entregas.</p>
      {viewer && access ? <div className="auth-notice" role="status">
        <ShieldCheck size={20} />
        <div><b>Esta sección requiere {required[access]}.</b><p>Ingresaste como <strong>{viewer.name}</strong> ({roleLabel[viewer.role]}). Cierra sesión para ingresar con otra cuenta.</p>
          <div className="auth-notice-actions"><Link href={roleHome(viewer.role)} className="btn btn-secondary btn-small">Volver a mi espacio</Link><LogoutButton className="btn btn-primary btn-small" redirectTo={next ? `/ingresar?next=${encodeURIComponent(next)}` : "/ingresar"} /></div></div>
      </div> : <LoginForm next={next} />}
    </section>
    <aside className="auth-aside">
      <div><ShoppingBag size={22} strokeWidth={1.6} /><b>¿Quieres reservar?</b><p>Crea tu cuenta de cliente en menos de un minuto: nombre, correo y contraseña.</p><Link className="text-link" href={next ? `/registro?next=${encodeURIComponent(next)}` : "/registro"}>Crear cuenta de cliente<ArrowUpRight size={15} /></Link></div>
      <div><Store size={22} strokeWidth={1.6} /><b>¿Tienes un restaurante o supermercado?</b><p>Registra tu establecimiento y publica tu primera oferta hoy mismo.</p><Link className="text-link" href="/negocios/unirse">Registrar mi negocio<ArrowUpRight size={15} /></Link></div>
    </aside>
  </div>;
}
