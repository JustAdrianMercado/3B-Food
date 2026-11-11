import type { ReactNode } from "react";
import { Leaf, type LucideIcon } from "lucide-react";

/** Server-safe (no "use client"), so server pages can pass an icon component. */
export function EmptyState({ icon: Icon = Leaf, title, description, action }: { icon?: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={30} strokeWidth={1.5} /></span><h3>{title}</h3><p>{description}</p>{action}</div>;
}
