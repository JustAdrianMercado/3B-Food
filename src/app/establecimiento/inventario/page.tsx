import type { Metadata } from "next";
import { BusinessWorkspace } from "@/components/dashboard";
export const metadata: Metadata = { title: "Inventario y ofertas" };
export default function Page() { return <BusinessWorkspace section="inventory" />; }
