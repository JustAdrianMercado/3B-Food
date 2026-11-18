"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, Leaf, Save, Upload } from "lucide-react";
import { CATEGORIES, DomainError, UNITS, dateLabel, discount, fromLocalInput, localDate, localInput, money, type Category, type Lot, type Offer, type Unit } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { useData } from "./data-provider";
import { Dialog, Stepper } from "./ui";

const PUBLISH_STEPS = ["Producto", "Cantidad y precio", "Retiro", "Fechas del lote", "Revisar"] as const;
const ALERT_OPTIONS = [{ value: "30", label: "30 minutos antes" }, { value: "60", label: "1 hora antes" }, { value: "120", label: "2 horas antes" }, { value: "360", label: "6 horas antes" }, { value: "1440", label: "24 horas antes" }];
const DATE_TYPES: { value: Lot["dateType"]; help: string }[] = [
  { value: "Límite de oferta", help: "Preparaciones del día: se ofrecen solo hoy." },
  { value: "Consumo preferente", help: "Conserva su calidad hasta la fecha indicada." },
  { value: "Vencimiento", help: "Producto envasado con fecha de vencimiento." },
];

type Draft = {
  name: string; description: string; category: Category; quantity: string; unit: Unit; regularPrice: string; price: string;
  pickupStart: string; pickupEnd: string; alertMinutes: string; entryDate: string; dateType: Lot["dateType"]; foodDate: string; suitability: boolean;
};

function initialDraft(): Draft {
  const now = Date.now();
  const tonight = Date.parse(`${localDate(now)}T21:00:00-04:00`);
  const end = tonight - now >= 2 * 3_600_000 ? tonight : now + 3 * 3_600_000;
  return {
    name: "", description: "", category: "Cocina del día", quantity: "5", unit: "porciones", regularPrice: "", price: "",
    pickupStart: localInput(now), pickupEnd: localInput(end), alertMinutes: "120", entryDate: localDate(now), dateType: "Consumo preferente", foodDate: localDate(end), suitability: false,
  };
}

