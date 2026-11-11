"use client";

import { useState, type FormEvent } from "react";
import { Check, Leaf, Save, Upload } from "lucide-react";
import { CATEGORIES, DomainError, UNITS, fromLocalInput, localDate, localInput, money, type Category, type Lot, type Offer, type Unit } from "@/lib/domain";
import { useData } from "./data-provider";
import { Dialog } from "./ui";

export function PublishLotDialog({ establishmentId, onClose }: { establishmentId: string; onClose: () => void }) {
  const { execute, notify } = useData();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [unit, setUnit] = useState<Unit>("unidades");
  const [defaults] = useState(() => {
    const now = Date.now();
    return { entry: localDate(now), start: localInput(now), end: localInput(now + 3 * 3_600_000), date: localDate(new Date(now + 3 * 3_600_000)) };
  });
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setError("");
    const data = new FormData(event.currentTarget);
    setBusy(true);
    try {
      const result = await execute({ type: "publish", input: {
        establishmentId, name: String(data.get("name") ?? ""), description: String(data.get("description") ?? ""),
        category: data.get("category") as Category, quantity: Number(data.get("quantity")), unit,
        regularPrice: Number(data.get("regularPrice")), price: Number(data.get("price")),
        entryAt: fromLocalInput(`${data.get("entryDate")}T00:00`), dateType: data.get("dateType") as Lot["dateType"], foodDate: String(data.get("foodDate")),
        commercializationEndsAt: fromLocalInput(String(data.get("end"))), pickupStartsAt: fromLocalInput(String(data.get("pickupStart"))), pickupEndsAt: fromLocalInput(String(data.get("pickupEnd"))),
        alertMinutes: Number(data.get("alertMinutes")), suitabilityDeclared: data.get("suitability") === "on",
      } });
      if (!result.ok) { setError(result.message); return; }
      notify("Lote registrado y oferta publicada. Ya puedes encontrarla en el catálogo.");
      onClose();
    } catch (caught) { setError(caught instanceof DomainError ? caught.message : "Revisa los datos y las fechas antes de publicar."); }
    finally { setBusy(false); }
  };
  return <Dialog title="Dale otra oportunidad" description="Registra el lote y publica sus excedentes en una sola operación. Horarios de Cochabamba (UTC−4)." onClose={onClose} wide>
    <form onSubmit={submit}>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-section"><h3><span>1</span>El alimento y su lote</h3><div className="form-grid">
        <div className="field field-full"><label htmlFor="lot-name">Nombre del producto o paquete *</label><input id="lot-name" name="name" placeholder="Ej. Pack de panadería del día (6 piezas)" required minLength={3} maxLength={100} autoFocus /></div>
        <div className="field field-full"><label htmlFor="lot-description">Descripción y conservación *</label><textarea id="lot-description" name="description" placeholder="Describe qué incluye, cómo se conserva y los alérgenos conocidos." required minLength={10} maxLength={1200} /></div>
        <div className="field"><label htmlFor="lot-category">Categoría *</label><select id="lot-category" name="category" defaultValue="Panadería">{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></div>
        <div className="field"><label htmlFor="lot-entry">Fecha de ingreso · PEPS *</label><input id="lot-entry" name="entryDate" type="date" required defaultValue={defaults.entry} max={localDate()} /></div>
        <div className="field"><label htmlFor="lot-quantity">Cantidad de excedente *</label><input id="lot-quantity" name="quantity" type="number" min={unit === "kg" ? 0.001 : 1} max={10000} step={unit === "kg" ? 0.001 : 1} defaultValue={5} required /><small>Registra la cantidad que se publicará, no todo el inventario del local.</small></div>
        <div className="field"><label htmlFor="lot-unit">Unidad de medida *</label><select id="lot-unit" name="unit" value={unit} onChange={(event) => setUnit(event.target.value as Unit)}>{UNITS.map((value) => <option key={value}>{value}</option>)}</select></div>
      </div></div>
      <div className="form-section"><h3><span>2</span>Precio y vida útil</h3><div className="form-grid">
        <div className="field"><label htmlFor="lot-regular-price">Precio habitual por unidad de medida (Bs) *</label><input id="lot-regular-price" name="regularPrice" type="number" min="0.01" max="100000" step="0.01" defaultValue={30} required /></div>
        <div className="field"><label htmlFor="lot-price">Precio de oferta por unidad de medida (Bs) *</label><input id="lot-price" name="price" type="number" min="0.01" max="99999.99" step="0.01" defaultValue={18} required /></div>
        <div className="field"><label htmlFor="lot-date-type">Tipo de fecha alimentaria *</label><select id="lot-date-type" name="dateType" defaultValue="Consumo preferente"><option>Límite de oferta</option><option>Consumo preferente</option><option>Vencimiento</option></select><small>El límite de oferta corresponde a preparaciones del mismo día. No equivale a una certificación sanitaria.</small></div>
        <div className="field"><label htmlFor="lot-food-date">Fecha alimentaria declarada *</label><input id="lot-food-date" name="foodDate" type="date" min={localDate()} defaultValue={defaults.date} required /></div>
        <div className="field"><label htmlFor="lot-end">Fin de comercialización *</label><input id="lot-end" name="end" type="datetime-local" defaultValue={defaults.end} required /><small>No puede superar la fecha alimentaria declarada.</small></div>
        <div className="field"><label htmlFor="lot-alert">Avisar cuando falten *</label><select id="lot-alert" name="alertMinutes" defaultValue="120"><option value="30">30 minutos</option><option value="60">1 hora</option><option value="120">2 horas</option><option value="360">6 horas</option><option value="1440">24 horas</option></select><small>Elige según la vida útil de este alimento. La alerta se muestra en el panel.</small></div>
      </div></div>
      <div className="form-section"><h3><span>3</span>Retiro presencial</h3><div className="form-grid">
        <div className="field"><label htmlFor="lot-pickup-start">Inicio del retiro *</label><input id="lot-pickup-start" name="pickupStart" type="datetime-local" defaultValue={defaults.start} required /></div>
        <div className="field"><label htmlFor="lot-pickup-end">Fin del retiro *</label><input id="lot-pickup-end" name="pickupEnd" type="datetime-local" defaultValue={defaults.end} required /></div>
        <div className="field-full"><label className="declaration"><input type="checkbox" name="suitability" required /><span>Respaldo que el alimento es apto para el consumo, conserva las condiciones adecuadas y puede comercializarse dentro del plazo indicado. La plataforma no certifica su inocuidad. *</span></label></div>
      </div></div>
      <div className="note-box"><Leaf size={17} /><span>Se utilizará una fotografía ilustrativa de la categoría. La oferta aparecerá en el catálogo en cuanto la publiques.</span></div>
      <div className="dialog-actions"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button><button type="submit" className="btn btn-primary" disabled={busy} aria-busy={busy}><Upload size={16} />{busy ? "Publicando…" : "Registrar y publicar oferta"}</button></div>
    </form>
  </Dialog>;
}

