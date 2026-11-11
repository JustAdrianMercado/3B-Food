"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Check, Info, TriangleAlert, X } from "lucide-react";
import type { SiteState } from "@/lib/domain";
import { perform, refreshState, type Action, type ActionResult } from "@/lib/actions";
import type { Area } from "@/lib/db/queries";

type Toast = { id: string; message: string; kind: "success" | "error" | "info" };
type Context = {
  state: SiteState | null;
  now: number;
  ready: boolean;
  area: Area;
  execute: (action: Action) => Promise<ActionResult>;
  notify: (message: string, kind?: Toast["kind"]) => void;
};

const unavailable: ActionResult = { ok: false, message: "Estamos cargando la información. Inténtalo de nuevo." };
/** Pages rendered outside a data area (e.g. the 404 page) still get a usable, empty context. */
const DataContext = createContext<Context>({ state: null, now: 0, ready: false, area: "public", execute: async () => unavailable, notify: () => {} });

function ToastItem({ toast, dismiss }: { toast: Toast; dismiss: (id: string) => void }) {
  useEffect(() => { const timer = setTimeout(() => dismiss(toast.id), 6500); return () => clearTimeout(timer); }, [toast.id, dismiss]);
  const Icon = toast.kind === "error" ? TriangleAlert : toast.kind === "info" ? Info : Check;
  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className={`toast toast--${toast.kind}`} role={toast.kind === "error" ? "alert" : "status"}>
      <span className="toast-icon"><Icon size={18} /></span><p>{toast.message}</p>
      <button type="button" className="icon-button" onClick={() => dismiss(toast.id)} aria-label="Cerrar mensaje"><X size={16} /></button>
    </motion.div>
  );
}

/**
 * Holds the server-loaded state for one area of the site. Mutations run as server actions,
 * which return the refreshed state; the data is also refreshed periodically while the page is visible.
 */
export function DataProvider({ initialState, initialNow, area, children }: { initialState: SiteState; initialNow: number; area: Area; children: ReactNode }) {
  const [state, setState] = useState(initialState);
  const [source, setSource] = useState(initialState);
  const [now, setNow] = useState(initialNow);
  const [toasts, setToasts] = useState<Toast[]>([]);
  if (source !== initialState) { setSource(initialState); setState(initialState); }

  const notify = useCallback((message: string, kind: Toast["kind"] = "success") => {
    setToasts((items) => [...items.slice(-2), { id: crypto.randomUUID(), message, kind }]);
  }, []);
  const dismiss = useCallback((id: string) => setToasts((items) => items.filter((item) => item.id !== id)), []);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    const refresh = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      refreshState(area).then((result) => { if (result.ok) { setState(result.state); setNow(Date.now()); } }).catch(() => { /* Keep the current data; the next refresh retries. */ });
    }, 60_000);
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => { /* The site still works without installation support. */ });
    return () => { clearInterval(tick); clearInterval(refresh); };
  }, [area]);

  const execute = useCallback(async (action: Action) => {
    let result: ActionResult;
    try { result = await perform(area, action); }
    catch { result = { ok: false, message: "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo." }; }
    if (result.ok) { setState(result.state); setNow(Date.now()); }
    else notify(result.message, "error");
    return result;
  }, [area, notify]);

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
      <DataContext.Provider value={{ state, now, ready: true, area, execute, notify }}>
        {children}
        <div className="toast-region" role="region" aria-label="Notificaciones"><AnimatePresence>{toasts.map((toast) => <ToastItem key={toast.id} toast={toast} dismiss={dismiss} />)}</AnimatePresence></div>
      </DataContext.Provider>
    </MotionConfig>
  );
}

export function useData() {
  return useContext(DataContext);
}
