import type { Metadata, Viewport } from "next";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/dm-sans/latin-700.css";
import "@fontsource/dm-sans/latin-800.css";
import "@fontsource/dm-serif-display/latin-400.css";
import "@fontsource/dm-serif-display/latin-400-italic.css";
import "./globals.css";
import { DemoProvider } from "@/components/demo-provider";
import { DemoNotice, SiteFooter, SiteHeader } from "@/components/site-shell";

export const metadata: Metadata = {
  title: { default: "EcoRescate · Buena comida, otra oportunidad", template: "%s | EcoRescate Cochabamba" },
  description: "Propuesta académica para gestionar y comercializar excedentes alimentarios aptos para el consumo en Cochabamba. Explora la demostración interactiva.",
  applicationName: "EcoRescate Cochabamba",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "EcoRescate" },
  icons: { icon: "/icon.svg", apple: "/icons/apple-touch-icon.png" },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#204c39" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-BO"><body><a href="#contenido" className="skip-link">Saltar al contenido</a><DemoProvider><SiteHeader /><DemoNotice /><main id="contenido">{children}</main><SiteFooter /></DemoProvider></body></html>;
}
