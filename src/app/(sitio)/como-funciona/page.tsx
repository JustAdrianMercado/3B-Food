import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock3, Leaf, MapPin, QrCode, ShieldCheck, ShoppingBag, Wallet, X } from "lucide-react";
import { PageHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Cómo funciona",
  description: "Encuentra una oferta, resérvala en línea y retírala en el local. Así funciona EcoRescate en Cochabamba.",
};

const steps = [
  { icon: MapPin, index: "PASO 01", title: "Encuentra algo cerca", text: "Explora las ofertas por categoría, zona o precio. Cada una indica qué incluye, cuánto queda disponible y hasta cuándo puedes retirarla.", href: "/ofertas", cta: "Explorar ofertas" },
  { icon: ShoppingBag, index: "PASO 02", title: "Reserva tu oportunidad", text: "Elige la cantidad y confirma. Recibirás un código de reserva que también queda guardado en «Mis reservas».", href: "/mis-reservas", cta: "Ver mis reservas" },
  { icon: Leaf, index: "PASO 03", title: "Retira y disfruta", text: "Acércate al local dentro del horario de retiro, muestra tu código y paga directamente en el establecimiento.", href: "/establecimientos", cta: "Ver establecimientos" },
];

const details = [
  { icon: QrCode, title: "Tu código de reserva", text: "Identifica tu reserva en el local. El establecimiento lo verifica y confirma la entrega manualmente." },
  { icon: Clock3, title: "Horario de retiro", text: "Cada oferta tiene su propio horario. Si no retiras a tiempo, la reserva termina como no retirada." },
  { icon: Wallet, title: "Pago en el local", text: "EcoRescate no cobra en línea. El total que ves al reservar es el que acuerdas con el establecimiento." },
  { icon: X, title: "Cancelaciones", text: "Puedes cancelar una reserva pendiente desde «Mis reservas». La cantidad vuelve a estar disponible para otras personas." },
  { icon: ShieldCheck, title: "Calidad del alimento", text: "El establecimiento respalda la aptitud y la conservación de lo que publica. No se publican productos vencidos." },
  { icon: MapPin, title: "Sin envíos", text: "Todas las ofertas se retiran en persona en el local. Así llegan frescas y sin costos adicionales." },
];

export default function Page() {
  return <div className="container content-page">
    <PageHeading eyebrow="TAN SIMPLE COMO SUENA" title="De una oferta en tu pantalla a algo rico en tu mesa." description="EcoRescate conecta los excedentes de restaurantes y supermercados de Cochabamba con personas de su barrio. Tú encuentras un buen precio; el local evita que la comida se desperdicie." />
    <section className="content-section"><div className="scope-grid">{steps.map((item) => <article className="scope-card" key={item.index}><item.icon size={29} strokeWidth={1.4} /><span className="eyebrow">{item.index}</span><h3>{item.title}</h3><p>{item.text}</p><Link className="text-link" href={item.href}>{item.cta}<ArrowUpRight size={15} /></Link></article>)}</div></section>
    <section className="content-section"><h2>Lo que conviene saber.</h2><p>Unas pocas reglas hacen que todo funcione bien para ti y para el local.</p><div className="scope-list">{details.map((item) => <div key={item.title}><item.icon size={21} strokeWidth={1.6} /><div><b>{item.title}</b><p>{item.text}</p></div></div>)}</div></section>
    <section className="content-section cta-row"><Link href="/ofertas" className="btn btn-primary">Encuentra tu próxima oferta<ArrowUpRight size={17} /></Link><Link href="/preguntas-frecuentes" className="text-link">Preguntas frecuentes<ArrowUpRight size={15} /></Link></section>
  </div>;
}
