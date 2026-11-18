import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Check, Store } from "lucide-react";
import { CustomerSignupForm } from "@/components/auth-forms";
import { getViewer } from "@/lib/auth";
import { roleHome } from "@/lib/domain";

export const metadata: Metadata = { title: "Crear cuenta", description: "Crea tu cuenta de EcoRescate para reservar excedentes de restaurantes y supermercados de Cochabamba." };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const viewer = await getViewer();
  if (viewer) redirect(roleHome(viewer.role));
  return <div className="container auth-page">
    <section className="auth-card">
      <span className="eyebrow">CUENTA DE CLIENTE</span>
      <h1>Empieza a rescatar cosas buenas.</h1>
      <p className="auth-lead">Solo necesitas tres datos. Con tu cuenta reservas, guardas tus códigos de retiro y consultas tu historial.</p>
      <CustomerSignupForm next={next} />
    </section>
    <aside className="auth-aside">
      <div><Check size={22} strokeWidth={1.6} /><b>Sin pagos en línea</b><p>Reservas aquí y pagas directamente en el local cuando retiras.</p></div>
      <div><Store size={22} strokeWidth={1.6} /><b>¿Eres un negocio?</b><p>Las cuentas de establecimiento tienen su propio registro, con los datos de tu local.</p><Link className="text-link" href="/negocios/unirse">Registrar mi negocio<ArrowUpRight size={15} /></Link></div>
    </aside>
  </div>;
}
