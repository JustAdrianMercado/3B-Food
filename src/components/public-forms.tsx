"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Send } from "lucide-react";
import { submitApplication, submitContact, type FormState } from "@/lib/actions";
import { ZONES } from "@/lib/domain";

const initial: FormState = { status: "idle" };

function Success({ title, text }: { title: string; text: string }) {
  return <div className="form-success" role="status"><CheckCircle2 size={34} strokeWidth={1.6} /><h2>{title}</h2><p>{text}</p><Link href="/" className="text-link">Volver al inicio<ArrowUpRight size={15} /></Link></div>;
}

export function ApplicationForm() {
  const [state, action, pending] = useActionState(submitApplication, initial);
  if (state.status === "success") return <Success title="¡Gracias por sumarte!" text="Recibimos tu solicitud. Te contactaremos por teléfono o WhatsApp para coordinar la incorporación de tu establecimiento." />;
  return <form action={action} className="public-form">
    {state.status === "error" && <p className="form-error" role="alert">{state.message}</p>}
    <div className="form-grid">
      <div className="field field-full"><label htmlFor="app-business">Nombre del establecimiento *</label><input id="app-business" name="businessName" required minLength={2} maxLength={120} autoComplete="organization" /></div>
      <div className="field"><label htmlFor="app-type">Tipo *</label><select id="app-type" name="businessType" required defaultValue=""><option value="" disabled>Selecciona una opción</option><option>Restaurante</option><option>Supermercado</option><option>Otro</option></select></div>
      <div className="field"><label htmlFor="app-zone">Zona *</label><input id="app-zone" name="zone" required minLength={2} maxLength={80} list="app-zones" placeholder="Ej. Cala Cala" /><datalist id="app-zones">{ZONES.map((zone) => <option key={zone} value={zone} />)}</datalist></div>
      <div className="field"><label htmlFor="app-contact">Persona de contacto *</label><input id="app-contact" name="contactName" required minLength={2} maxLength={80} autoComplete="name" /></div>
      <div className="field"><label htmlFor="app-phone">Teléfono o WhatsApp *</label><input id="app-phone" name="phone" type="tel" required minLength={6} maxLength={30} autoComplete="tel" /></div>
      <div className="field field-full"><label htmlFor="app-email">Correo electrónico</label><input id="app-email" name="email" type="email" maxLength={160} autoComplete="email" /></div>
      <div className="field field-full"><label htmlFor="app-message">¿Qué tipo de excedentes suelen tener?</label><textarea id="app-message" name="message" maxLength={1500} placeholder="Ej. pan y repostería al final de la tarde, platos del día, frutas y verduras…" /></div>
    </div>
    <p className="form-note">Usaremos estos datos solo para contactarte sobre tu incorporación a EcoRescate.</p>
    <button type="submit" className="btn btn-primary" disabled={pending}><Send size={16} />{pending ? "Enviando…" : "Enviar solicitud"}</button>
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