/** Five short steps instead of one long form; every step is validated before moving on. */
export function PublishLotDialog({ establishmentId, onClose }: { establishmentId: string; onClose: () => void }) {
  const { execute, notify } = useData();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(initialDraft);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const text = (key: "name" | "description" | "quantity" | "regularPrice" | "price" | "pickupStart" | "pickupEnd" | "entryDate" | "foodDate") => ({ value: draft[key], onChange: (event: { target: { value: string } }) => set(key, event.target.value) });
  const regular = Number(draft.regularPrice);
  const price = Number(draft.price);
  const off = regular > 0 && price > 0 && price < regular ? Math.round((1 - price / regular) * 100) : null;

  const stepError = (): string => {
    if (step === 1 && !(price < regular)) return "El precio de oferta debe ser menor al precio habitual.";
    if (step === 2) {
      if (Date.parse(fromLocalInput(draft.pickupEnd)) <= Date.parse(fromLocalInput(draft.pickupStart))) return "El fin del retiro debe ser posterior a su inicio.";
      if (Date.parse(fromLocalInput(draft.pickupEnd)) <= Date.now()) return "El fin del retiro debe estar en el futuro.";
    }
    if (step === 3 && draft.foodDate < draft.pickupEnd.slice(0, 10)) return "La fecha del alimento no puede ser anterior al fin del retiro.";
    return "";
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    if (!event.currentTarget.reportValidity()) return;
    const problem = stepError();
    setError(problem);
    if (problem) return;
    if (step < PUBLISH_STEPS.length - 1) { setStep(step + 1); return; }
    setBusy(true);
    try {
      const pickupEndsAt = fromLocalInput(draft.pickupEnd);
      const result = await execute({ type: "publish", input: {
        establishmentId, name: draft.name, description: draft.description, category: draft.category, quantity: Number(draft.quantity), unit: draft.unit,
        regularPrice: regular, price, entryAt: fromLocalInput(`${draft.entryDate}T00:00`), dateType: draft.dateType, foodDate: draft.foodDate,
        commercializationEndsAt: pickupEndsAt, pickupStartsAt: fromLocalInput(draft.pickupStart), pickupEndsAt,
        alertMinutes: Number(draft.alertMinutes), suitabilityDeclared: draft.suitability,
      } });
      if (!result.ok) { setError(result.message); return; }
      notify("Lote registrado y oferta publicada. Ya aparece en el catálogo.");
      onClose();
    } catch (caught) { setError(caught instanceof DomainError ? caught.message : "Revisa los datos y las fechas antes de publicar."); }
    finally { setBusy(false); }
  };

  const day = (value: string) => dateLabel(`${value}T12:00:00-04:00`);
  const sameDay = draft.pickupEnd.slice(0, 10) === draft.pickupStart.slice(0, 10);
  const summary: [string, string][] = [
    ["Producto", `${draft.name} · ${draft.category}`],
    ["Cantidad", `${draft.quantity} ${draft.unit}`],
    ["Precio", `${money(price || 0)} (antes ${money(regular || 0)})${off !== null ? ` · −${off}%` : ""}`],
    ["Retiro", `${day(draft.pickupStart.slice(0, 10))}, ${draft.pickupStart.slice(11)} a ${sameDay ? "" : `${day(draft.pickupEnd.slice(0, 10))}, `}${draft.pickupEnd.slice(11)}`],
    ["Alerta", ALERT_OPTIONS.find((item) => item.value === draft.alertMinutes)?.label ?? ""],
    ["Lote", `Ingreso ${day(draft.entryDate)} · ${draft.dateType} ${day(draft.foodDate)}`],
  ];

  return <Dialog title="Publicar un excedente" description="Registra el lote y publícalo en el catálogo. Horarios de Cochabamba (UTC−4)." onClose={onClose} wide>
    <Stepper steps={PUBLISH_STEPS} current={step} onSelect={(index) => { setError(""); setStep(index); }} label="Pasos para publicar" />
    <p className="stepper-caption">Paso {step + 1} de {PUBLISH_STEPS.length} · <b>{PUBLISH_STEPS[step]}</b></p>
    <form onSubmit={submit}>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="wizard-step" key={step}>
        {step === 0 && <div className="form-grid">
          <div className="field field-full"><label htmlFor="lot-name">Nombre del producto o paquete *</label><input id="lot-name" {...text("name")} placeholder="Ej. Sillpancho con arroz y ensalada" required minLength={3} maxLength={100} autoFocus /></div>
          <div className="field field-full"><label htmlFor="lot-category">Categoría *</label><select id="lot-category" value={draft.category} onChange={(event) => set("category", event.target.value as Category)}>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></div>
          <div className="field field-full"><label htmlFor="lot-description">Qué incluye y cómo conservarlo *</label><textarea id="lot-description" {...text("description")} placeholder="Ej. Porción completa preparada hoy. Mantener refrigerado y recalentar antes de consumir. Contiene huevo." required minLength={10} maxLength={1200} /><small>Menciona los alérgenos conocidos.</small></div>
        </div>}
        {step === 1 && <div className="form-grid">
          <div className="field"><label htmlFor="lot-quantity">Cantidad a publicar *</label><input id="lot-quantity" {...text("quantity")} type="number" inputMode={draft.unit === "kg" ? "decimal" : "numeric"} min={draft.unit === "kg" ? 0.001 : 1} max={10000} step={draft.unit === "kg" ? 0.001 : 1} required autoFocus /><small>Solo el excedente, no todo tu inventario.</small></div>
          <div className="field"><label htmlFor="lot-unit">Unidad *</label><select id="lot-unit" value={draft.unit} onChange={(event) => set("unit", event.target.value as Unit)}>{UNITS.map((value) => <option key={value}>{value}</option>)}</select></div>
          <div className="field"><label htmlFor="lot-regular-price">Precio habitual (Bs) *</label><input id="lot-regular-price" {...text("regularPrice")} type="number" inputMode="decimal" min="0.01" max="100000" step="0.01" placeholder="Ej. 35" required /><small>Por {draft.unit === "kg" ? "kilogramo" : draft.unit === "porciones" ? "porción" : "unidad"}.</small></div>
          <div className="field"><label htmlFor="lot-price">Precio de oferta (Bs) *</label><input id="lot-price" {...text("price")} type="number" inputMode="decimal" min="0.01" max="99999.99" step="0.01" placeholder="Ej. 20" required /><small>Debe ser menor al precio habitual.</small></div>
          <div className="field-full"><div className={cn("discount-preview", off === null && "discount-preview--empty")}>{off !== null ? <><strong>−{off}%</strong><span>Los clientes ahorran {money(regular - price)} por {draft.unit === "kg" ? "kg" : draft.unit === "porciones" ? "porción" : "unidad"}.</span></> : <span>Escribe ambos precios para ver el descuento.</span>}</div></div>
        </div>}
        {step === 2 && <div className="form-grid">
          <div className="field"><label htmlFor="lot-pickup-start">Desde *</label><input id="lot-pickup-start" {...text("pickupStart")} type="datetime-local" required autoFocus /><small>Cuándo pueden pasar a retirar.</small></div>
          <div className="field"><label htmlFor="lot-pickup-end">Hasta (tiempo límite) *</label><input id="lot-pickup-end" {...text("pickupEnd")} type="datetime-local" required /><small>Después de esta hora la oferta se cierra sola.</small></div>
          <div className="field field-full"><label htmlFor="lot-alert">Avisarme en el panel *</label><select id="lot-alert" value={draft.alertMinutes} onChange={(event) => set("alertMinutes", event.target.value)}>{ALERT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><small>Elige según cuánto dura este alimento. Verás la alerta en «Vista general».</small></div>
        </div>}
        {step === 3 && <div className="form-grid">
          <fieldset className="field field-full choice-group"><legend className="field-label">Tipo de fecha del alimento *</legend>{DATE_TYPES.map((option) => <label key={option.value} className={cn("choice", draft.dateType === option.value && "selected")}><input type="radio" name="dateType" value={option.value} checked={draft.dateType === option.value} onChange={() => set("dateType", option.value)} /><span><b>{option.value}</b><small>{option.help}</small></span></label>)}</fieldset>
          <div className="field"><label htmlFor="lot-food-date">Fecha del alimento *</label><input id="lot-food-date" {...text("foodDate")} type="date" min={localDate()} required /><small>{draft.dateType === "Vencimiento" ? "Fecha de vencimiento del envase." : "Hasta cuándo se puede consumir."}</small></div>
          <div className="field"><label htmlFor="lot-entry">Fecha de ingreso al inventario *</label><input id="lot-entry" {...text("entryDate")} type="date" required max={localDate()} /><small>Ordena el inventario por PEPS (primero en entrar, primero en salir).</small></div>
        </div>}
        {step === 4 && <>
          <dl className="review-list">{summary.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
          <label className="declaration mt-4"><input type="checkbox" checked={draft.suitability} onChange={(event) => set("suitability", event.target.checked)} required /><span>Respaldo que el alimento es apto para el consumo y conserva las condiciones adecuadas hasta el tiempo límite indicado. *</span></label>
          <div className="note-box"><Leaf size={17} /><span>La oferta aparecerá en el catálogo en cuanto la publiques, con una fotografía de su categoría.</span></div>
        </>}
      </div>
      <div className="dialog-actions wizard-actions">
        {step === 0 ? <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button> : <button type="button" className="btn btn-secondary" onClick={() => { setError(""); setStep(step - 1); }}><ArrowLeft size={16} />Atrás</button>}
        {step < PUBLISH_STEPS.length - 1 ? <button type="submit" className="btn btn-primary">Continuar<ArrowRight size={16} /></button> : <button type="submit" className="btn btn-primary" disabled={busy} aria-busy={busy}><Upload size={16} />{busy ? "Publicando…" : "Publicar oferta"}</button>}
      </div>
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
  }}>{error && <p role="alert" className="form-error">{error}</p>}<div className="field"><label htmlFor="edit-price">Nuevo precio de oferta (Bs)</label><input id="edit-price" autoFocus type="number" min="0.01" max={offer.regularPrice - 0.01} step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required /><small>Precio habitual: {money(offer.regularPrice)} por unidad de medida. Descuento actual: −{discount(offer)}%.</small></div><div className={cn("discount-preview mt-4", !(Number(price) > 0 && Number(price) < offer.regularPrice) && "discount-preview--empty")}>{Number(price) > 0 && Number(price) < offer.regularPrice ? <><strong>−{Math.round((1 - Number(price) / offer.regularPrice) * 100)}%</strong><span>Nuevo descuento sobre el precio habitual.</span></> : <span>El precio debe ser mayor que cero y menor a {money(offer.regularPrice)}.</span>}</div><div className="dialog-actions"><button className="btn btn-secondary" type="button" onClick={onClose}>Volver</button><button className="btn btn-primary" type="submit" disabled={busy}><Save size={16} />Guardar precio</button></div></form></Dialog>;
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
