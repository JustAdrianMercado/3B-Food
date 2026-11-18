"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { login, registerCustomer, type AuthState } from "@/lib/auth-actions";

const initial: AuthState = {};

export function PasswordField({ id, label = "Contraseña", autoComplete, hint, value, onChange }: { id: string; label?: string; autoComplete: "current-password" | "new-password"; hint?: string; value?: string; onChange?: (value: string) => void }) {
  const [visible, setVisible] = useState(false);
  return <div className="field">
    <label htmlFor={id}>{label} *</label>
    <div className="password-input">
      <input id={id} name="password" type={visible ? "text" : "password"} required minLength={autoComplete === "new-password" ? 8 : 1} maxLength={72} autoComplete={autoComplete} aria-describedby={hint ? `${id}-hint` : undefined} {...(onChange ? { value, onChange: (event) => onChange(event.target.value) } : {})} />
      <button type="button" className="icon-button" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={visible}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button>
    </div>
    {hint && <small id={`${id}-hint`}>{hint}</small>}
  </div>;
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, initial);
  return <form action={action} className="auth-form">
    {state.error && <p className="form-error" role="alert">{state.error}</p>}
    <input type="hidden" name="next" value={next ?? ""} />
    <div className="field"><label htmlFor="login-email">Correo electrónico *</label><input id="login-email" name="email" type="email" required maxLength={160} autoComplete="email" autoFocus key={state.values?.email} defaultValue={state.values?.email} /></div>
    <PasswordField id="login-password" autoComplete="current-password" />
    <button type="submit" className="btn btn-primary w-full" disabled={pending} aria-busy={pending}><LogIn size={17} />{pending ? "Ingresando…" : "Ingresar"}</button>
    <p className="auth-switch">¿Todavía no tienes cuenta? <Link href={next ? `/registro?next=${encodeURIComponent(next)}` : "/registro"}>Crea tu cuenta<ArrowRight size={14} /></Link></p>
  </form>;
}

export function CustomerSignupForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(registerCustomer, initial);
  return <form action={action} className="auth-form">
    {state.error && <p className="form-error" role="alert">{state.error}</p>}
    <input type="hidden" name="next" value={next ?? ""} />
    <div className="field"><label htmlFor="signup-name">Nombre y apellido *</label><input id="signup-name" name="name" required minLength={2} maxLength={80} autoComplete="name" autoFocus key={state.values?.name} defaultValue={state.values?.name} /><small>El establecimiento lo verá junto a tu código al retirar.</small></div>
    <div className="field"><label htmlFor="signup-email">Correo electrónico *</label><input id="signup-email" name="email" type="email" required maxLength={160} autoComplete="email" key={state.values?.email} defaultValue={state.values?.email} /></div>
    <PasswordField id="signup-password" autoComplete="new-password" hint="Al menos 8 caracteres." />
    <button type="submit" className="btn btn-primary w-full" disabled={pending} aria-busy={pending}><UserPlus size={17} />{pending ? "Creando tu cuenta…" : "Crear cuenta"}</button>
    <p className="auth-switch">¿Ya tienes cuenta? <Link href={next ? `/ingresar?next=${encodeURIComponent(next)}` : "/ingresar"}>Ingresa<ArrowRight size={14} /></Link></p>
  </form>;
}
