import type { Metadata } from "next";
import { ReservationsPage } from "@/components/reservations";
import { requireViewer } from "@/lib/auth";

export const metadata: Metadata = { title: "Mis reservas", robots: { index: false } };

export default async function Page() {
  await requireViewer(["consumidor"], "/mis-reservas");
  return <ReservationsPage />;
}
