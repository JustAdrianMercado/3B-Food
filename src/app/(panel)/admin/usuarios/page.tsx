import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, Store, Users } from "lucide-react";
import { AdminShell } from "@/components/dashboard";
import { EmptyState } from "@/components/empty-state";
import { ROLES, dateLabel, roleLabel, type Role } from "@/lib/domain";
import { getAccounts } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Administración · Usuarios" };

const PAGE_SIZE = 10;
const roleClass: Record<Role, string> = { consumidor: "status-neutral", establecimiento: "status-amber", administrador: "status-green" };

export default async function Page({ searchParams }: { searchParams: Promise<{ rol?: string; pagina?: string }> }) {
  const { rol, pagina } = await searchParams;
  const accounts = await getAccounts();
  const role = ROLES.find((item) => item === rol);
  const visible = accounts.filter((item) => !role || item.role === role);
  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pagina) || 1), pages);
  const slice = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const href = (next: { rol?: Role; pagina?: number }) => {
    const params = new URLSearchParams();
    const r = "rol" in next ? next.rol : role;
    if (r) params.set("rol", r);
    if (next.pagina && next.pagina > 1) params.set("pagina", String(next.pagina));
    const query = params.toString();
    return query ? `/admin/usuarios?${query}` : "/admin/usuarios";
  };
  return <AdminShell eyebrow="ADMINISTRACIÓN" title="Usuarios y roles." description="Cada cuenta tiene un perfil: los clientes reservan, los establecimientos publican y confirman retiros, y la administración supervisa la plataforma.">
    <div className="stats-grid stats-grid--three">{ROLES.map((item) => <div key={item} className="stat-card"><div className="stat-top"><span>{roleLabel[item]}</span></div><strong>{accounts.filter((account) => account.role === item).length}</strong><small>{item === "consumidor" ? "cuentas de cliente" : item === "establecimiento" ? "cuentas de negocio" : "cuentas con acceso total"}</small></div>)}</div>
    <div className="filter-chips" role="group" aria-label="Filtrar por rol"><Link href={href({ rol: undefined })} className={cn("chip", !role && "chip--selected")} aria-current={!role ? "true" : undefined}>Todos · {accounts.length}</Link>{ROLES.map((item) => <Link key={item} href={href({ rol: item })} className={cn("chip", role === item && "chip--selected")} aria-current={role === item ? "true" : undefined}>{roleLabel[item]}</Link>)}</div>
    {slice.length ? <div className="inbox-list">{slice.map((item) => <article key={item.id} className="inbox-card">
      <header><div><h2>{item.name}</h2><span className={`status-pill ${roleClass[item.role]}`}>{roleLabel[item.role]}</span></div><time dateTime={item.createdAt}>Desde {dateLabel(item.createdAt, { year: "numeric" })}</time></header>
      <ul><li><Mail size={14} />{item.email}</li>{item.phone && <li><Phone size={14} />{item.phone}</li>}{item.establishment && <li><Store size={14} />{item.establishment}</li>}{item.role === "consumidor" && <li><Users size={14} />{item.reservations} {item.reservations === 1 ? "reserva" : "reservas"}</li>}</ul>
    </article>)}</div> : <EmptyState icon={Users} title="No hay cuentas con ese rol" description="Las cuentas nuevas aparecerán aquí en cuanto se registren." />}
    {pages > 1 && <nav className="pagination" aria-label="Páginas de usuarios">{page > 1 ? <Link className="btn btn-secondary btn-small" href={href({ pagina: page - 1 })}>Anterior</Link> : <span className="btn btn-secondary btn-small" aria-disabled="true">Anterior</span>}<span>Página <b>{page}</b> de {pages}</span>{page < pages ? <Link className="btn btn-secondary btn-small" href={href({ pagina: page + 1 })}>Siguiente</Link> : <span className="btn btn-secondary btn-small" aria-disabled="true">Siguiente</span>}</nav>}
  </AdminShell>;
}
