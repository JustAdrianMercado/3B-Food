import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Respuestas sobre reservas, retiros, pagos y publicación de ofertas en EcoRescate.",
};

const groups = [
  { id: "consumidores", title: "Para quienes compran", items: [
    { q: "¿Qué tipo de alimentos encuentro en EcoRescate?", a: "Excedentes aptos para el consumo de restaurantes y supermercados de Cochabamba: platos del día, panadería, frutas y verduras, lácteos y productos de despensa próximos a su fecha de consumo preferente." },
    { q: "¿Cómo pago mi reserva?", a: "Directamente en el establecimiento al momento del retiro. EcoRescate no realiza cobros en línea; el total que ves al reservar es el que acuerdas con el local." },
    { q: "¿Hacen envíos a domicilio?", a: "No. Todas las ofertas se retiran en persona en el local, dentro del horario de retiro indicado en cada una." },
    { q: "¿Qué pasa si no llego a retirar?", a: "Cuando termina el horario de retiro, la reserva queda registrada como no retirada y la oferta se cierra. Si sabes que no podrás ir, cancela la reserva para que otra persona pueda aprovecharla." },
    { q: "¿Puedo cancelar una reserva?", a: "Sí, mientras esté pendiente. Hazlo desde «Mis reservas»; la cantidad vuelve a estar disponible para otras personas." },
    { q: "¿Quién garantiza la calidad del alimento?", a: "Cada establecimiento respalda la aptitud para el consumo, la conservación y la cadena de frío de lo que publica. Consulta alérgenos e indicaciones de conservación al retirar." },
  ] },
  { id: "negocios", title: "Para establecimientos", items: [
    { q: "¿Qué puedo publicar?", a: "Alimentos aptos para el consumo que no alcanzarás a vender en tu horario habitual. No se permiten productos vencidos, en mal estado ni ofertas cuyo plazo comercial ya terminó." },
    { q: "¿Cómo se definen las alertas?", a: "Al registrar un lote eliges con cuánta anticipación quieres el aviso, de 30 minutos a 24 horas, según la vida útil del alimento. Los avisos aparecen en tu panel." },
    { q: "¿Puedo cambiar el precio de una oferta?", a: "Sí. Puedes modificar el precio o pausar la oferta mientras siga vigente. Las reservas que ya existían conservan el precio con el que se hicieron." },
    { q: "¿Cómo confirmo una entrega?", a: "Desde «Reservas y retiros» en tu panel: verifica el código con la persona que retira y confirma la entrega dentro del horario." },
    { q: "¿EcoRescate cobra comisión o procesa pagos?", a: "EcoRescate no procesa pagos. El cobro se acuerda directamente entre tu establecimiento y la persona que retira." },
  ] },
];

export default function Page() {
  return <div className="container content-page">
    <PageHeading eyebrow="AYUDA" title="Preguntas frecuentes." description="Lo que más nos preguntan sobre reservas, retiros y publicación de ofertas." />
    {groups.map((group) => <section key={group.id} id={group.id} className="content-section" aria-labelledby={`${group.id}-title`}><h2 id={`${group.id}-title`}>{group.title}</h2><div className="faq-list">{group.items.map((item) => <details key={item.q} className="faq-item"><summary>{item.q}</summary><p>{item.a}</p></details>)}</div></section>)}
    <section className="content-section cta-row"><Link href="/como-funciona" className="btn btn-secondary">Cómo funciona<ArrowUpRight size={16} /></Link><Link href="/negocios" className="text-link">Información para negocios<ArrowUpRight size={15} /></Link><Link href="/contacto" className="text-link">¿Otra pregunta? Escríbenos<ArrowUpRight size={15} /></Link></section>
  </div>;
}
