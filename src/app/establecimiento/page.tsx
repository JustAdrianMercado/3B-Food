import type { Metadata } from "next";
import { BusinessWorkspace } from "@/components/dashboard";
export const metadata: Metadata = { title: "Panel del establecimiento" };
export default function Page() { return <BusinessWorkspace section="overview" />; }
