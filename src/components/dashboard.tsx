"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { Activity, ArrowUpRight, BarChart3, Bell, CheckCheck, ChevronRight, Clock3, Download, LayoutDashboard, Leaf, Mail, Package, Pause, Pencil, Play, Plus, ShoppingBag, Sprout, Store, type LucideIcon } from "lucide-react";
import { dateLabel, getMetrics, getOfferViews, localDate, lotUrgency, number, offerStatus, remainingLabel, reportCsv, timeLabel, type SiteState, type Offer, type OfferView, type Unit } from "@/lib/domain";
import { downloadText, cn } from "@/lib/utils";
import { useData } from "./data-provider";
import { PriceDialog, PublishLotDialog } from "./management-forms";
import { ReservationList } from "./reservations";
import { PageHeading } from "./ui";
import { EmptyState } from "./empty-state";

type Section = "overview" | "inventory" | "reservations" | "reports";

export function Stat({ label, value, caption, icon: Icon, accent = false }: { label: string; value: number | string; caption: string; icon: LucideIcon; accent?: boolean }) {
  return <div className={cn("stat-card", accent && "stat-card--accent")}><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={16} strokeWidth={1.7} /></span></div><strong>{value}</strong><small>{caption}</small></div>;
}

function ActivityList({ state, establishmentId, since, limit = 5 }: { state: SiteState; establishmentId?: string; since?: number; limit?: number }) {
  const movements = state.movements.filter((movement) => (!establishmentId || state.lots.some((lot) => lot.id === movement.lotId && lot.establishmentId === establishmentId)) && (!since || Date.parse(movement.createdAt) >= since)).slice(0, limit);
  if (!movements.length) return <p className="report-method">Los movimientos de este período aparecerán aquí.</p>;
  const icons: Record<string, LucideIcon> = { Publicación: Package, Reserva: ShoppingBag, Retiro: CheckCheck, Cancelación: Activity, "Plazo finalizado": Clock3, "Cambio de precio": Pencil };
  return <div className="timeline">{movements.map((movement) => { const Icon = icons[movement.type] ?? Activity; return <div key={movement.id} className="timeline-item"><span className="timeline-dot"><Icon size={13} /></span><p><b>{movement.type}</b>{movement.detail}<small>{dateLabel(movement.createdAt)}</small></p><time dateTime={movement.createdAt}>{timeLabel(movement.createdAt)}</time></div>; })}</div>;
}

function InventoryStatus({ view }: { view: OfferView }) {
  const { now } = useData();
  const status = offerStatus(view.offer, view.lot, now);
  const soon = lotUrgency(view.lot, now) === "pronto";
  return <span className={`status-pill ${status !== "Disponible" ? "status-neutral" : soon ? "status-amber" : "status-green"}`}>{status === "Disponible" ? soon ? "Próxima al límite" : "En plazo" : status}</span>;
}

