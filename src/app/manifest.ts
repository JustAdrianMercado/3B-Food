import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/", name: "EcoRescate Cochabamba", short_name: "EcoRescate",
    description: "Excedentes de restaurantes y supermercados de Cochabamba a un mejor precio. Reserva en línea y retira en el local.",
    lang: "es-BO", start_url: "/", scope: "/", display: "standalone",
    background_color: "#f8f7f2", theme_color: "#204c39", categories: ["food", "shopping"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
