import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BarChart3, Bell, ClipboardList, PackageSearch, Percent, ShoppingBag, Store } from "lucide-react";
import { PageHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Para negocios",
  description: "Publica los excedentes de tu restaurante o supermercado, organiza tu inventario y recupera parte de su valor con EcoRescate.",
};

const benefits = [
  { icon: Percent, index: "RECUPERA VALOR", title: "Vende lo que hoy se descarta", text: "Ofrece a un mejor precio los alimentos que siguen siendo aptos pero que no alcanzarás a vender en tu horario habitual." },
  { icon: Bell, index: "A TIEMPO", title: "Identifica tus excedentes antes", text: "Recibe avisos en tu panel cuando un lote se acerca a su límite, según la vida útil que tú defines para cada alimento." },
  { icon: Store, index: "TU BARRIO", title: "Llega a nuevas personas", text: "Tus ofertas aparecen en el catálogo y en tu página de establecimiento, para quienes buscan comida cerca de ti." },
];

const features = [
  { icon: PackageSearch, title: "Inventario por lotes", text: "Registra cada lote con su fecha de ingreso y su fecha de vencimiento o consumo preferente. Ordénalo por ingreso (PEPS) o por fecha límite." },
  { icon: Bell, title: "Alertas preventivas", text: "Elige con cuánta anticipación quieres el aviso, de 30 minutos a 24 horas, según el alimento." },
  { icon: Percent, title: "Precios y descuentos", text: "Define el precio habitual y el de oferta. Cámbialo o pausa la oferta cuando lo necesites; las reservas existentes conservan su precio." },
  { icon: ShoppingBag, title: "Reservas y retiros", text: "Consulta las reservas por código y confirma manualmente cada entrega dentro del horario de retiro." },
  { icon: ClipboardList, title: "Historial completo", text: "Cada publicación, reserva, retiro, cancelación y cambio de precio queda registrado." },
  { icon: BarChart3, title: "Indicadores", text: "Cantidades publicadas, reservadas y retiradas por unidad de medida, con exportación a CSV." },
];

export default function Page() {
  return <div className="container content-page">
    <PageHeading eyebrow="PARA RESTAURANTES Y SUPERMERCADOS" title="Tu excedente puede ser el buen plan de alguien más." description="EcoRescate te ayuda a identificar a tiempo los alimentos que podrías perder, publicarlos con descuento y entregarlos en tu propio local." action={<Link className="btn btn-primary" href="/negocios/unirse">Quiero unirme<ArrowUpRight size={16} /></Link>} />
    <section className="content-section"><div className="scope-grid">{benefits.map((item) => <article className="scope-card" key={item.index}><item.icon size={29} strokeWidth={1.4} /><span className="eyebrow">{item.index}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>
    <section className="content-section"><h2>Todo lo que necesitas en un panel.</h2><p>Un solo lugar para organizar tus excedentes, desde el registro del lote hasta la entrega.</p><div className="scope-list">{features.map((item) => <div key={item.title}><item.icon size={21} strokeWidth={1.6} /><div><b>{item.title}</b><p>{item.text}</p></div></div>)}</div></section>
    <section className="content-section"><div className="policy-box"><h3>Condiciones para publicar</h3><ul>
      <li>Solo se publican alimentos aptos para el consumo. Tu establecimiento respalda su calidad, conservación y cadena de frío.</li>
      <li>No se permiten productos vencidos, en mal estado ni ofertas cuyo plazo de comercialización ya terminó.</li>
      <li>El retiro es presencial en tu local, dentro del horario que definas. EcoRescate no gestiona envíos.</li>
      <li>EcoRescate no procesa pagos: el cobro se acuerda directamente con la persona que retira.</li>
    </ul></div></section>
    <section className="content-section cta-row"><Link href="/negocios/unirse" className="btn btn-primary">Quiero sumar mi establecimiento<ArrowUpRight size={17} /></Link><Link href="/panel" className="btn btn-secondary">Ya soy parte: ir al panel</Link><Link href="/preguntas-frecuentes#negocios" className="text-link">Preguntas de establecimientos<ArrowUpRight size={15} /></Link></section>
  </div>;
}
