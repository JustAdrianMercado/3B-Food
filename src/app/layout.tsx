import type { Metadata, Viewport } from "next";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/dm-sans/latin-700.css";
import "@fontsource/dm-sans/latin-800.css";
import "@fontsource/dm-serif-display/latin-400.css";
import "@fontsource/dm-serif-display/latin-400-italic.css";
import "./globals.css";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: "EcoRescate · Buena comida, otra oportunidad", template: "%s | EcoRescate Cochabamba" },
  description: "Encuentra excedentes de restaurantes y supermercados de Cochabamba a un mejor precio. Reserva en línea y retira en el local antes de que termine su oportunidad.",
  applicationName: "EcoRescate Cochabamba",
  metadataBase: siteUrl(),
  openGraph: { siteName: "EcoRescate Cochabamba", locale: "es_BO", type: "website" },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "EcoRescate" },
  icons: { icon: "/icon.svg", apple: "/icons/apple-touch-icon.png" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#204c39" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-BO"><body><a href="#contenido" className="skip-link">Saltar al contenido</a>{children}</body></html>;
}
