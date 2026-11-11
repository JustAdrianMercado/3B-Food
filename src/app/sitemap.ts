import type { MetadataRoute } from "next";
import { offerStatus } from "@/lib/domain";
import { loadState } from "@/lib/db/queries";
import { siteUrl } from "@/lib/site";

const staticPages = ["/", "/ofertas", "/establecimientos", "/como-funciona", "/negocios", "/negocios/unirse", "/nosotros", "/preguntas-frecuentes", "/contacto"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const url = (path: string) => new URL(path, base).toString();
  const state = await loadState("public");
  const now = Date.now();
  const offers = state.offers.flatMap((offer) => {
    const lot = state.lots.find((item) => item.id === offer.lotId);
    return lot && offerStatus(offer, lot, now) === "Disponible" ? [{ url: url(`/ofertas/${offer.id}`), lastModified: offer.publishedAt, changeFrequency: "hourly" as const, priority: 0.6 }] : [];
  });
  return [
    ...staticPages.map((path) => ({ url: url(path), changeFrequency: path === "/ofertas" ? "hourly" as const : "monthly" as const, priority: path === "/" ? 1 : 0.7 })),
    ...state.establishments.map((item) => ({ url: url(`/establecimientos/${item.slug}`), changeFrequency: "daily" as const, priority: 0.6 })),
    ...offers,
  ];
}
