import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, HelpCircle, MapPin } from "lucide-react";
import { PageHeading } from "@/components/ui";
import { ContactForm } from "@/components/public-forms";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos con tus dudas, sugerencias o consultas sobre EcoRescate Cochabamba.",
};

export default function Page() {
  return <div className="container content-page">
    <PageHeading eyebrow="CONTACTO" title="Hablemos." description="¿Tienes una duda, una sugerencia o encontraste un problema? Escríbenos y te responderemos lo antes posible." />
    <div className="form-layout">
      <ContactForm />
      <aside className="content-callout"><HelpCircle size={28} strokeWidth={1.5} /><b>Antes de escribir</b><p>Muchas respuestas sobre reservas, retiros y pagos ya están en nuestras preguntas frecuentes.</p><Link className="text-link" href="/preguntas-frecuentes">Ver preguntas frecuentes<ArrowUpRight size={15} /></Link><p className="callout-meta"><MapPin size={14} />Cochabamba, Bolivia</p></aside>
    </div>
  </div>;
}
