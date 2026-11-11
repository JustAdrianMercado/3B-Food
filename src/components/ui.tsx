"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Leaf, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Brand({ light = false }: { light?: boolean }) {
  return <Link className={cn("brand", light && "brand--light")} href="/" title="EcoRescate Cochabamba, inicio"><span className="brand-symbol"><Leaf size={24} strokeWidth={1.8} /></span><span>eco<span className="brand-weight">rescate</span><span className="brand-dot">.</span><small>COCHABAMBA</small></span></Link>;
}

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div initial={reduced ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.45, delay: reduced ? 0 : delay }} className={className}>{children}</motion.div>;
}

export function Dialog({ title, description, children, onClose, wide = false }: { title: string; description?: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(typeof document !== "undefined" && document.activeElement instanceof HTMLElement ? document.activeElement : null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const element = ref.current;
    const target = previousFocus.current;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    element?.querySelector<HTMLElement>("input:not([type=checkbox]):not([disabled]), textarea:not([disabled]), select:not([disabled])")?.focus({ preventScroll: true });
    return () => {
      element?.close(); document.body.style.overflow = previousOverflow;
      queueMicrotask(() => { if (target?.isConnected) target.focus({ preventScroll: true }); });
    };
  }, []);
  return (
    <dialog ref={ref} className={cn("dialog", wide && "dialog--wide")} aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="dialog-content">
        <div className="dialog-heading"><div><span className="eyebrow">ECORESCATE</span><h2 id={titleId}>{title}</h2>{description && <p id={descriptionId}>{description}</p>}</div><button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar diálogo"><X size={21} /></button></div>
        {children}
      </motion.div>
    </dialog>
  );
}

export function LoadingCards({ count = 3 }: { count?: number }) {
  return <div className="offer-grid" aria-label="Cargando ofertas" aria-busy="true">{Array.from({ length: count }, (_, i) => <div className="offer-skeleton" key={i}><div className="skeleton skeleton-image" /><div className="skeleton-lines"><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></div></div>)}</div>;
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>;
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) { return <Link className="text-link" href={href}>{children}<ArrowUpRight size={17} /></Link>; }