function InventoryPanel({ onPrice, limit }: { onPrice: (offer: Offer) => void; limit?: number }) {
  const { state, now, execute, notify } = useData();
  const [sort, setSort] = useState<"limit" | "peps">("limit");
  const views = useMemo(() => !state ? [] : getOfferViews(state).filter((view) => view.establishment.id === state.selectedEstablishmentId).sort((a, b) => Date.parse(sort === "peps" ? a.lot.entryAt : a.lot.commercializationEndsAt) - Date.parse(sort === "peps" ? b.lot.entryAt : b.lot.commercializationEndsAt)), [state, sort]);
  if (!state) return null;
  const visible = limit ? views.slice(0, limit) : views;
  const toggle = async (offer: Offer) => { const result = await execute({ type: "toggle-offer", offerId: offer.id }); if (result.ok) notify(offer.paused ? "La oferta vuelve a estar visible si conserva plazo y existencias." : "Oferta pausada. Las reservas existentes se conservan."); };
  const actions = (view: OfferView) => {
    const ended = offerStatus(view.offer, view.lot, now) === "Finalizada";
    const Icon = view.offer.paused ? Play : Pause;
    return <><button className="icon-button" aria-label={`Editar precio de ${view.lot.name}`} title="Editar precio" onClick={() => onPrice(view.offer)} disabled={ended}><Pencil size={14} /></button><button className="icon-button" aria-label={`${view.offer.paused ? "Reactivar" : "Pausar"} oferta de ${view.lot.name}`} title={view.offer.paused ? "Reactivar oferta" : "Pausar oferta"} onClick={() => toggle(view.offer)} disabled={ended}><Icon size={14} /></button><Link className="icon-button" href={`/ofertas/${view.offer.id}`} aria-label={`Ver oferta de ${view.lot.name}`} title="Ver detalle"><ArrowUpRight size={16} /></Link></>;
  };
  return <div className="panel"><div className="panel-heading"><div><h2>{limit ? "Tus lotes, a la vista" : "Inventario y ofertas"}</h2><p>Ingreso PEPS y límite comercial son criterios diferentes.</p></div>{limit ? <Link className="text-link" href="/panel/inventario">Ver inventario<ArrowUpRight size={15} /></Link> : <div className="sort-buttons" role="group" aria-label="Ordenar inventario"><button className={sort === "peps" ? "selected" : ""} onClick={() => setSort("peps")} aria-pressed={sort === "peps"}>PEPS · Ingreso</button><button className={sort === "limit" ? "selected" : ""} onClick={() => setSort("limit")} aria-pressed={sort === "limit"}>Fecha límite</button></div>}</div>
    {!visible.length ? <EmptyState icon={Package} title="La primera oportunidad empieza aquí" description="Registra un lote para organizar sus existencias y publicar una oferta con descuento." /> : <>
      <div className="table-wrap inventory-table"><table className="data-table"><caption className="sr-only">Lotes del establecimiento, ordenados por {sort === "peps" ? "fecha de ingreso" : "fecha límite de comercialización"}</caption><thead><tr><th>Producto / lote</th><th>Disponible</th><th>Ingreso</th><th>Límite comercial</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>{visible.map((view) => <tr key={view.lot.id}><td><div className="thumbnail-cell"><span className="table-thumbnail"><Image src={view.offer.image} alt="" fill sizes="38px" className="object-cover" /></span><span><b>{view.lot.name}</b><small>LOT-{view.lot.id.slice(-7).toUpperCase()}</small></span></div></td><td><strong>{number(view.lot.availableQuantity)} / {number(view.lot.initialQuantity)}</strong><small>{view.lot.unit}</small></td><td>{dateLabel(view.lot.entryAt)}</td><td>{dateLabel(view.lot.commercializationEndsAt)}<small>{timeLabel(view.lot.commercializationEndsAt)}</small></td><td><InventoryStatus view={view} /></td><td><div className="actions-cell">{actions(view)}</div></td></tr>)}</tbody></table></div>
      <div className="record-cards">{visible.map((view) => <article key={view.lot.id} className="record-card"><div className="record-header"><div><h3>{view.lot.name}</h3><small>LOT-{view.lot.id.slice(-7).toUpperCase()}</small></div><InventoryStatus view={view} /></div><div className="record-details"><div><span>Disponible / publicado</span><b>{number(view.lot.availableQuantity)} / {number(view.lot.initialQuantity)} {view.lot.unit}</b></div><div><span>Ingreso PEPS</span><b>{dateLabel(view.lot.entryAt)}</b></div><div><span>Límite comercial</span><b>{dateLabel(view.lot.commercializationEndsAt)} · {timeLabel(view.lot.commercializationEndsAt)}</b></div><div><span>{view.lot.dateType}</span><b>{dateLabel(`${view.lot.foodDate}T12:00:00-04:00`)}</b></div></div><div className="record-actions">{actions(view)}</div></article>)}</div>
    </>}
    <p className="inventory-caption">La cantidad disponible descuenta reservas pendientes y retiros. El catálogo muestra únicamente ofertas vigentes, sin pausa y con existencias.</p>
  </div>;
}

