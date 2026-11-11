import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock3, MapPin } from "lucide-react";
import { ZONES } from "@/lib/domain";
import { getEstablishments } from "@/lib/db/queries";
import { PageHeading } from "@/components/ui";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Establecimientos",
  description: "Restaurantes y supermercados de Cochabamba que publican sus excedentes en EcoRescate.",
};

const TYPES = ["Restaurante", "Supermercado"] as const;

export default async function Page({ searchParams }: { searchParams: Promise<{ zona?: string; tipo?: string }> }) {
  const { zona, tipo } = await searchParams;
  const establishments = await getEstablishments();
  const zone = ZONES.find((item) => item === zona);
  const type = TYPES.find((item) => item === tipo);
  const visible = establishments.filter((item) => (!zone || item.zone === zone) && (!type || item.type === type));
  const href = (next: { zona?: string; tipo?: string }) => {
    const params = new URLSearchParams();
    const z = "zona" in next ? next.zona : zone;
    const t = "tipo" in next ? next.tipo : type;
    if (z) params.set("zona", z);
    if (t) params.set("tipo", t);
    const query = params.toString();
    return query ? `/establecimientos?${query}` : "/establecimientos";
  };
  return <div className="container content-page">
    <PageHeading eyebrow="LOCALES DE COCHABAMBA" title="Quienes dan otra oportunidad a la comida." description="Conoce a los restaurantes y supermercados que publican sus excedentes. Cada uno define sus horarios de retiro y respalda la calidad de lo que ofrece." />
    <div className="filter-chips" role="group" aria-label="Filtrar por tipo"><Link href={href({ tipo: undefined })} className={cn("chip", !type && "chip--selected")} aria-current={!type ? "true" : undefined}>Todos</Link>{TYPES.map((item) => <Link key={item} href={href({ tipo: item })} className={cn("chip", type === item && "chip--selected")} aria-current={type === item ? "true" : undefined}>{item === "Restaurante" ? "Restaurantes" : "Supermercados"}</Link>)}</div>
    <div className="filter-chips" role="group" aria-label="Filtrar por zona"><Link href={href({ zona: undefined })} className={cn("chip", !zone && "chip--selected")} aria-current={!zone ? "true" : undefined}>Todo Cochabamba</Link>{ZONES.map((item) => <Link key={item} href={href({ zona: item })} className={cn("chip", zone === item && "chip--selected")} aria-current={zone === item ? "true" : undefined}>{item}</Link>)}</div>
    {visible.length ? <div className="place-grid">{visible.map((item) => <Link key={item.id} href={`/establecimientos/${item.slug}`} className="place-card">
      <div className="place-card-top"><span className="vendor-avatar vendor-avatar--large" style={{ backgroundColor: item.color }}>{item.initials}</span><span className="status-pill status-neutral">{item.type}</span></div>
      <h2>{item.name}</h2>
      <p>{item.description}</p>
      <ul><li><MapPin size={14} />{item.address}</li><li><Clock3 size={14} />{item.openingHours}</li></ul>
      <span className="text-link">Ver sus ofertas<ArrowUpRight size={15} /></span>
    </Link>)}</div> : <EmptyState icon={MapPin} title="Todavía no hay locales con esa combinación" description="Prueba otra zona o tipo de establecimiento." action={<Link href="/establecimientos" className="btn btn-secondary">Ver todos</Link>} />}
  </div>;
}
