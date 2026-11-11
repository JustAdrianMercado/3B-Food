import { DataProvider } from "@/components/data-provider";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { loadState, requestTime } from "@/lib/db/queries";

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [state, now] = await Promise.all([loadState("public"), requestTime()]);
  return <DataProvider initialState={state} initialNow={now} area="public"><SiteHeader /><main id="contenido">{children}</main><SiteFooter /></DataProvider>;
}