function Overview({ onPrice }: { onPrice: (offer: Offer) => void }) {
  const { state, now } = useData();
  if (!state) return null;
  const views = getOfferViews(state).filter((item) => item.establishment.id === state.selectedEstablishmentId);
  const available = views.filter((view) => offerStatus(view.offer, view.lot, now) === "Disponible");
  const alerts = available.filter((view) => lotUrgency(view.lot, now) === "pronto").sort((a, b) => Date.parse(a.lot.commercializationEndsAt) - Date.parse(b.lot.commercializationEndsAt));
  const reservations = state.reservations.filter((item) => views.some((view) => view.offer.id === item.offerId));
  return <><div className="stats-grid"><Stat label="Ofertas vigentes" value={available.length} caption="con plazo y existencias" icon={Package} /><Stat label="Atención oportuna" value={alerts.length} caption="ofertas próximas a su límite" icon={Bell} /><Stat label="Por retirar" value={reservations.filter((item) => item.status === "Reservada").length} caption="reservas pendientes" icon={ShoppingBag} /><Stat label="Retiros confirmados" value={reservations.filter((item) => item.status === "Retirada").length} caption="entregas en el local" icon={CheckCheck} accent /></div>
    <div className="dashboard-columns"><section className="panel"><div className="panel-heading"><div><h2>A tiempo de aprovechar</h2><p>Anticipación configurada para cada lote.</p></div><Bell size={17} className="text-clay" /></div>{alerts.length ? <div className="alert-list">{alerts.slice(0, 4).map((view) => <div className="alert-item" key={view.lot.id}><Clock3 size={18} /><p><b>{view.lot.name}</b><span>{remainingLabel(view.lot, now)} · {number(view.lot.availableQuantity)} {view.lot.unit}</span></p><Link className="text-link" href={`/ofertas/${view.offer.id}`} aria-label={`Revisar ${view.lot.name}`}><ChevronRight size={18} /></Link></div>)}</div> : <p className="report-method">No hay ofertas próximas al límite configurado. Las alertas aparecerán aquí cuando corresponda.</p>}</section><section className="panel"><div className="panel-heading"><div><h2>Lo que está pasando</h2><p>Una historia que podemos seguir.</p></div><Activity size={16} className="text-forest" /></div><ActivityList state={state} establishmentId={state.selectedEstablishmentId} limit={3} /></section></div><InventoryPanel onPrice={onPrice} limit={3} /><div className="note-box"><Sprout size={18} /><span>Publicar a tiempo es el primer paso: cuanto antes aparece una oferta, más personas pueden encontrarla antes del cierre.</span></div>
  </>;
}

