import Link from "next/link";
import { ArrowLeft, Sprout } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-shell";

export default function NotFound() {
  return <><SiteHeader /><main id="contenido"><div className="container not-found"><Sprout size={50} strokeWidth={1.2} /><span className="eyebrow">PÁGINA NO ENCONTRADA</span><h1>Por aquí todavía<br />no ha brotado nada.</h1><p>Vuelve al inicio y encuentra una nueva oportunidad.</p><Link href="/" className="btn btn-primary"><ArrowLeft size={17} />Volver al inicio</Link></div></main><SiteFooter /></>;
}
