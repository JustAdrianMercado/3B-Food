import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ClipboardList, LayoutDashboard, Store } from "lucide-react";
import { PageHeading } from "@/components/ui";
import { BusinessSignupForm } from "@/components/public-forms";

export const metadata: Metadata = {
  title: "Registra tu negocio",
  description: "Registra tu restaurante o supermercado de Cochabamba en EcoRescate y publica tus excedentes.",
};

export default function Page() {
  return <div className="container content-page">
    <nav className="breadcrumbs" aria-label="Ruta de navegación"><Link href="/negocios"><ArrowLeft size={14} />Para negocios</Link></nav>
    <PageHeading eyebrow="SUMA TU ESTABLECIMIENTO" title="Empecemos a aprovechar tus excedentes." description="Tres pasos cortos: los datos de tu local, tu horario y tu cuenta. Al terminar entras directo a tu panel." />
    <div className="form-layout">
      <BusinessSignupForm />
      <aside className="content-callout"><Store size={28} strokeWidth={1.5} /><b>¿Qué sigue?</b><ul className="next-steps"><li><LayoutDashboard size={15} />Entras a tu panel con tu correo y contraseña.</li><li><ClipboardList size={15} />Registras un lote y publicas tu primera oferta.</li><li><Store size={15} />Confirmas los retiros con el código del cliente.</li></ul><p>¿Ya tienes cuenta? <Link className="text-link" href="/ingresar?next=%2Fpanel">Ingresa a tu panel</Link></p></aside>
    </div>
  </div>;
}