export function ReportPanel({ global = false }: { global?: boolean }) {
  const { state, now } = useData();
  const [establishmentFilter, setEstablishmentFilter] = useState("all");
  const [period, setPeriod] = useState("all");
  const [unit, setUnit] = useState<Unit>("unidades");
  if (!state) return null;
  const establishmentId = global ? establishmentFilter === "all" ? undefined : establishmentFilter : state.selectedEstablishmentId;
  const since = period === "today" ? Date.parse(`${localDate(now)}T00:00:00-04:00`) : period === "week" ? now - 7 * 86400000 : undefined;
  const metrics = getMetrics(state, { establishmentId, since });
  const selected = metrics.find((item) => item.unit === unit) ?? metrics[0];
  const views = getOfferViews(state).filter((view) => (!establishmentId || view.establishment.id === establishmentId) && (!since || Date.parse(view.offer.publishedAt) >= since));
  const reservations = state.reservations.filter((item) => views.some((view) => view.offer.id === item.offerId));
  const label = establishmentId ? state.establishments.find((item) => item.id === establishmentId)!.name : "Todos los establecimientos";
  const exportReport = () => downloadText(reportCsv(metrics, `${label} · ${period === "all" ? "Todas las publicaciones" : period === "today" ? "Publicadas hoy" : "Publicadas en los últimos 7 días"}`), `ecorescate-reporte-${localDate(now)}.csv`);
  return <>
    <div className="report-filter">{global && <><label htmlFor="report-establishment">Establecimiento</label><select id="report-establishment" value={establishmentFilter} onChange={(event) => setEstablishmentFilter(event.target.value)}><option value="all">Todos los establecimientos</option>{state.establishments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></>}<label htmlFor="report-period">Publicaciones</label><select id="report-period" value={period} onChange={(event) => setPeriod(event.target.value)}><option value="all">Todo el historial</option><option value="today">Hoy</option><option value="week">Últimos 7 días</option></select><button className="btn btn-secondary btn-small" onClick={exportReport}><Download size={14} />Exportar CSV</button></div>
    <div className="stats-grid"><Stat label="Publicaciones" value={views.length} caption="ofertas de la selección" icon={Package} /><Stat label="Reservas registradas" value={reservations.length} caption="incluye todos los estados" icon={ShoppingBag} /><Stat label="Retiros confirmados" value={reservations.filter((item) => item.status === "Retirada").length} caption="operaciones, no cantidad mixta" icon={CheckCheck} accent /><Stat label="Locales representados" value={new Set(views.map((view) => view.establishment.id)).size} caption="con publicaciones en la selección" icon={Store} /></div>
    {selected ? <div className="dashboard-columns"><section className="panel"><div className="panel-heading"><div><h2>Cada unidad, por separado</h2><p>Cantidades comparables de las ofertas seleccionadas.</p></div><BarChart3 size={17} className="text-forest" /></div><div className="metric-tabs" role="group" aria-label="Unidad del indicador">{metrics.map((item) => <button key={item.unit} className={selected.unit === item.unit ? "selected" : ""} onClick={() => setUnit(item.unit)} aria-pressed={selected.unit === item.unit}>{item.unit}</button>)}</div><div className="bar-chart" role="img" aria-label={`En ${selected.unit}: ${number(selected.published)} publicadas, ${number(selected.reserved)} pendientes y ${number(selected.collected)} retiradas.`}>{[{ label: "Publicadas", value: selected.published, className: "" }, { label: "Por retirar", value: selected.reserved, className: "bar-fill--reserved" }, { label: "Retiradas", value: selected.collected, className: "bar-fill--collected" }].map((bar) => <div className="bar-row" key={bar.label}><span>{bar.label}</span><div className="bar-track"><div className={cn("bar-fill", bar.className)} style={{ width: `${selected.published ? bar.value / selected.published * 100 : 0}%` }} /></div><strong>{number(bar.value)}</strong></div>)}</div><div className="metric-proportion"><strong>{number(selected.proportion)}<small>%</small></strong><span>Proporción retirada en {selected.unit}<br />(retirado / publicado) × 100</span></div><p className="report-method">Una reserva pendiente todavía no es una entrega. El porcentaje considera solo los <b>retiros confirmados</b> en el local.</p></section><section className="panel"><div className="panel-heading"><div><h2>Trazabilidad de operaciones</h2><p>Registro de actividad de la selección.</p></div><Activity size={17} className="text-forest" /></div><ActivityList state={state} establishmentId={establishmentId} since={since} limit={5} /></section></div> : <EmptyState icon={BarChart3} title="Todavía no hay publicaciones en este período" description="Prueba otro período o establecimiento para consultar sus indicadores." />}
    <section className="panel"><div className="panel-heading"><div><h2>Resumen por unidad de medida</h2><p>Las cantidades de unidades distintas nunca se suman entre sí.</p></div></div><div className="table-wrap"><table className="data-table"><caption className="sr-only">Cantidades publicadas, pendientes, retiradas y canceladas por unidad de medida</caption><thead><tr><th>Unidad</th><th>Publicadas</th><th>Por retirar</th><th>Retiradas</th><th>Canceladas</th><th>No retiradas</th><th>Proporción</th></tr></thead><tbody>{metrics.map((item) => <tr key={item.unit}><td><strong>{item.unit}</strong></td><td>{number(item.published)}</td><td>{number(item.reserved)}</td><td>{number(item.collected)}</td><td>{number(item.cancelled)}</td><td>{number(item.uncollected)}</td><td><strong>{number(item.proportion)}%</strong></td></tr>)}</tbody></table></div><p className="report-method">Se seleccionan las ofertas por su fecha de publicación y se contabiliza el estado actual de sus reservas. Las cancelaciones y los plazos finalizados son movimientos de seguimiento, no categorías que deban sumarse para reconstruir el inventario. Las cantidades retiradas se confirman manualmente.</p></section>
  </>;
}

export function BusinessWorkspace({ section }: { section: Section }) {
  const pathname = usePathname();
  const { state, now, ready, execute } = useData();
  const [publishOpen, setPublishOpen] = useState(false);
  const [priceOffer, setPriceOffer] = useState<Offer | null>(null);
  const establishment = state?.establishments.find((item) => item.id === state.selectedEstablishmentId) ?? state?.establishments[0];
  if (!state || !establishment) return <div className="container page-section"><EmptyState icon={Store} title="Todavía no hay establecimientos registrados" description="Cuando se registre un establecimiento podrás gestionar aquí sus lotes, ofertas y reservas." /></div>;
  const nav = [{ href: "/panel", label: "Vista general", icon: LayoutDashboard }, { href: "/panel/inventario", label: "Inventario y ofertas", icon: Package }, { href: "/panel/reservas", label: "Reservas y retiros", icon: ShoppingBag }, { href: "/panel/indicadores", label: "Mis indicadores", icon: BarChart3 }];
  const titles: Record<Section, { title: string; description: string }> = {
    overview: { title: "Un buen día para aprovechar.", description: "Un espacio para organizar tus excedentes y darles una nueva oportunidad." },
    inventory: { title: "Cada lote, a su tiempo.", description: "Identifica tus excedentes y organiza el inventario por ingreso o límite comercial." },
    reservations: { title: "Del código, a la entrega.", description: "Consulta reservas y confirma manualmente el retiro en tu establecimiento." },
    reports: { title: "Una historia que podemos medir.", description: "Consulta las operaciones y las cantidades de cada unidad por separado." },
  };
  return <div className="dashboard-shell"><aside className="dashboard-sidebar"><div><p className="sidebar-eyebrow">ESPACIO DEL ESTABLECIMIENTO</p><div className="establishment-switcher"><label htmlFor="business-select">Establecimiento</label><select id="business-select" value={establishment.id} onChange={(event) => { void execute({ type: "select-establishment", establishmentId: event.target.value }); }}>{(state?.establishments ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div></div><nav className="sidebar-nav" aria-label="Panel del establecimiento">{nav.map((item) => <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""}><item.icon size={17} strokeWidth={1.7} />{item.label}</Link>)}</nav><div className="sidebar-guide"><Sprout size={26} strokeWidth={1.5} /><h3>El tiempo importa.</h3><p>Revisa los lotes próximos a su límite y ofrece una oportunidad mientras todavía sea posible.</p><Link href={`/establecimientos/${establishment.slug}`}>Ver mi página pública<ArrowUpRight size={13} /></Link></div></aside><div className="dashboard-main"><div className="dashboard-demo-line"><span>{ready ? `${establishment.zone} · ${dateLabel(new Date(now).toISOString(), { weekday: "long" })}` : "Cochabamba"}</span></div><div className="dashboard-heading"><PageHeading eyebrow={`${establishment.name.toUpperCase()} · ${establishment.type.toUpperCase()}`} title={titles[section].title} description={titles[section].description} action={<button className="btn btn-primary" onClick={() => setPublishOpen(true)} disabled={!ready}><Plus size={17} />Publicar excedente</button>} /></div>{!state ? <div className="skeleton" style={{ height: 260 }} aria-busy="true" /> : section === "overview" ? <Overview onPrice={setPriceOffer} /> : section === "inventory" ? <InventoryPanel onPrice={setPriceOffer} /> : section === "reservations" ? <ReservationList business /> : <ReportPanel />}</div><AnimatePresence>{publishOpen && <PublishLotDialog establishmentId={establishment.id} onClose={() => setPublishOpen(false)} />}{priceOffer && <PriceDialog offer={priceOffer} onClose={() => setPriceOffer(null)} />}</AnimatePresence></div>;
}

const adminNav = [
  { href: "/admin", label: "Indicadores globales", icon: BarChart3 },
  { href: "/admin/solicitudes", label: "Solicitudes de negocios", icon: Store },
  { href: "/admin/mensajes", label: "Mensajes de contacto", icon: Mail },
];

export function AdminShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  const pathname = usePathname();
  return <div className="dashboard-shell"><aside className="dashboard-sidebar"><div><p className="sidebar-eyebrow">ESPACIO DE ADMINISTRACIÓN</p><span className="eyebrow"><Leaf size={17} />ECORESCATE</span></div><nav className="sidebar-nav" aria-label="Panel de administración">{adminNav.map((item) => <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""} aria-current={pathname === item.href ? "page" : undefined}><item.icon size={17} />{item.label}</Link>)}<Link href="/panel"><LayoutDashboard size={17} />Panel de negocio</Link><Link href="/"><Sprout size={17} />Ir al sitio</Link></nav><div className="sidebar-guide"><Leaf size={26} /><h3>Cada unidad, por separado.</h3><p>Los kilogramos, las unidades y las porciones se reportan por separado para que las cifras sean comparables.</p></div></aside><div className="dashboard-main"><div className="dashboard-demo-line"><span>Administración · Todos los establecimientos</span></div><div className="dashboard-heading"><PageHeading eyebrow={eyebrow} title={title} description={description} /></div>{children}</div></div>;
}

export function AdminWorkspace() {
  return <AdminShell eyebrow="ADMINISTRACIÓN" title="De las oportunidades, a los datos." description="Un panorama de publicaciones, reservas y retiros. Cada cantidad, en su unidad."><ReportPanel global /></AdminShell>;
}
