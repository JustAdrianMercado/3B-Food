import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, HeartHandshake, Leaf, MapPin, Recycle, Wallet } from "lucide-react";
import { PageHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "EcoRescate conecta los excedentes alimentarios de restaurantes y supermercados de Cochabamba con personas de su barrio.",
};

const values = [
  { icon: Leaf, title: "La comida tiene valor", text: "Un alimento apto para el consumo merece llegar a una mesa antes que a la basura." },
  { icon: Wallet, title: "Buenos precios, de verdad", text: "Quien compra ahorra y quien vende recupera parte de lo que habría perdido." },
  { icon: MapPin, title: "Lo local primero", text: "Trabajamos con negocios de Cochabamba y con el retiro en el propio local." },
  { icon: HeartHandshake, title: "Confianza y claridad", text: "Cada establecimiento respalda lo que publica, y cada operación queda registrada." },
];

export default function Page() {
  return <div className="container content-page">
    <PageHeading eyebrow="SOBRE ECORESCATE" title="La comida tiene valor. Aprovecharla también." />
    <section className="content-intro"><div><h2>Identificar a tiempo.<br />Organizar mejor. Conectar oportunidades.</h2><p>Cada día, restaurantes y supermercados de Cochabamba terminan con alimentos que siguen siendo aptos para el consumo pero que no alcanzan a venderse. Muchas veces se identifican demasiado tarde, se pierden en el inventario o nadie se entera de que están disponibles.</p><p>EcoRescate nace para cambiar eso. Damos a los establecimientos una forma simple de registrar sus excedentes, recibir avisos antes de su fecha límite y publicarlos con descuento. Y damos a las personas de su barrio una forma fácil de encontrarlos, reservarlos y retirarlos.</p></div><aside className="content-callout"><Recycle size={30} strokeWidth={1.5} /><b>Menos desperdicio, más oportunidades.</b><p>Cada oferta retirada es comida que encontró su mesa y un establecimiento que recuperó parte de su valor.</p><Link className="text-link" href="/ofertas">Explorar ofertas<ArrowUpRight size={16} /></Link></aside></section>
    <section className="content-section"><h2>Lo que nos importa.</h2><div className="scope-list">{values.map((item) => <div key={item.title}><item.icon size={21} strokeWidth={1.6} /><div><b>{item.title}</b><p>{item.text}</p></div></div>)}</div></section>
    <section className="content-section cta-row"><Link href="/negocios" className="btn btn-primary">Soy un establecimiento<ArrowUpRight size={17} /></Link><Link href="/preguntas-frecuentes" className="text-link">Preguntas frecuentes<ArrowUpRight size={15} /></Link></section>
  </div>;
}
