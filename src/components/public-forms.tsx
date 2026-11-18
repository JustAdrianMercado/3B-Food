"use client";

import { useActionState, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, Send, Store } from "lucide-react";
import { submitContact, type FormState } from "@/lib/actions";
import { registerBusiness, type BusinessInput } from "@/lib/auth-actions";
import { ZONES } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { PasswordField } from "./auth-forms";
import { Stepper } from "./ui";

const initial: FormState = { status: "idle" };

function Success({ title, text }: { title: string; text: string }) {
  return <div className="form-success" role="status"><CheckCircle2 size={34} strokeWidth={1.6} /><h2>{title}</h2><p>{text}</p><Link href="/" className="text-link">Volver al inicio<ArrowUpRight size={15} /></Link></div>;
}

const BUSINESS_STEPS = ["Tu negocio", "Atención", "Tu cuenta"] as const;
type BusinessDraft = Required<BusinessInput>;

/** Business sign-up in three short steps. The last step creates the establishment, its account and opens the panel. */
export function BusinessSignupForm() {
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<BusinessDraft>({ businessName: "", businessType: "Restaurante", zone: "Centro", address: "", openingHours: "", description: "", contactName: "", phone: "", email: "", password: "" });
  const bind = (key: keyof BusinessDraft) => ({ value: draft[key], onChange: (event: { target: { value: string } }) => setDraft((current) => ({ ...current, [key]: event.target.value })) });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || !event.currentTarget.reportValidity()) return;
    setError("");
    if (step < BUSINESS_STEPS.length - 1) { setStep(step + 1); return; }
    startTransition(async () => {
      const result = await registerBusiness(draft);
      if (result?.error) setError(result.error);
    });
  };
  return <form onSubmit={submit} className="public-form">
    <Stepper steps={BUSINESS_STEPS} current={step} onSelect={(index) => { setError(""); setStep(index); }} label="Pasos del registro" compact />
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="wizard-step" key={step}>
      {step === 0 && <div className="form-grid">
        <div className="field field-full"><label htmlFor="biz-name">Nombre del establecimiento *</label><input id="biz-name" {...bind("businessName")} required minLength={3} maxLength={80} autoComplete="organization" autoFocus placeholder="Ej. Pensión Doña Julia" /></div>
        <fieldset className="field field-full choice-group choice-group--inline"><legend className="field-label">Tipo *</legend>{(["Restaurante", "Supermercado"] as const).map((type) => <label key={type} className={cn("choice", draft.businessType === type && "selected")}><input type="radio" name="businessType" checked={draft.businessType === type} onChange={() => setDraft((current) => ({ ...current, businessType: type }))} /><span><b>{type}</b><small>{type === "Restaurante" ? "Restaurante, pensión, café o panadería" : "Supermercado, minimarket o tienda"}</small></span></label>)}</fieldset>
        <div className="field"><label htmlFor="biz-zone">Zona *</label><select id="biz-zone" {...bind("zone")} required>{ZONES.map((zone) => <option key={zone}>{zone}</option>)}</select></div>
        <div className="field"><label htmlFor="biz-address">Dirección *</label><input id="biz-address" {...bind("address")} required minLength={5} maxLength={140} autoComplete="street-address" placeholder="Ej. Av. Heroínas 456" /></div>
      </div>}
      {step === 1 && <div className="form-grid">
        <div className="field field-full"><label htmlFor="biz-hours">Días y horario de atención *</label><input id="biz-hours" {...bind("openingHours")} required minLength={5} maxLength={100} autoFocus placeholder="Ej. Lunes a sábado, 08:00–20:00" /></div>
        <div className="field field-full"><label htmlFor="biz-description">Cuéntale a tus clientes qué ofreces *</label><textarea id="biz-description" {...bind("description")} required minLength={20} maxLength={400} placeholder="Ej. Almuerzos caseros cada día. Al cierre ofrecemos las porciones que quedan a un mejor precio." /><small>Se mostrará en tu página pública. Entre 20 y 400 caracteres.</small></div>
      </div>}
      {step === 2 && <div className="form-grid">
        <div className="field"><label htmlFor="biz-contact">Tu nombre *</label><input id="biz-contact" {...bind("contactName")} required minLength={2} maxLength={80} autoComplete="name" autoFocus /></div>
        <div className="field"><label htmlFor="biz-phone">Teléfono o WhatsApp *</label><input id="biz-phone" {...bind("phone")} type="tel" required minLength={6} maxLength={30} autoComplete="tel" placeholder="Ej. 71234567" /></div>
        <div className="field field-full"><label htmlFor="biz-email">Correo para ingresar *</label><input id="biz-email" {...bind("email")} type="email" required maxLength={160} autoComplete="email" /></div>
        <div className="field-full"><PasswordField id="biz-password" autoComplete="new-password" hint="Al menos 8 caracteres." value={draft.password} onChange={(value) => setDraft((current) => ({ ...current, password: value }))} /></div>
      </div>}
    </div>
    <p className="form-note">{step < 2 ? `Paso ${step + 1} de ${BUSINESS_STEPS.length}. Podrás cambiar estos datos más adelante.` : "Al crear la cuenta, tu establecimiento aparece en el directorio y ya puedes publicar ofertas."}</p>
    <div className="wizard-actions">
      {step > 0 && <button type="button" className="btn btn-secondary" onClick={() => { setError(""); setStep(step - 1); }}><ArrowLeft size={16} />Atrás</button>}
      {step < BUSINESS_STEPS.length - 1 ? <button type="submit" className="btn btn-primary">Continuar<ArrowRight size={16} /></button> : <button type="submit" className="btn btn-primary" disabled={pending} aria-busy={pending}><Store size={16} />{pending ? "Creando tu cuenta…" : "Crear cuenta del negocio"}</button>}
    </div>
  </form>;
}

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initial);
  if (state.status === "success") return <Success title="Mensaje enviado" text="Gracias por escribirnos. Te responderemos al correo que indicaste." />;
  return <form action={action} className="public-form">
    {state.status === "error" && <p className="form-error" role="alert">{state.message}</p>}
    <div className="form-grid">
      <div className="field"><label htmlFor="contact-name">Nombre *</label><input id="contact-name" name="name" required minLength={2} maxLength={80} autoComplete="name" /></div>
      <div className="field"><label htmlFor="contact-email">Correo electrónico *</label><input id="contact-email" name="email" type="email" required maxLength={160} autoComplete="email" /></div>
      <div className="field field-full"><label htmlFor="contact-subject">Asunto *</label><input id="contact-subject" name="subject" required minLength={3} maxLength={120} /></div>
      <div className="field field-full"><label htmlFor="contact-message">Mensaje *</label><textarea id="contact-message" name="message" required minLength={10} maxLength={2000} /></div>
    </div>
    <button type="submit" className="btn btn-primary" disabled={pending}><Send size={16} />{pending ? "Enviando…" : "Enviar mensaje"}</button>
  </form>;
}
