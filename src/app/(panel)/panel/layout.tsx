import { DataProvider } from "@/components/data-provider";
import { SiteHeader } from "@/components/site-shell";
import { loadState, requestTime } from "@/lib/db/queries";

export default async function BusinessLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [state, now] = await Promise.all([loadState("panel"), requestTime()]);
  return <DataProvider initialState={state} initialNow={now} area="panel"><SiteHeader /><main id="contenido">{children}</main></DataProvider>;
}
