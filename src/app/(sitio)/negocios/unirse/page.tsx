import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock3, Phone, Store } from "lucide-react";
import { PageHeading } from "@/components/ui";
import { ApplicationForm } from "@/components/public-forms";

export const metadata: Metadata = {
  title: "Quiero unirme",
  description: "Suma tu restaurante o supermercado de Cochabamba a EcoRescate y publica tus excedentes.",
};

export default function Page() {
  return <div className="container content-page">
    <nav className="breadcrumbs" aria-label="Ruta de navegación"><Link href="/negocios"><ArrowLeft size={14} />Para negocios</Link></nav>
    <PageHeading eyebrow="SUMA TU ESTABLECIMIENTO" title="Empecemos a aprovechar tus excedentes." description="Cuéntanos sobre tu restaurante o supermercado. Te contactaremos para conocer tus productos, tus horarios y ayudarte a publicar tu primera oferta." />
    <div className="form-layout">
      <ApplicationForm />
      <aside className="content-callout"><Store size={28} strokeWidth={1.5} /><b>¿Qué sigue?</b><ul className="next-steps"><li><Phone size={15} />Te llamamos para conocer tu establecimiento.</li><li><Clock3 size={15} />Definimos juntos tus horarios de retiro.</li><li><Store size={15} />Creamos tu página y publicas tu primera oferta.</li></ul></aside>
    </div>
  </div>;
}
