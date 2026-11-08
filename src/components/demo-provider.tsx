"use client";

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Check, Info, TriangleAlert, X } from "lucide-react";
import { DemoError, STORAGE_KEY, parsePersistedState, transition, type DemoAction, type DemoState } from "@/lib/domain";
import { createSeed, establishments } from "@/lib/seed";

type Snapshot = { state: DemoState; now: number; storageAvailable: boolean; recovered: boolean };
type Result = { ok: true; state: DemoState } | { ok: false; message: string };
let snapshot: Snapshot | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const getSnapshot = () => snapshot;
const getServerSnapshot = () => null;
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };

function persist(state: DemoState): boolean {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
  catch { return false; }
}

function commit(state: DemoState, now = Date.now(), recovered = false) {
  snapshot = { state, now, storageAvailable: persist(state), recovered };
  emit();
}

function initialize() {
  if (snapshot) return;
  const now = Date.now();
  let raw: string | null = null;
  try { raw = localStorage.getItem(STORAGE_KEY); } catch { /* Memory remains usable when browser storage is disabled. */ }
  const saved = raw ? parsePersistedState(raw, establishments.map((item) => item.id)) : null;
  commit(transition(saved ?? createSeed(now), { type: "expire" }, now), now, Boolean(raw && !saved));
}

function execute(action: DemoAction): Result {
  if (!snapshot) return { ok: false, message: "Estamos preparando la demostración. Inténtalo de nuevo." };
  const now = Date.now();
  const current = transition(snapshot.state, { type: "expire" }, now);
  try {
    if (action.type === "publish" && !establishments.some((item) => item.id === action.input.establishmentId)) throw new DemoError("Selecciona un establecimiento de demostración.");
    if (action.type === "select-establishment" && !establishments.some((item) => item.id === action.establishmentId)) throw new DemoError("El establecimiento no existe.");
    const next = transition(current, action, now);
    commit(next, now);
    return { ok: true, state: next };
  } catch (error) {
    if (current !== snapshot.state) commit(current, now);
    return { ok: false, message: error instanceof DemoError ? error.message : "No se pudo completar la operación. Inténtalo de nuevo." };
  }
}

type Toast = { id: string; message: string; kind: "success" | "error" | "info" };
type Context = {
  state: DemoState | null;
  now: number;
  ready: boolean;
  storageAvailable: boolean;
  recovered: boolean;
  execute: (action: DemoAction) => Result;
  notify: (message: string, kind?: Toast["kind"]) => void;
  reset: () => void;
};
const DemoContext = createContext<Context | null>(null);

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

export function DemoProvider({ children }: { children: ReactNode }) {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notify = useCallback((message: string, kind: Toast["kind"] = "success") => {
    setToasts((items) => [...items.slice(-2), { id: crypto.randomUUID(), message, kind }]);
  }, []);
  const dismiss = useCallback((id: string) => setToasts((items) => items.filter((item) => item.id !== id)), []);

  useEffect(() => {
    initialize();
    const timer = setInterval(() => {
      if (!snapshot) return;
      const now = Date.now();
      const next = transition(snapshot.state, { type: "expire" }, now);
      if (next !== snapshot.state) commit(next, now);
      else { snapshot = { ...snapshot, now }; emit(); }
    }, 30_000);
    const synchronize = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const parsed = event.newValue ? parsePersistedState(event.newValue, establishments.map((item) => item.id)) : null;
      snapshot = { state: transition(parsed ?? createSeed(), { type: "expire" }), now: Date.now(), storageAvailable: true, recovered: !parsed };
      emit();
    };
    window.addEventListener("storage", synchronize);
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => { /* The web demo still works without installation support. */ });
    return () => { clearInterval(timer); window.removeEventListener("storage", synchronize); };
  }, []);

  const reset = useCallback(() => { commit(createSeed()); notify("Demostración restablecida. Las fechas y los ejemplos vuelven a estar vigentes."); }, [notify]);
  const dispatch = useCallback((action: DemoAction) => {
    const result = execute(action);
    if (!result.ok) notify(result.message, "error");
    return result;
  }, [notify]);

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
      <DemoContext.Provider value={{ state: current?.state ?? null, now: current?.now ?? 0, ready: Boolean(current), storageAvailable: current?.storageAvailable ?? true, recovered: current?.recovered ?? false, execute: dispatch, notify, reset }}>
        {children}
        <div className="toast-region" role="region" aria-label="Notificaciones"><AnimatePresence>{toasts.map((toast) => <ToastItem key={toast.id} toast={toast} dismiss={dismiss} />)}</AnimatePresence></div>
      </DemoContext.Provider>
    </MotionConfig>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo debe usarse dentro de DemoProvider.");
  return context;
}