export function PriceDialog({ offer, onClose }: { offer: Offer; onClose: () => void }) {
  const { execute, notify } = useData();
  const [price, setPrice] = useState(String(offer.price));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return <Dialog title="Un mejor precio, a tiempo" description="El establecimiento decide el descuento. Las reservas ya registradas conservan su precio original." onClose={onClose}><form onSubmit={async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    const result = await execute({ type: "price", offerId: offer.id, price: Number(price) });
    setBusy(false);
    if (!result.ok) { setError(result.message); return; }
    notify("Precio de oferta actualizado."); onClose();
  }}>{error && <p role="alert" className="form-error">{error}</p>}<div className="field"><label htmlFor="edit-price">Nuevo precio de oferta (Bs)</label><input id="edit-price" autoFocus type="number" min="0.01" max={offer.regularPrice - 0.01} step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required /><small>Precio habitual: {money(offer.regularPrice)} por unidad de medida.</small></div><div className="dialog-actions"><button className="btn btn-secondary" type="button" onClick={onClose}>Volver</button><button className="btn btn-primary" type="submit" disabled={busy}><Save size={16} />Guardar precio</button></div></form></Dialog>;
}

export function CollectDialog({ reservationId, onClose }: { reservationId: string; onClose: () => void }) {
  const { state, execute, notify } = useData();
  const [busy, setBusy] = useState(false);
  const reservation = state?.reservations.find((item) => item.id === reservationId);
  if (!state || !reservation) return null;
  const offer = state.offers.find((item) => item.id === reservation.offerId)!;
  const lot = state.lots.find((item) => item.id === offer.lotId)!;
  return <Dialog title="Confirma el retiro en el local" description="Verifica el código con la persona que retira. Solo confirma cuando hayas entregado el alimento." onClose={onClose}><div className="confirmation-summary"><h3>{lot.name}</h3><dl><div><dt>Código</dt><dd><b>{reservation.code}</b></dd></div>{reservation.customerName && <div><dt>Retira</dt><dd>{reservation.customerName}</dd></div>}<div><dt>Cantidad</dt><dd>{reservation.quantity} {lot.unit}</dd></div><div className="summary-total"><dt>Total acordado</dt><dd>{money(reservation.quantity * reservation.unitPrice)}</dd></div></dl></div><form onSubmit={async (event) => { event.preventDefault(); if (busy) return; setBusy(true); const result = await execute({ type: "collect", reservationId }); setBusy(false); if (result.ok) { notify("Retiro confirmado. El historial y los indicadores ya están actualizados."); onClose(); } else onClose(); }}><label className="declaration mt-5"><input type="checkbox" required /><span>Verifiqué la reserva y entregué la cantidad indicada en el establecimiento.</span></label><div className="dialog-actions"><button type="button" className="btn btn-secondary" onClick={onClose}>Volver</button><button type="submit" className="btn btn-primary" disabled={busy}><Check size={17} />Confirmar retiro</button></div></form></Dialog>;
}
