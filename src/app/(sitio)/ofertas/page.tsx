import type { Metadata } from "next";
import { OfferCatalog } from "@/components/offer-catalog";
import { PageHeading } from "@/components/ui";
import { MapPin } from "lucide-react";

export const metadata: Metadata = { title: "Explora las ofertas de tu barrio" };
export default function Page() {
  return <><div className="container catalog-page-heading"><PageHeading eyebrow="CADA EXCEDENTE, UNA POSIBILIDAD" title="Tu próximo buen plan está cerca." description="Encuentra alimentos por aprovechar. Reserva y retira en el establecimiento." action={<span className="city-chip"><MapPin size={16} />Cochabamba, Bolivia</span>} /></div><OfferCatalog /></>;
}
