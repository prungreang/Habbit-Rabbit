"use client";

import { useState, useTransition } from "react";
import { Bell, BellRing, Check } from "lucide-react";
import type { Notification } from "@/lib/types";
import { useToast } from "./ToastProvider";

const KIND_STYLE: Record<Notification["kind"], string> = {
  celebrate: "bg-rabbit-primary/15 text-rabbit-primary",
  report: "bg-rabbit-secondary/15 text-rabbit-secondary",
  system: "bg-rose-400/15 text-rose-500",
  info: "bg-rabbit-accent/20 text-amber-600 dark:text-rabbit-accent",
};

export function NotificationsBell({ initial }: { initial: Notification[] }) {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const unread = items.filter((n) => !n.read_at).length;

  async function markAllRead() {
    if (unread === 0) return;
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })));
    startTransition(async () => {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (!res.ok) {
        toast({ kind: "error", title: "Couldn't update notifications", description: "They'll stay unread for now." });
        return;
      }
      toast({ kind: "success", title: "All caught up" });
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgb(var(--line))]
          text-[rgb(var(--ink))] transition-all hover:border-rabbit-primary/60 hover:bg-rabbit-primary/10"
      >
        {unread ? (
          <BellRing aria-hidden="true" className="h-5 w-5 animate-wiggle" />
        ) : (
          <Bell aria-hidden="true" className="h-5 w-5" />
        )}
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-rabbit-primary px-1 text-[10px] font-bold text-white ring-2 ring-[rgb(var(--page))]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Notifications"
            className="card absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] animate-hop-in overflow-hidden p-0"
          >
            <div className="flex items-center justify-between gap-2 border-b border-[rgb(var(--line))] px-4 py-3">
              <h2 className="text-sm font-bold">Notifications</h2>
              <button
                type="button"
                onClick={markAllRead}
                disabled={pending || unread === 0}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-rabbit-secondary transition hover:bg-rabbit-secondary/10 disabled:opacity-40"
              >
                <Check aria-hidden="true" className="h-3.5 w-3.5" />
                Mark all read
              </button>
            </div>
            <ul className="max-h-80 divide-y divide-[rgb(var(--line))] overflow-y-auto">
              {items.length === 0 && <li className="px-4 py-8 text-center text-sm muted">Nothing here yet. Quiet is good.</li>}
              {items.map((n) => (
                <li key={n.id} className={`flex gap-3 px-4 py-3 ${n.read_at ? "" : "bg-rabbit-primary/[.06]"}`}>
                  <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${KIND_STYLE[n.kind]}`}>
                    <Bell aria-hidden="true" className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug">{n.title}</p>
                    {n.body && <p className="mt-0.5 text-xs leading-snug muted">{n.body}</p>}
                    <time className="mt-1 block text-[11px] muted" dateTime={n.created_at}>
                      {new Date(n.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
