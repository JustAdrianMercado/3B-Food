import type { Metadata } from "next";
import { AdminWorkspace } from "@/components/dashboard";
export const metadata: Metadata = { title: "Indicadores de demostración" };
export default function Page() { return <AdminWorkspace />; }
