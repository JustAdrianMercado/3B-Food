"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BarChart3, ChevronDown, LayoutDashboard, LogOut, ShoppingBag, Store } from "lucide-react";
import { logout } from "@/lib/auth-actions";
import { roleLabel, type Viewer } from "@/lib/domain";
import { cn } from "@/lib/utils";

export function LogoutButton({ className, redirectTo }: { className?: string; redirectTo?: string }) {
  return <form action={logout}>{redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}<button type="submit" className={className}><LogOut size={15} />Cerrar sesión</button></form>;
}

export const accountInitials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();

/** Links each role can reach from the account menu. */
export function accountLinks(viewer: Viewer) {
  if (viewer.role === "consumidor") return [{ href: "/mis-reservas", label: "Mis reservas", icon: ShoppingBag }];
  if (viewer.role === "establecimiento") return [{ href: "/panel", label: "Panel de mi negocio", icon: LayoutDashboard }, { href: "/panel/reservas", label: "Reservas y retiros", icon: ShoppingBag }];
  return [{ href: "/admin", label: "Administración", icon: BarChart3 }, { href: "/panel", label: "Panel de establecimientos", icon: Store }];
}

export function AccountMenu({ viewer }: { viewer: Viewer }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);
  return <div className="account-menu" ref={ref}>
    <button type="button" className={cn("account-trigger", open && "open")} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="account-popover">
      <span className="account-avatar" aria-hidden="true">{accountInitials(viewer.name)}</span><span className="sr-only">Cuenta de {viewer.name}</span><ChevronDown size={14} aria-hidden="true" />
    </button>
    {open && <div className="account-popover" id="account-popover">
      <div className="account-identity"><span className="account-avatar account-avatar--large" aria-hidden="true">{accountInitials(viewer.name)}</span><div><b>{viewer.name}</b><small>{viewer.email}</small><span className="status-pill status-green">{roleLabel[viewer.role]}</span></div></div>
      <nav aria-label="Tu cuenta">{accountLinks(viewer).map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}><link.icon size={16} />{link.label}</Link>)}</nav>
      <LogoutButton className="account-logout" />
    </div>}
  </div>;
}
