"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check, Download } from "lucide-react";
import type { Habit, HabitLog } from "@/lib/types";
import { addDays, isToday, prettyDate, shortDate, startOfWeek, toISODate, weekDates, weekOfLabel, WEEKDAY_LETTERS } from "@/lib/utils";
import { Rabbit } from "../Rabbit";
import { useToast } from "../ToastProvider";

export function WeekBoard({ habits, logs }: { habits: Habit[]; logs: HabitLog[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(toISODate(new Date())));
  const [busy, setBusy] = useState<string | null>(null);

  const days = useMemo(() => weekDates(weekStart), [weekStart]);
  const doneSet = useMemo(() => new Set(logs.map((l) => `${l.habit_id}|${l.log_date}`)), [logs]);
  const thisWeek = weekStart === startOfWeek(toISODate(new Date()));

  const plannedFor = (habit: Habit, iso: string) =>
    habit.weekdays.includes(new Date(`${iso}T12:00:00`).getDay() as never);

  const weekCompleted = days.reduce(
    (sum, d) => sum + habits.filter((h) => plannedFor(h, d) && doneSet.has(`${h.id}|${d}`)).length,
    0,
  );
  const weekPlanned = days.reduce((sum, d) => sum + habits.filter((h) => plannedFor(h, d)).length, 0);

  async function toggle(habit: Habit, iso: string) {
    if (iso > toISODate(new Date())) {
      toast({ kind: "info", title: "That's still ahead", description: "Future days open up when they arrive." });
      return;
    }
    const key = `${habit.id}|${iso}`;
    setBusy(key);
    const res = await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId: habit.id, date: iso, completed: !doneSet.has(key) }),
    });
    setBusy(null);
    if (!res.ok) {
      toast({ kind: "error", title: "Couldn't save that" });
      return;
    }
    startTransition(() => router.refresh());
  }

  function exportCsv() {
    const rows = [["habit", "date", "completed"]];
    for (const habit of habits) {
      for (const d of days) {
        rows.push([habit.title, d, String(doneSet.has(`${habit.id}|${d}`))]);
      }
    }
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habit-rabbit-week-${weekStart}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ kind: "success", title: "Week exported", description: "Your data is yours." });
  }

  return (
    <section className="space-y-5" aria-labelledby="week-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-rabbit-secondary">Week view</p>
          <h1 id="week-heading" className="mt-1 text-3xl font-extrabold sm:text-4xl">
            {weekOfLabel(weekStart)}
          </h1>
          <p className="mt-1.5 text-sm muted">
            {weekCompleted} of {weekPlanned} planned moments checked off. A gap is just a gap — nothing broke.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekStart((w) => addDays(w, -7))}
            className="btn-secondary px-3"
            aria-label="Previous week"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(startOfWeek(toISODate(new Date())))}
            disabled={thisWeek}
            className="btn-secondary"
          >
            This week
          </button>
          <button
            type="button"
            onClick={() => setWeekStart((w) => addDays(w, 7))}
            disabled={weekStart >= startOfWeek(toISODate(new Date()))}
            className="btn-secondary px-3"
            aria-label="Next week"
          >
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>
          <button type="button" onClick={exportCsv} className="btn-ghost px-3" aria-label="Export this week as CSV">
            <Download aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile: day-by-day cards */}
      <div className="space-y-3 md:hidden">
        {days.map((iso, i) => {
          const planned = habits.filter((h) => plannedFor(h, iso));
          const done = planned.filter((h) => doneSet.has(`${h.id}|${iso}`)).length;
          return (
            <div key={iso} className="card p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className={`text-sm font-extrabold ${isToday(iso) ? "text-rabbit-primary" : ""}`}>
                  {prettyDate(iso)} {isToday(iso) && <span className="chip ml-1 bg-rabbit-primary/15 text-rabbit-primary">Today</span>}
                </h2>
                <span className="text-xs font-bold muted">
                  {done}/{planned.length}
                </span>
              </div>
              {planned.length === 0 ? (
                <p className="text-xs muted">A free day. Nothing scheduled.</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {planned.map((h) => {
                    const on = doneSet.has(`${h.id}|${iso}`);
                    return (
                      <li key={h.id}>
                        <button
                          type="button"
                          onClick={() => toggle(h, iso)}
                          disabled={busy === `${h.id}|${iso}`}
                          aria-pressed={on}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                            on
                              ? "border-transparent bg-gradient-to-r from-rabbit-primary to-rabbit-secondary text-white"
                              : "border-[rgb(var(--line))] hover:border-rabbit-primary/60"
                          }`}
                        >
                          <span aria-hidden="true">{on ? "✓" : h.emoji}</span>
                          <span className="max-w-40 truncate">{h.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              <span className="sr-only">{WEEKDAY_LETTERS[i]}</span>
            </div>
          );
        })}
      </div>

      {/* Tablet / desktop: the grid */}
      <div className="card hidden overflow-x-auto p-2 md:block">
        <table className="w-full min-w-[640px] border-separate border-spacing-0">
          <caption className="sr-only">Habits for the week of {weekOfLabel(weekStart)}</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 bg-[rgb(var(--surface))] px-3 py-3 text-left text-xs font-bold uppercase tracking-wider muted">
                Habit
              </th>
              {days.map((iso) => (
                <th key={iso} scope="col" className="px-1 py-3 text-center">
                  <span className="block text-[11px] font-bold uppercase tracking-wider muted">
                    {new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" })}
                  </span>
                  <span className={`mt-0.5 block text-sm font-extrabold ${isToday(iso) ? "text-rabbit-primary" : ""}`}>
                    {shortDate(iso).replace(/^\w+ /, "")}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr key={habit.id} className="group">
                <th
                  scope="row"
                  className="sticky left-0 max-w-[220px] bg-[rgb(var(--surface))] px-3 py-2.5 text-left text-sm font-semibold"
                >
                  <span className="mr-2" aria-hidden="true">
                    {habit.emoji}
                  </span>
                  <span className="truncate">{habit.title}</span>
                </th>
                {days.map((iso) => {
                  const planned = plannedFor(habit, iso);
                  const on = doneSet.has(`${habit.id}|${iso}`);
                  const future = iso > toISODate(new Date());
                  return (
                    <td key={iso} className="px-1 py-2.5 text-center">
                      {planned ? (
                        <button
                          type="button"
                          onClick={() => toggle(habit, iso)}
                          disabled={busy === `${habit.id}|${iso}` || future}
                          aria-pressed={on}
                          aria-label={`${on ? "Uncheck" : "Check off"} ${habit.title} on ${prettyDate(iso)}`}
                          className={`mx-auto grid h-9 w-9 place-items-center rounded-xl border transition-all duration-200 ${
                            on
                              ? "border-transparent bg-gradient-to-br from-rabbit-primary to-rabbit-secondary text-white"
                              : future
                                ? "cursor-not-allowed border-dashed border-[rgb(var(--line))] opacity-40"
                                : "border-dashed border-[rgb(var(--line))] hover:-translate-y-0.5 hover:border-rabbit-primary hover:bg-rabbit-primary/10"
                          }`}
                        >
                          {on ? <Check aria-hidden="true" className="h-4 w-4" strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--line))]" aria-hidden="true" />}
                        </button>
                      ) : (
                        <span aria-hidden="true" className="mx-auto block h-1.5 w-1.5 rounded-full bg-[rgb(var(--line))]/40" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {habits.length === 0 && (
        <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
          <Rabbit mood="happy" size={80} />
          <h2 className="text-lg font-extrabold">No habits to show yet</h2>
          <p className="max-w-sm text-sm muted">Add one tiny thing on the Today page and this week fills in gently.</p>
          <Link href="/today" className="btn-primary">
            Go to Today
          </Link>
        </div>
      )}
    </section>
  );
}
