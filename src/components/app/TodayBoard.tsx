"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, Search, Sparkles, Trash2, Undo2 } from "lucide-react";
import type { Habit, HabitLog } from "@/lib/types";
import { encouragementFor, prettyDate, toISODate } from "@/lib/utils";
import { Rabbit } from "../Rabbit";
import { Celebration } from "../Celebration";
import { ConfirmDialog } from "../ConfirmDialog";
import { useToast } from "../ToastProvider";
import { HabitDialog } from "./HabitDialog";

const COLOR_RING: Record<Habit["color"], string> = {
  primary: "border-rabbit-primary/40 hover:border-rabbit-primary",
  secondary: "border-rabbit-secondary/40 hover:border-rabbit-secondary",
  accent: "border-rabbit-accent/50 hover:border-rabbit-accent",
};

const COLOR_SOFT: Record<Habit["color"], string> = {
  primary: "bg-rabbit-primary/12",
  secondary: "bg-rabbit-secondary/12",
  accent: "bg-rabbit-accent/20",
};

const CELEBRATIONS = [
  "One win, right there!",
  "That's a real thing you did.",
  "Look at you go!",
  "Your rabbit is proud of you.",
  "Small step, big care.",
  "That counts, fully.",
];

export function TodayBoard({
  habits,
  logs,
  greetingName,
}: {
  habits: Habit[];
  logs: HabitLog[];
  greetingName: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [deleting, setDeleting] = useState<Habit | null>(null);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const today = toISODate(new Date());
  const todayDow = new Date().getDay();

  const doneToday = useMemo(
    () => new Set(logs.filter((l) => l.log_date === today).map((l) => l.habit_id)),
    [logs, today],
  );

  const plannedToday = useMemo(
    () => habits.filter((h) => h.weekdays.includes(todayDow as never)),
    [habits, todayDow],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...plannedToday].sort(
      (a, b) => Number(doneToday.has(a.id)) - Number(doneToday.has(b.id)) || a.sort_order - b.sort_order,
    );
    if (!q) return sorted;
    return sorted.filter(
      (h) => h.title.toLowerCase().includes(q) || (h.notes ?? "").toLowerCase().includes(q),
    );
  }, [plannedToday, query, doneToday]);

  const completedCount = plannedToday.filter((h) => doneToday.has(h.id)).length;

  const toggle = useCallback(
    async (habit: Habit) => {
      const wasDone = doneToday.has(habit.id);
      setBusy(habit.id);
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId: habit.id, date: today, completed: !wasDone }),
      });
      setBusy(null);
      if (!res.ok) {
        toast({ kind: "error", title: "Couldn't save that", description: "Nothing lost — give it another tap." });
        return;
      }
      if (!wasDone) {
        setCelebration(CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)]);
        toast({
          kind: "celebrate",
          title: `${habit.emoji} ${habit.title}`,
          description: "Checked off. That's one caring thing for yourself today.",
        });
      } else {
        toast({ kind: "info", title: "Unchecked", description: "No problem at all — change your mind freely." });
      }
      startTransition(() => router.refresh());
    },
    [doneToday, router, today, toast],
  );

  async function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    const res = await fetch(`/api/habits/${target.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast({ kind: "error", title: "Couldn't delete that habit" });
      return;
    }
    toast({ kind: "success", title: "Habit removed", description: "Its history went with it." });
    startTransition(() => router.refresh());
  }

  return (
    <>
      <section aria-labelledby="today-heading" className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-rabbit-primary">{prettyDate(today)}</p>
            <h1 id="today-heading" className="mt-1 text-3xl font-extrabold sm:text-4xl">
              Hi {greetingName} <span aria-hidden="true">🐰</span>
            </h1>
            <p className="mt-1.5 max-w-lg text-sm muted sm:text-base">
              {encouragementFor(completedCount, plannedToday.length)}
            </p>
          </div>
          <button
            type="button"
            className="btn-primary shrink-0"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            New habit
          </button>
        </div>

        <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <Rabbit mood={completedCount > 0 ? "cheer" : "happy"} size={54} className="shrink-0" />
            <div>
              <p className="text-sm font-bold">
                {completedCount} of {plannedToday.length} checked off
              </p>
              <div className="mt-1.5 h-2 w-40 overflow-hidden rounded-full bg-[rgb(var(--line))] sm:w-56">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rabbit-primary to-rabbit-secondary transition-all duration-500"
                  style={{ width: `${plannedToday.length ? (completedCount / plannedToday.length) * 100 : 0}%` }}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={plannedToday.length}
                  aria-valuenow={completedCount}
                  aria-label="Today's progress"
                />
              </div>
            </div>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <label htmlFor="habit-search" className="sr-only">
              Search your habits
            </label>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 muted" />
            <input
              id="habit-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search today's habits…"
              className="field pl-9"
            />
          </div>
        </div>

        <ul className="space-y-2.5">
          {visible.map((habit) => {
            const done = doneToday.has(habit.id);
            return (
              <li key={habit.id} className="animate-fade-up">
                <div
                  className={`group flex items-center gap-3 rounded-3xl border bg-[rgb(var(--surface))] p-3 transition-all duration-200 sm:p-4 ${
                    done ? "border-[rgb(var(--line))] opacity-80" : COLOR_RING[habit.color]
                  } hover:shadow-soft`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(habit)}
                    disabled={busy === habit.id}
                    aria-pressed={done}
                    aria-label={`${done ? "Uncheck" : "Check off"} ${habit.title}`}
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-2 transition-all duration-200 ${
                      done
                        ? "border-transparent bg-gradient-to-br from-rabbit-primary to-rabbit-secondary text-white animate-pop-check"
                        : `border-dashed ${COLOR_SOFT[habit.color]} border-[rgb(var(--line))] hover:scale-105`
                    }`}
                  >
                    {done ? (
                      <Check aria-hidden="true" className="h-5 w-5" strokeWidth={3} />
                    ) : (
                      <span aria-hidden="true" className="text-lg">
                        {habit.emoji}
                      </span>
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-bold sm:text-base ${done ? "line-through decoration-rabbit-primary/60" : ""}`}>
                      {habit.title}
                    </p>
                    {habit.notes && <p className="truncate text-xs muted sm:text-sm">{habit.notes}</p>}
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(habit);
                        setDialogOpen(true);
                      }}
                      aria-label={`Edit ${habit.title}`}
                      className="rounded-full p-2 muted transition hover:bg-rabbit-secondary/15 hover:text-rabbit-secondary"
                    >
                      <Pencil aria-hidden="true" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(habit)}
                      aria-label={`Delete ${habit.title}`}
                      className="rounded-full p-2 muted transition hover:bg-rose-500/15 hover:text-rose-500"
                    >
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {visible.length === 0 && (
          <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
            <Rabbit mood="sleepy" size={88} />
            <h2 className="text-lg font-extrabold">
              {query ? "Nothing matches that search" : "Nothing planned for today"}
            </h2>
            <p className="max-w-sm text-sm muted">
              {query
                ? "Try a shorter word, or clear the search to see everything."
                : "A rest day is a real day. If you'd like one tiny thing, you can add it in seconds."}
            </p>
            <div className="mt-1 flex gap-2">
              {query && (
                <button type="button" className="btn-secondary" onClick={() => setQuery("")}>
                  <Undo2 aria-hidden="true" className="h-4 w-4" /> Clear search
                </button>
              )}
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
              >
                <Plus aria-hidden="true" className="h-4 w-4" /> Add a habit
              </button>
            </div>
          </div>
        )}

        {completedCount > 0 && (
          <p className="flex items-center justify-center gap-1.5 pt-1 text-xs font-semibold text-rabbit-primary">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
            Everything you did today counts — even the one thing.
          </p>
        )}
      </section>

      <HabitDialog
        open={dialogOpen}
        habit={editing}
        onClose={() => setDialogOpen(false)}
        onSaved={() => startTransition(() => router.refresh())}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete “${deleting?.title ?? ""}”?`}
        description="This removes the habit and its history. There's no penalty either way."
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
      <Celebration message={celebration} onDone={() => setCelebration(null)} />
    </>
  );
}
