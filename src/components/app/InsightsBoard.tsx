"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarRange, Heart, Loader2, Share2, Sparkles } from "lucide-react";
import type { Habit, HabitLog, Profile } from "@/lib/types";
import { addDays, shortDate, startOfWeek, toISODate, weekDates, weekOfLabel } from "@/lib/utils";
import { Rabbit } from "../Rabbit";
import { useToast } from "../ToastProvider";

export function InsightsBoard({
  habits,
  logs,
  profile,
}: {
  habits: Habit[];
  logs: HabitLog[];
  profile: Profile;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const [generating, setGenerating] = useState(false);
  const [consent, setConsent] = useState(false);
  const [report, setReport] = useState<{ summary: string; completed: number; planned: number } | null>(null);

  const today = toISODate(new Date());
  const weekStart = startOfWeek(today);

  const plannedFor = (habit: Habit, iso: string) =>
    habit.weekdays.includes(new Date(`${iso}T12:00:00`).getDay() as never);

  const doneSet = useMemo(() => new Set(logs.map((l) => `${l.habit_id}|${l.log_date}`)), [logs]);

  // last 4 weeks, Monday-start
  const weekly = useMemo(() => {
    const out: { week: string; completed: number; planned: number }[] = [];
    for (let w = 3; w >= 0; w--) {
      const start = addDays(weekStart, -7 * w);
      const days = weekDates(start);
      const planned = habits.reduce((s, h) => s + days.filter((d) => plannedFor(h, d)).length, 0);
      const completed = days.reduce(
        (s, d) => s + habits.filter((h) => plannedFor(h, d) && doneSet.has(`${h.id}|${d}`)).length,
        0,
      );
      out.push({ week: weekOfLabel(start), completed, planned });
    }
    return out;
  }, [habits, doneSet, weekStart]);

  const last14 = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const iso = addDays(today, i - 13);
      const count = habits.filter((h) => plannedFor(h, iso) && doneSet.has(`${h.id}|${iso}`)).length;
      return { day: shortDate(iso), count };
    });
  }, [habits, doneSet, today]);

  const perHabit = useMemo(
    () =>
      habits
        .map((h) => {
          const days = weekDates(weekStart).filter((d) => plannedFor(h, d));
          const done = days.filter((d) => doneSet.has(`${h.id}|${d}`)).length;
          return { name: h.title.length > 16 ? `${h.title.slice(0, 15)}…` : h.title, full: h.title, done, planned: days.length };
        })
        .sort((a, b) => b.done - a.done),
    [habits, doneSet, weekStart],
  );

  const totalThisWeek = weekly.at(-1)?.completed ?? 0;
  const plannedThisWeek = weekly.at(-1)?.planned ?? 0;

  async function generateReport() {
    setGenerating(true);
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart, consentPublic: consent }),
    });
    setGenerating(false);
    if (!res.ok) {
      toast({ kind: "error", title: "Couldn't build the report", description: "Please try again in a moment." });
      return;
    }
    const data = await res.json();
    setReport({
      summary: data.report.summary,
      completed: data.report.completed_count ?? totalThisWeek,
      planned: data.report.planned_count ?? plannedThisWeek,
    });
    toast({
      kind: "celebrate",
      title: "Your week, summarised",
      description: consent ? "Saved with sharing on — only you can see it until you choose otherwise." : "Private to you. Nothing is shared.",
    });
    startTransition(() => router.refresh());
  }

  const axisColor = "rgb(var(--ink-muted))";

  return (
    <section className="space-y-5" aria-labelledby="insights-heading">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-rabbit-accent">Insights</p>
        <h1 id="insights-heading" className="mt-1 text-3xl font-extrabold sm:text-4xl">
          How it&apos;s been going
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm muted sm:text-base">
          Numbers here are a mirror, not a scoreboard. Read them the way you&apos;d read a friend&apos;s note.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Checked off this week", value: totalThisWeek, tone: "from-rabbit-primary/15 to-rabbit-primary/5" },
          { label: "Planned this week", value: plannedThisWeek, tone: "from-rabbit-secondary/15 to-rabbit-secondary/5" },
          { label: "Active habits", value: habits.length, tone: "from-rabbit-accent/20 to-rabbit-accent/5" },
        ].map((stat) => (
          <div key={stat.label} className={`card bg-gradient-to-br ${stat.tone} p-5`}>
            <p className="text-xs font-bold uppercase tracking-wider muted">{stat.label}</p>
            <p className="mt-1 font-display text-4xl font-extrabold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-base font-extrabold">The last four weeks</h2>
          <p className="mb-4 text-xs muted">Completed vs. planned. Bars can go down — that&apos;s allowed.</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgb(var(--line))" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: axisColor }} stroke="rgb(var(--line))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: axisColor }} stroke="rgb(var(--line))" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid rgb(var(--line))",
                    background: "rgb(var(--surface))",
                    color: "rgb(var(--ink))",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="planned" fill="#38BDF8" opacity={0.28} radius={[8, 8, 0, 0]} name="Planned" />
                <Bar dataKey="completed" fill="#E879F9" radius={[8, 8, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-extrabold">Last two weeks</h2>
          <p className="mb-4 text-xs muted">A wobbly line is a normal line.</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last14} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgb(var(--line))" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: axisColor }} stroke="rgb(var(--line))" interval={2} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: axisColor }} stroke="rgb(var(--line))" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid rgb(var(--line))",
                    background: "rgb(var(--surface))",
                    color: "rgb(var(--ink))",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Checked off"
                  stroke="#38BDF8"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#E879F9", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5 lg:col-span-2">
          <h2 className="text-base font-extrabold">This week by habit</h2>
          <p className="mb-4 text-xs muted">Whatever is on top this week — that&apos;s the one that&apos;s been easiest.</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perHabit} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgb(var(--line))" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: axisColor }} stroke="rgb(var(--line))" />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: axisColor }} stroke="rgb(var(--line))" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid rgb(var(--line))",
                    background: "rgb(var(--surface))",
                    color: "rgb(var(--ink))",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="done" name="Checked off" radius={[0, 8, 8, 0]}>
                  {perHabit.map((_, i) => (
                    <Cell key={i} fill={["#E879F9", "#38BDF8", "#FBBF24", "#C084FC"][i % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <CalendarRange aria-hidden="true" className="h-5 w-5 text-rabbit-primary" />
              Weekly report
            </h2>
            <p className="mt-1.5 text-sm muted">
              Only built when you ask, and only ever read by you. It&apos;s honest about the numbers and kind about the
              person — no comparisons, no warnings, nothing to keep up.
            </p>
          </div>
          <Rabbit mood={report ? "cheer" : "peek"} size={64} className="hidden shrink-0 sm:block" />
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--page))] p-3">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-[rgb(var(--line))] accent-rabbit-primary"
          />
          <span className="text-xs leading-relaxed muted">
            I&apos;d like to keep this report on my account as a saved record. It stays private either way — sharing is a
            separate, future decision I can reverse.
            {profile.share_weekly_report && " (Sharing is currently on in your profile.)"}
          </span>
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" className="btn-primary" onClick={generateReport} disabled={generating}>
            {generating ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Sparkles aria-hidden="true" className="h-4 w-4" />}
            {generating ? "Writing it…" : "Generate my weekly report"}
          </button>
          <span className="text-xs muted">
            Week of {weekOfLabel(weekStart)} · {totalThisWeek} of {plannedThisWeek} moments
          </span>
        </div>

        {report && (
          <div className="mt-4 animate-fade-up rounded-2xl border border-rabbit-primary/30 bg-rabbit-primary/[.07] p-4">
            <div className="flex items-start gap-3">
              <Heart aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-rabbit-primary" />
              <div>
                <h3 className="text-sm font-extrabold">Your week, in a few honest lines</h3>
                <p className="mt-1 text-sm leading-relaxed">{report.summary}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-rabbit-primary">
                  <Share2 aria-hidden="true" className="h-3.5 w-3.5" />
                  Private to you. Share it only if you want to.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
