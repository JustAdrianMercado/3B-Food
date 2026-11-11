import { DataProvider } from "@/components/data-provider";
import { SiteHeader } from "@/components/site-shell";
import { loadState, requestTime } from "@/lib/db/queries";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [state, now] = await Promise.all([loadState("admin"), requestTime()]);
  return <DataProvider initialState={state} initialNow={now} area="admin"><SiteHeader /><main id="contenido">{children}</main></DataProvider>;
}
