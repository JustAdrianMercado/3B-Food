"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence } from "motion/react";
import { ArrowRight, Check, Clock3, Copy, Info, MapPin, Search, ShoppingBag, X } from "lucide-react";
import { dateLabel, effectiveEnd, money, number, timeLabel, type Reservation } from "@/lib/domain";
import { establishments } from "@/lib/seed";
import { useDemo } from "./demo-provider";
import { CollectDialog } from "./management-forms";
import { DemoBadge, Dialog, EmptyState, PageHeading } from "./ui";
import { cn } from "@/lib/utils";

const statusClass = (status: Reservation["status"]) => status === "Reservada" ? "status-amber" : status === "Retirada" ? "status-green" : "status-neutral";

export function ReservationList({ business = false }: { business?: boolean }) {
  const { state, ready, now, execute, notify } = useDemo();
  const [tab, setTab] = useState<"active" | "history" | "all">("active");
  const [query, setQuery] = useState("");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [collectId, setCollectId] = useState<string | null>(null);
  if (!ready || !state) return <div className="skeleton" style={{ height: 180 }} aria-busy="true" aria-label="Cargando reservas" />;
  const base = state.reservations.filter((reservation) => !business || state.lots.some((lot) => lot.establishmentId === state.selectedEstablishmentId && state.offers.some((offer) => offer.id === reservation.offerId && offer.lotId === lot.id)));
  const pending = base.filter((item) => item.status === "Reservada");
  const history = base.filter((item) => item.status !== "Reservada");
  const visible = (tab === "active" ? pending : tab === "history" ? history : base).filter((reservation) => reservation.code.toLowerCase().includes(query.trim().toLowerCase()));
  const cancelReservation = state.reservations.find((item) => item.id === cancelId);
  const copy = async (code: string) => {
    try { await navigator.clipboard.writeText(code); notify("Código de reserva copiado."); }
    catch { notify(`Código de retiro: ${code}`, "info"); }
  };
  return <>
    <div className="reservation-tabs" role="group" aria-label="Estado de las reservas">{[{ id: "active", label: "Por retirar", count: pending.length }, { id: "history", label: "Historial", count: history.length }, { id: "all", label: "Todas", count: base.length }].map((item) => <button key={item.id} className={cn(tab === item.id && "selected")} onClick={() => setTab(item.id as typeof tab)} aria-pressed={tab === item.id}>{item.label}<span>{item.count}</span></button>)}</div>
    {business && <label className="search-field mb-5"><Search size={17} /><span className="sr-only">Buscar por código de reserva</span><input type="search" placeholder="Busca un código de reserva…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>}
    {visible.length ? <div className="reservation-list">{visible.map((reservation) => {
      const offer = state.offers.find((item) => item.id === reservation.offerId)!;
      const lot = state.lots.find((item) => item.id === offer.lotId)!;
      const establishment = establishments.find((item) => item.id === lot.establishmentId)!;
      const active = reservation.status === "Reservada";
      const pickupOpen = now >= Date.parse(lot.pickupStartsAt) && now < effectiveEnd(lot);
      return <article className="reservation-card" key={reservation.id} data-testid="reservation-card"><Link href={`/ofertas/${offer.id}`} className="reservation-photo" aria-label={`Ver ${lot.name}`}><Image src={offer.image} alt={`${lot.category}, fotografía ilustrativa`} fill sizes="(max-width: 767px) 100vw, 145px" className="object-cover" /></Link><div className="reservation-card-main"><div className="reservation-card-top"><span className="reservation-card-vendor"><span className="vendor-avatar" style={{ backgroundColor: establishment.color }}>{establishment.initials}</span>{establishment.name}</span><span className={`status-pill ${statusClass(reservation.status)}`}>{reservation.status === "Reservada" ? "Por retirar" : reservation.status}</span></div><Link href={`/ofertas/${offer.id}`}><h2>{lot.name}</h2></Link><div className="reservation-card-facts"><span><ShoppingBag size={13} />{number(reservation.quantity)} {lot.unit}</span><span><Clock3 size={13} />{dateLabel(lot.pickupStartsAt)} · {timeLabel(lot.pickupStartsAt)}–{timeLabel(lot.pickupEndsAt)}</span><span><MapPin size={13} />{establishment.zone}</span></div><div className="reservation-card-bottom"><button className="reservation-card-code" onClick={() => copy(reservation.code)} aria-label={`Copiar código ${reservation.code}`}>{reservation.code}<Copy size={12} /></button><div className="reservation-card-price"><strong>{money(reservation.quantity * reservation.unitPrice)}</strong>{active && (business ? <button className="btn btn-primary btn-small" onClick={() => setCollectId(reservation.id)} disabled={!pickupOpen}><Check size={14} />{pickupOpen ? "Confirmar retiro" : "Retiro aún no disponible"}</button> : <button className="btn btn-secondary btn-small" onClick={() => setCancelId(reservation.id)}><X size={13} />Cancelar reserva</button>)}</div></div>{business && active && <div className="record-actions"><button className="text-link" onClick={() => setCancelId(reservation.id)}>Cancelar esta reserva</button></div>}{reservation.closedAt && <p className="inventory-caption">{reservation.status} · {dateLabel(reservation.closedAt)} a las {timeLabel(reservation.closedAt)}</p>}</div></article>;
    })}</div> : <EmptyState icon={ShoppingBag} title={query ? "No encontramos ese código" : tab === "active" ? "Todo a su tiempo, todo con oportunidad" : "Aquí quedará la historia"} description={query ? "Revisa el código o cambia el filtro de estado." : tab === "active" ? business ? "Las reservas de este establecimiento aparecerán aquí. Publica una oferta y recórrela desde la vista de consumidor." : "Todavía no tienes reservas pendientes. Encuentra algo rico en tu zona y guarda tu próxima oportunidad." : "Los retiros, las cancelaciones y las reservas no retiradas se conservan para el seguimiento."} action={!business && <Link href="/ofertas" className="btn btn-primary">Explorar ofertas<ArrowRight size={16} /></Link>} />}
    <p className="reservation-footnote"><Info size={14} />{business ? "El retiro se confirma manualmente dentro del horario. Los registros de demostración no equivalen a ventas ni mediciones de campo." : "Esta cuenta de demostración reúne las reservas de ejemplo y las que hagas en este navegador. El pago se acuerda fuera de la plataforma."}</p>
    <AnimatePresence>{cancelId && cancelReservation && <Dialog title="¿Liberamos esta oportunidad?" description="La reserva quedará en el historial como cancelada. La cantidad volverá a estar disponible si la oferta sigue vigente." onClose={() => setCancelId(null)}><div className="note-box"><ShoppingBag size={18} /><span>Reserva {cancelReservation.code} · {number(cancelReservation.quantity)} {state.lots.find((lot) => state.offers.some((offer) => offer.id === cancelReservation.offerId && offer.lotId === lot.id))?.unit}</span></div><div className="dialog-actions"><button className="btn btn-secondary" onClick={() => setCancelId(null)}>Conservar reserva</button><button className="btn btn-danger" onClick={() => { const result = execute({ type: "cancel", reservationId: cancelId }); if (result.ok) notify("Reserva cancelada. La cantidad se liberó y quedó registrada en el historial."); setCancelId(null); }}>Sí, cancelar reserva</button></div></Dialog>}{collectId && <CollectDialog reservationId={collectId} onClose={() => setCollectId(null)} />}</AnimatePresence>
  </>;
}

export function ReservationsPage() {
  return <div className="container reservation-page"><PageHeading eyebrow="LO BUENO YA TIENE SU LUGAR" title="Tus próximos buenos bocados." description="Consulta tus códigos, el horario de retiro y la historia de tus oportunidades." action={<DemoBadge />} /><ReservationList /></div>;
}
