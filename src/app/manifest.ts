import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/", name: "EcoRescate Cochabamba", short_name: "EcoRescate",
    description: "Demostración académica de aprovechamiento de excedentes alimentarios en Cochabamba.",
    lang: "es-BO", start_url: "/", scope: "/", display: "standalone",
    background_color: "#f8f7f2", theme_color: "#204c39", categories: ["food", "education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
