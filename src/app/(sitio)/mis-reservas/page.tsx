import type { Metadata } from "next";
import { ReservationsPage } from "@/components/reservations";
export const metadata: Metadata = { title: "Mis reservas" };
export default function Page() { return <ReservationsPage />; }
