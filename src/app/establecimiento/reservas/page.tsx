import type { Metadata } from "next";
import { BusinessWorkspace } from "@/components/dashboard";
export const metadata: Metadata = { title: "Reservas y retiros del establecimiento" };
export default function Page() { return <BusinessWorkspace section="reservations" />; }
