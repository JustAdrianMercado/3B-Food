import type { Metadata } from "next";
import { AdminWorkspace } from "@/components/dashboard";
export const metadata: Metadata = { title: "Administración · Indicadores" };
export default function Page() { return <AdminWorkspace />; }
