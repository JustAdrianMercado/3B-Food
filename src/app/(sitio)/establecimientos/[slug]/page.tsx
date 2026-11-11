import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, MapPin, ShieldCheck, Store } from "lucide-react";
import { getEstablishmentBySlug } from "@/lib/db/queries";
import { EstablishmentOffers } from "@/components/offer-catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const establishment = await getEstablishmentBySlug(slug);
  if (!establishment) return { title: "Establecimiento no encontrado" };
  return { title: establishment.name, description: `${establishment.type} en ${establishment.zone}, Cochabamba. ${establishment.description}` };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const establishment = await getEstablishmentBySlug(slug);
  if (!establishment) notFound();
  return <div className="container content-page">
    <nav className="breadcrumbs" aria-label="Ruta de navegación"><Link href="/establecimientos"><ArrowLeft size={14} />Establecimientos</Link><span>/</span><span>{establishment.zone}</span></nav>
    <section className="place-hero">
      <span className="vendor-avatar place-hero-avatar" style={{ backgroundColor: establishment.color }}>{establishment.initials}</span>
      <div>
        <span className="eyebrow">{establishment.type.toUpperCase()} · {establishment.zone.toUpperCase()}</span>
        <h1>{establishment.name}</h1>
        <p>{establishment.description}</p>
      </div>
      <dl className="place-facts">
        <div><dt><MapPin size={16} />Dirección</dt><dd>{establishment.address}</dd></div>
        <div><dt><Clock3 size={16} />Horario de atención</dt><dd>{establishment.openingHours}</dd></div>
        <div><dt><Store size={16} />Retiro</dt><dd>Presencial, dentro del horario indicado en cada oferta.</dd></div>
      </dl>
    </section>
    <section className="content-section" aria-labelledby="place-offers">
      <h2 id="place-offers">Ofertas disponibles</h2>
      <p>Reserva en línea y retira en el local. El pago se acuerda directamente con el establecimiento.</p>
      <EstablishmentOffers establishmentId={establishment.id} />
    </section>
    <div className="note-box"><ShieldCheck size={18} /><span>{establishment.name} respalda la aptitud para el consumo y las condiciones de conservación de cada alimento que publica. Consulta alérgenos e indicaciones al retirar.</span></div>
  </div>;
}
