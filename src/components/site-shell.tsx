"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Check, Compass, Download, Leaf, Menu, ShoppingBag, Store, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Brand, Dialog } from "./ui";
import { useData } from "./data-provider";
import { cn } from "@/lib/utils";

interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const mainLinks = [
  { href: "/ofertas", label: "Ofertas" },
  { href: "/establecimientos", label: "Establecimientos" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/negocios", label: "Para negocios" },
];

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function SiteHeader() {
  const pathname = usePathname();
  const { state } = useData();
  const [open, setOpen] = useState(false);
  const pending = state?.reservations.filter((item) => item.mine && item.status === "Reservada").length ?? 0;
  return <>
    <div className="announcement"><Leaf size={13} /><span>La buena comida merece otra oportunidad.</span><span className="announcement-separator">·</span><span className="announcement-local">De Cochabamba, para Cochabamba</span></div>
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Navegación principal">{mainLinks.map((link) => <Link key={link.href} href={link.href} className={cn(isActive(pathname, link.href) && "active")} aria-current={isActive(pathname, link.href) ? "page" : undefined}>{link.label}</Link>)}</nav>
        <div className="header-actions">
          <Link href="/mis-reservas" className="reservation-link"><ShoppingBag size={19} /><span>Mis reservas</span>{pending > 0 && <b>{pending}</b>}</Link>
          <button className="icon-button mobile-menu-toggle" aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}>{open ? <X size={23} /> : <Menu size={23} />}</button>
        </div>
      </div>
      <AnimatePresence>{open && <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mobile-menu" id="mobile-menu" aria-label="Menú móvil">{[...mainLinks, { href: "/nosotros", label: "Nosotros" }, { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" }, { href: "/contacto", label: "Contacto" }, { href: "/panel", label: "Acceso para negocios" }].map((link) => <Link onClick={() => setOpen(false)} href={link.href} key={link.href}>{link.label}<ArrowRight size={17} /></Link>)}</motion.nav>}</AnimatePresence>
    </header>
    <nav className="mobile-bottom-nav" aria-label="Accesos rápidos"><Link href="/ofertas" className={pathname.startsWith("/ofertas") || pathname === "/" ? "active" : ""}><Compass size={20} />Explorar</Link><Link href="/establecimientos" className={pathname.startsWith("/establecimientos") ? "active" : ""}><Store size={20} />Locales</Link><Link href="/mis-reservas" className={pathname === "/mis-reservas" ? "active" : ""}><ShoppingBag size={20} />Mis reservas{pending > 0 && <span className="bottom-count">{pending}</span>}</Link></nav>
  </>;
}

export function SiteFooter() {
  const [installOpen, setInstallOpen] = useState(false);
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const prompt = (event: Event) => { event.preventDefault(); setInstallEvent(event as InstallEvent); };
    const complete = () => { setInstalled(true); setInstallEvent(null); };
    window.addEventListener("beforeinstallprompt", prompt);
    window.addEventListener("appinstalled", complete);
    const mode = window.matchMedia("(display-mode: standalone)");
    if (mode.matches) queueMicrotask(() => setInstalled(true));
    return () => { window.removeEventListener("beforeinstallprompt", prompt); window.removeEventListener("appinstalled", complete); };
  }, []);
  const install = async () => {
    if (!installEvent) { setInstallOpen(true); return; }
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallEvent(null);
  };
  return <>
    <footer className="site-footer"><div className="container">
      <div className="footer-top">
        <div className="footer-brand"><Brand light /><p>Más oportunidades para la comida.<br />Más posibilidades para nuestra ciudad.</p></div>
        <div className="footer-links"><h3>Descubre</h3><Link href="/ofertas">Ofertas cerca de ti</Link><Link href="/establecimientos">Establecimientos</Link><Link href="/como-funciona">Cómo funciona</Link><Link href="/mis-reservas">Mis reservas</Link></div>
        <div className="footer-links"><h3>Negocios</h3><Link href="/negocios">Para negocios</Link><Link href="/negocios/unirse">Quiero unirme</Link><Link href="/panel">Acceso al panel</Link></div>
        <div className="footer-links"><h3>EcoRescate</h3><Link href="/nosotros">Nosotros</Link><Link href="/preguntas-frecuentes">Preguntas frecuentes</Link><Link href="/contacto">Contacto</Link><button onClick={install} className="footer-button" disabled={installed}>{installed ? <Check size={14} /> : <Download size={14} />}{installed ? "App instalada" : "Instalar aplicación"}</button></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} EcoRescate Cochabamba</span><span>Retiro en el local · Pago acordado con el establecimiento</span></div>
    </div></footer>
    <AnimatePresence>{installOpen && <Dialog title="Lleva EcoRescate contigo" description="Instala EcoRescate desde un navegador compatible para abrirlo como una aplicación." onClose={() => setInstallOpen(false)}><ol className="install-steps"><li><b>Android o escritorio</b><p>Abre el menú de Chrome o Edge y selecciona «Instalar aplicación» o «Añadir a pantalla de inicio».</p></li><li><b>iPhone o iPad</b><p>En Safari, pulsa Compartir y después «Añadir a pantalla de inicio».</p></li></ol><button className="btn btn-primary w-full" onClick={() => setInstallOpen(false)}>Entendido</button></Dialog>}</AnimatePresence>
  </>;
}
