import type { Metadata } from "next";
import { OfferDetail } from "@/components/offer-detail";
export const metadata: Metadata = { title: "Una oportunidad para aprovechar" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OfferDetail id={id} />;
}
