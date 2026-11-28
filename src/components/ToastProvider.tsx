"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, PartyPopper, TriangleAlert, X } from "lucide-react";

type ToastKind = "success" | "error" | "celebrate" | "info";

interface Toast {
  id: number;
  title: string;
  description?: string;
  kind: ToastKind;
}

interface ToastCtx {
  toast: (t: Omit<Toast, "id">) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

const ICONS = {
  success: CheckCircle2,
  error: TriangleAlert,
  celebrate: PartyPopper,
  info: Info,
};

const TONE: Record<ToastKind, string> = {
  success: "border-emerald-300/60 bg-emerald-50 text-emerald-950 dark:bg-emerald-500/15 dark:text-emerald-50 dark:border-emerald-400/30",
  error: "border-rose-300/60 bg-rose-50 text-rose-950 dark:bg-rose-500/15 dark:text-rose-50 dark:border-rose-400/30",
  celebrate: "border-rabbit-primary/50 bg-[#FDF4FF] text-rabbit-ink dark:bg-rabbit-primary/15 dark:text-white dark:border-rabbit-primary/40",
  info: "border-sky-300/60 bg-sky-50 text-sky-950 dark:bg-sky-500/15 dark:text-sky-50 dark:border-sky-400/30",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev.slice(-3), { ...t, id }]);
      window.setTimeout(() => dismiss(id), t.kind === "celebrate" ? 5200 : 4200);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end"
      >
        {items.map((t) => {
          const Icon = ICONS[t.kind];
          return (
            <div
              key={t.id}
              role={t.kind === "error" ? "alert" : "status"}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-soft backdrop-blur animate-hop-in ${TONE[t.kind]}`}
            >
              <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug">{t.title}</p>
                {t.description && <p className="mt-0.5 text-xs leading-snug opacity-80">{t.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="rounded-full p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
