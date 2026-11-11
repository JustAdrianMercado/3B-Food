"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, Copy, Info, Leaf, MapPin, Minus, Plus, ShieldCheck, ShoppingBag, Store } from "lucide-react";
import { dateLabel, discount, getOfferViews, localDate, money, number, offerStatus, remainingLabel, timeLabel, unitLabel, type Reservation } from "@/lib/domain";
import { useData } from "./data-provider";
import { Dialog } from "./ui";
import { EmptyState } from "./empty-state";

export function OfferDetail({ id }: { id: string }) {
  const { state, ready, now, execute, notify } = useData();
  const [amount, setAmount] = useState("1");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    // Convenience only: remember the pickup name in this browser.
    try { const saved = localStorage.getItem("ecorescate-nombre"); if (saved) queueMicrotask(() => setCustomerName(saved)); } catch { /* Storage may be unavailable. */ }
  }, []);
  if (!ready || !state) return <div className="container detail-loading" aria-busy="true"><div className="skeleton" /><div className="skeleton" /></div>;
  const view = getOfferViews(state).find((item) => item.offer.id === id);
  if (!view) return <div className="container page-section"><EmptyState title="Esta oportunidad ya no está disponible" description="Puede que la oferta haya terminado o que el enlace no sea correcto. Hay más cosas buenas esperándote en el catálogo." action={<Link href="/ofertas" className="btn btn-primary">Explorar ofertas<ArrowRight size={16} /></Link>} /></div>;
  const { offer, lot, establishment } = view;
  const status = offerStatus(offer, lot, now);
  const count = Number(amount);
  const validCount = Number.isFinite(count) && count > 0 && count <= lot.availableQuantity && (lot.unit === "kg" || Number.isInteger(count));
  const canReserve = status === "Disponible" && validCount;
  const pickupSameDay = localDate(new Date(lot.pickupStartsAt)) === localDate(new Date(lot.pickupEndsAt));
  const nameValid = customerName.trim().length >= 2 && customerName.trim().length <= 80;
  const reserve = async () => {
    if (busy || !nameValid) return;
    setBusy(true);
    const result = await execute({ type: "reserve", offerId: offer.id, quantity: count, customerName: customerName.trim() });
    setBusy(false);
    if (result.ok && result.reservation) {
      try { localStorage.setItem("ecorescate-nombre", customerName.trim()); } catch { /* Storage may be unavailable. */ }
      setReservation(result.reservation); setConfirmOpen(false); notify("¡Tu oportunidad está reservada! Guarda el código para el retiro.");
    }
  };
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(reservation!.code); notify("Código copiado."); }
    catch { notify(`Tu código es ${reservation!.code}. También está en Mis reservas.`, "info"); }
  };
  return <div className="container detail-page">
    <nav className="breadcrumbs" aria-label="Ruta de navegación"><Link href="/ofertas"><ArrowLeft size={14} />Explorar ofertas</Link><span>/</span><span>{lot.category}</span></nav>
    <div className="detail-grid"><div><div className="detail-image"><Image src={offer.image} alt={`${lot.category}, imagen ilustrativa de la oferta`} fill priority sizes="(max-width: 899px) 100vw, 55vw" className="object-cover" /><span className="detail-discount">−{discount(offer)}%<small>sobre el precio habitual</small></span><span className="detail-photo-note">Fotografía ilustrativa</span></div><div className="detail-description"><span className="eyebrow">SOBRE ESTA OPORTUNIDAD</span><h2>Lo bueno que te llevas</h2><p>{lot.description}</p><div className="food-responsibility"><ShieldCheck size={23} /><div><strong>Aptitud declarada por el establecimiento</strong><p>El oferente respalda las condiciones de conservación. La plataforma no certifica la inocuidad. Consulta los alérgenos y las indicaciones al retirar.</p></div></div></div></div>
    <div className="detail-information"><div className="detail-category"><Leaf size={14} />{lot.category}<span className={`status-pill ${status === "Disponible" ? "status-green" : "status-neutral"}`}>{status}</span></div><h1>{lot.name}</h1><div className="detail-establishment"><span className="vendor-avatar vendor-avatar--large" style={{ backgroundColor: establishment.color }}>{establishment.initials}</span><div><strong>{establishment.name}</strong><span>{establishment.type} · {establishment.zone}</span><Link className="text-link" href={`/establecimientos/${establishment.slug}`}>Ver el establecimiento<ArrowRight size={14} /></Link></div></div><div className="detail-facts"><div><Clock3 size={19} /><p><b>Tu horario de retiro</b><span>{dateLabel(lot.pickupStartsAt)}{!pickupSameDay && ` al ${dateLabel(lot.pickupEndsAt)}`} · {timeLabel(lot.pickupStartsAt)}–{timeLabel(lot.pickupEndsAt)}</span><small>{remainingLabel(lot, now)}</small></p></div><div><MapPin size={19} /><p><b>Directamente en el local</b><span>{establishment.address}</span></p></div><div><Info size={19} /><p><b>{lot.dateType}</b><span>{dateLabel(`${lot.foodDate}T12:00:00-04:00`, { year: "numeric" })}</span></p></div></div>
      <div className="reservation-box"><div className="detail-price"><div><strong>{money(offer.price)}</strong><s>{money(offer.regularPrice)}</s></div><span>por {unitLabel(lot.unit)} · {number(lot.availableQuantity)} {lot.unit} disponibles</span></div><div className="quantity-row"><label htmlFor="reserve-quantity">Cantidad ({lot.unit})</label><div className="quantity-control"><button aria-label="Disminuir cantidad" disabled={count <= (lot.unit === "kg" ? 0.001 : 1)} onClick={() => setAmount(String(Math.max(lot.unit === "kg" ? 0.001 : 1, Math.round((count - (lot.unit === "kg" ? 0.5 : 1)) * 1000) / 1000)))}><Minus size={15} /></button><input id="reserve-quantity" type="number" inputMode={lot.unit === "kg" ? "decimal" : "numeric"} min={lot.unit === "kg" ? 0.001 : 1} max={lot.availableQuantity} step={lot.unit === "kg" ? 0.001 : 1} value={amount} onChange={(event) => setAmount(event.target.value)} aria-describedby="quantity-help" /><button aria-label="Aumentar cantidad" disabled={count >= lot.availableQuantity} onClick={() => setAmount(String(Math.min(lot.availableQuantity, Math.round((count + (lot.unit === "kg" ? 0.5 : 1)) * 1000) / 1000)))}><Plus size={15} /></button></div></div><span id="quantity-help" className="quantity-help">{!validCount ? "Selecciona una cantidad válida dentro de las existencias disponibles." : `Total por acordar en el local: ${money(count * offer.price)}`}</span><button className="btn btn-primary w-full" onClick={() => setConfirmOpen(true)} disabled={!canReserve}><ShoppingBag size={18} />{status === "Disponible" ? "Reservar esta oportunidad" : status === "Agotada" ? "Todas las unidades están reservadas" : "Oferta no disponible"}<ArrowRight size={17} /></button><p className="payment-note"><Check size={13} />Sin cobros en la aplicación. Retiro y pago en el local.</p></div>
    </div></div>
    <div className="detail-return"><Link href="/ofertas" className="text-link"><ArrowLeft size={16} />Seguir explorando cosas buenas</Link></div>
    <AnimatePresence>{confirmOpen && <Dialog title="Una buena elección" description="Revisa la cantidad y el horario antes de confirmar tu reserva." onClose={() => setConfirmOpen(false)}><div className="confirmation-summary"><h3>{lot.name}</h3><span>{establishment.name}</span><dl><div><dt>Cantidad</dt><dd>{number(count)} {lot.unit}</dd></div><div><dt>Retiro</dt><dd>{dateLabel(lot.pickupStartsAt)} · {timeLabel(lot.pickupStartsAt)}–{timeLabel(lot.pickupEndsAt)}</dd></div><div className="summary-total"><dt>Total</dt><dd>{money(count * offer.price)}</dd></div></dl></div><div className="field mt-4"><label htmlFor="customer-name">Nombre para el retiro *</label><input id="customer-name" value={customerName} onChange={(event) => setCustomerName(event.target.value)} autoComplete="name" maxLength={80} required aria-describedby="customer-name-help" /><small id="customer-name-help">El establecimiento lo verá junto a tu código de reserva.</small></div><div className="note-box"><Store size={17} /><span>Acuerda el pago con el local y muestra tu código al retirar. La entrega se confirma manualmente.</span></div><div className="dialog-actions"><button className="btn btn-secondary" onClick={() => setConfirmOpen(false)}>Volver</button><button className="btn btn-primary" onClick={reserve} disabled={busy || !nameValid}>{busy ? "Reservando…" : "Confirmar reserva"}<Check size={17} /></button></div></Dialog>}{reservation && <Dialog title="Tu próxima cosa buena, reservada" onClose={() => setReservation(null)}><div className="reservation-success"><span className="success-icon"><CheckCircle2 size={33} /></span><p>Guarda este código y preséntalo en el establecimiento dentro del horario indicado.</p><button className="reservation-code" onClick={copyCode} aria-label={`Copiar código ${reservation.code}`}>{reservation.code}<Copy size={18} /></button><span>{establishment.name} · {timeLabel(lot.pickupStartsAt)}–{timeLabel(lot.pickupEndsAt)}</span><Link href="/mis-reservas" className="btn btn-primary w-full" onClick={() => setReservation(null)}>Ir a mis reservas<ArrowRight size={17} /></Link></div></Dialog>}</AnimatePresence>
  </div>;
}
