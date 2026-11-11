import type { Metadata } from "next";
import { Mail, MapPin, Phone, Store } from "lucide-react";
import { AdminShell } from "@/components/dashboard";
import { EmptyState } from "@/components/empty-state";
import { dateLabel, timeLabel } from "@/lib/domain";
import { getBusinessApplications } from "@/lib/db/queries";

export const metadata: Metadata = { title: "Administración · Solicitudes" };

export default async function Page() {
  const applications = await getBusinessApplications();
  return <AdminShell eyebrow="ADMINISTRACIÓN" title="Solicitudes de negocios." description="Restaurantes y supermercados que quieren sumarse a EcoRescate, desde el formulario «Quiero unirme».">
    {applications.length ? <div className="inbox-list">{applications.map((item) => <article key={item.id} className="inbox-card">
      <header><div><h2>{item.businessName}</h2><span className="status-pill status-neutral">{item.businessType}</span></div><time dateTime={item.createdAt}>{dateLabel(item.createdAt, { year: "numeric" })} · {timeLabel(item.createdAt)}</time></header>
      <ul><li><Store size={14} />{item.contactName}</li><li><MapPin size={14} />{item.zone}</li><li><Phone size={14} /><a href={`tel:${item.phone}`}>{item.phone}</a></li>{item.email && <li><Mail size={14} /><a href={`mailto:${item.email}`}>{item.email}</a></li>}</ul>
      {item.message && <p>{item.message}</p>}
    </article>)}</div> : <EmptyState icon={Store} title="Todavía no hay solicitudes" description="Las solicitudes enviadas desde «Quiero unirme» aparecerán aquí." />}
  </AdminShell>;
}
