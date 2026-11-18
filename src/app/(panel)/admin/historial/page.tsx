import type { Metadata } from "next";
import { AdminShell, HistoryPanel } from "@/components/dashboard";
export const metadata: Metadata = { title: "Administración · Historial" };
export default function Page() {
  return <AdminShell eyebrow="ADMINISTRACIÓN" title="Historial de toda la plataforma." description="Cada publicación, reserva, retiro y cancelación de todos los establecimientos, para el seguimiento de las operaciones."><HistoryPanel global /></AdminShell>;
}
