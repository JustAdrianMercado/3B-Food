import type { Metadata } from "next";
import { BusinessWorkspace } from "@/components/dashboard";
export const metadata: Metadata = { title: "Indicadores del establecimiento" };
export default function Page() { return <BusinessWorkspace section="reports" />; }
