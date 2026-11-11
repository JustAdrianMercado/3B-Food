import type { Metadata } from "next";
import { OfferDetail } from "@/components/offer-detail";
import { getOfferSummary } from "@/lib/db/queries";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const offer = await getOfferSummary(id);
  if (!offer) return { title: "Oferta no disponible" };
  return { title: `${offer.name} · ${offer.establishment}`, description: offer.description.slice(0, 160) };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <OfferDetail id={id} />;
}
