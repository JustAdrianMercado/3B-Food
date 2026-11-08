"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Check, ChevronDown, Compass, Download, Leaf, Menu, RotateCcw, ShoppingBag, Store, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Brand, DemoBadge, Dialog } from "./ui";
import { useDemo } from "./demo-provider";
import { cn } from "@/lib/utils";

interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useDemo();
  const [open, setOpen] = useState(false);
  const profile = pathname.startsWith("/establecimiento") ? "establecimiento" : pathname.startsWith("/admin") ? "admin" : "consumidor";
  const pending = state?.reservations.filter((item) => item.status === "Reservada").length ?? 0;
  const links = [{ href: "/ofertas", label: "Explorar ofertas" }, { href: "/#como-funciona", label: "Cómo funciona" }, { href: "/proyecto", label: "El proyecto" }];
  const navigate = (value: string) => { setOpen(false); router.push(value === "establecimiento" ? "/establecimiento" : value === "admin" ? "/admin" : "/ofertas"); };
  return <>
    <div className="announcement"><Leaf size={13} /><span>La buena comida merece otra oportunidad.</span><span className="announcement-separator">·</span><span className="announcement-local">De Cochabamba, para Cochabamba</span></div>
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Navegación principal">{links.map((link) => <Link key={link.href} href={link.href} className={cn((pathname === link.href || (link.href === "/ofertas" && pathname.startsWith("/ofertas/"))) && "active")}>{link.label}</Link>)}</nav>
        <div className="header-actions">
          <label className="profile-select"><span className="sr-only">Perfil de demostración</span><select value={profile} onChange={(event) => navigate(event.target.value)}><option value="consumidor">Consumidor · demo</option><option value="establecimiento">Establecimiento · demo</option><option value="admin">Administrador · demo</option></select><ChevronDown size={14} /></label>
          <Link href="/mis-reservas" className="reservation-link"><ShoppingBag size={19} /><span>Mis reservas</span>{pending > 0 && <b>{pending}</b>}</Link>
          <button className="icon-button mobile-menu-toggle" aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}>{open ? <X size={23} /> : <Menu size={23} />}</button>
        </div>
      </div>
      <AnimatePresence>{open && <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mobile-menu" id="mobile-menu" aria-label="Menú móvil">{links.map((link) => <Link onClick={() => setOpen(false)} href={link.href} key={link.href}>{link.label}<ArrowRight size={17} /></Link>)}<label>Vista de demostración<select value={profile} onChange={(event) => navigate(event.target.value)}><option value="consumidor">Consumidor</option><option value="establecimiento">Establecimiento</option><option value="admin">Administrador</option></select></label></motion.nav>}</AnimatePresence>
    </header>
    <nav className="mobile-bottom-nav" aria-label="Accesos rápidos"><Link href="/ofertas" className={pathname.startsWith("/ofertas") || pathname === "/" ? "active" : ""}><Compass size={20} />Explorar</Link><Link href="/mis-reservas" className={pathname === "/mis-reservas" ? "active" : ""}><ShoppingBag size={20} />Mis reservas{pending > 0 && <span className="bottom-count">{pending}</span>}</Link><Link href="/establecimiento" className={profile === "establecimiento" ? "active" : ""}><Store size={20} />Mi negocio</Link></nav>
  </>;
}

export function DemoNotice() {
  const { storageAvailable, recovered } = useDemo();
  if (storageAvailable && !recovered) return null;
  return <div className="storage-notice" role="status">{!storageAvailable ? "Tu navegador no permite guardar datos. Puedes recorrer la demo, pero los cambios se perderán al recargar." : "Recuperamos los ejemplos porque los datos guardados no eran compatibles. Puedes continuar con la demostración."}</div>;
}

export function SiteFooter() {
  const { reset } = useDemo();
  const [resetOpen, setResetOpen] = useState(false);
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
      <div className="footer-top"><div className="footer-brand"><Brand light /><p>Más oportunidades para la comida.<br />Más posibilidades para nuestra ciudad.</p></div><div className="footer-links"><h3>Descubre</h3><Link href="/ofertas">Ofertas cerca de ti</Link><Link href="/#como-funciona">Cómo funciona</Link><Link href="/establecimiento">Soy un establecimiento</Link></div><div className="footer-links"><h3>Una propuesta con propósito</h3><Link href="/proyecto">La investigación</Link><Link href="/proyecto#alcances">Alcances y próximos pasos</Link><button onClick={install} className="footer-button" disabled={installed}>{installed ? <Check size={14} /> : <Download size={14} />}{installed ? "App instalada" : "Instalar aplicación"}</button></div><div className="footer-note"><DemoBadge /><p>Prototipo académico de Ingeniería de Sistemas. Los establecimientos y las operaciones de esta demo son ficticios.</p><button className="footer-button" onClick={() => setResetOpen(true)}><RotateCcw size={13} />Restablecer demo</button></div></div>
      <div className="footer-bottom"><span>© 2026 EcoRescate Cochabamba · Proyecto de investigación</span><span>Retiro en local · Pago acordado fuera de la plataforma</span></div>
    </div></footer>
    <AnimatePresence>{resetOpen && <Dialog title="¿Volvemos a empezar?" description="Se borrarán las publicaciones y reservas que hiciste en este navegador. Volverán los ejemplos originales con fechas vigentes." onClose={() => setResetOpen(false)}><div className="dialog-actions"><button className="btn btn-secondary" onClick={() => setResetOpen(false)}>Conservar cambios</button><button className="btn btn-primary" onClick={() => { reset(); setResetOpen(false); }}><RotateCcw size={16} />Restablecer demo</button></div></Dialog>}{installOpen && <Dialog title="Lleva EcoRescate contigo" description="La demostración se puede instalar desde un navegador compatible cuando se abre con HTTPS o en localhost." onClose={() => setInstallOpen(false)}><ol className="install-steps"><li><b>Android o escritorio</b><p>Abre el menú de Chrome o Edge y selecciona «Instalar aplicación» o «Añadir a pantalla de inicio».</p></li><li><b>iPhone o iPad</b><p>En Safari, pulsa Compartir y después «Añadir a pantalla de inicio».</p></li></ol><div className="note-box">La instalación no incorpora cuentas ni operaciones reales. Si pierdes la conexión verás una pantalla informativa.</div><button className="btn btn-primary w-full" onClick={() => setInstallOpen(false)}>Entendido</button></Dialog>}</AnimatePresence>
  </>;
}
