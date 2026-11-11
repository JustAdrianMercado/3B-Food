import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { AdminShell } from "@/components/dashboard";
import { EmptyState } from "@/components/empty-state";
import { dateLabel, timeLabel } from "@/lib/domain";
import { getContactMessages } from "@/lib/db/queries";

export const metadata: Metadata = { title: "Administración · Mensajes" };

export default async function Page() {
  const messages = await getContactMessages();
  return <AdminShell eyebrow="ADMINISTRACIÓN" title="Mensajes de contacto." description="Consultas y sugerencias enviadas desde la página de contacto.">
    {messages.length ? <div className="inbox-list">{messages.map((item) => <article key={item.id} className="inbox-card">
      <header><div><h2>{item.subject}</h2></div><time dateTime={item.createdAt}>{dateLabel(item.createdAt, { year: "numeric" })} · {timeLabel(item.createdAt)}</time></header>
      <ul><li><Mail size={14} />{item.name} · <a href={`mailto:${item.email}?subject=${encodeURIComponent(`Re: ${item.subject}`)}`}>{item.email}</a></li></ul>
      <p>{item.message}</p>
    </article>)}</div> : <EmptyState icon={Mail} title="Todavía no hay mensajes" description="Los mensajes enviados desde la página de contacto aparecerán aquí." />}
  </AdminShell>;
}
