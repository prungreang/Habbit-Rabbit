import { NextResponse } from "next/server";
import { getSession } from "@/lib/data";
import { mutateStore } from "@/lib/demo-store";
import { createServerSupabase } from "@/lib/supabase";
import { addDays, startOfWeek, toISODate, uid, weekDates } from "@/lib/utils";
import type { WeeklyReport } from "@/lib/types";
import { summarise } from "@/lib/report";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    weekStart?: string;
    consentPublic?: boolean;
  };
  const weekStart = body.weekStart ?? startOfWeek(toISODate(new Date()));
  const consentPublic = body.consentPublic === true;
  const days = weekDates(weekStart);

  if (session.mode === "supabase") {
    const supabase = (await createServerSupabase())!;
    const [{ data: habits }, { data: logs }] = await Promise.all([
      supabase.from("habits").select("*").eq("user_id", session.userId).eq("archived", false),
      supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", session.userId)
        .gte("log_date", weekStart)
        .lte("log_date", addDays(weekStart, 6)),
    ]);
    const planned = (habits ?? []).reduce(
      (sum, h) => sum + days.filter((d) => (h.weekdays as number[]).includes(new Date(`${d}T12:00:00`).getDay())).length,
      0,
    );
    const completed = (logs ?? []).length;
    const byDay = days.map((d) => ({
      date: d,
      count: (logs ?? []).filter((l) => l.log_date === d).length,
    }));
    const best = [...byDay].sort((a, b) => b.count - a.count)[0];
    const bestDay = best && best.count > 0
      ? new Date(`${best.date}T12:00:00`).toLocaleDateString(undefined, { weekday: "long" })
      : null;
    const summary = summarise(completed, planned, bestDay);

    const { data: report } = await supabase
      .from("weekly_reports")
      .upsert(
        {
          user_id: session.userId,
          week_start: weekStart,
          completed_count: completed,
          planned_count: planned,
          summary,
          consent_public: consentPublic,
        },
        { onConflict: "user_id,week_start" },
      )
      .select()
      .single();

    return NextResponse.json({ report: report ?? { summary, completed_count: completed, planned_count: planned } });
  }

  const { readStore } = await import("@/lib/demo-store");
  const store = await readStore();
  const habits = store.habits.filter((h) => h.user_id === session.userId && !h.archived);
  const logs = store.logs.filter(
    (l) => l.user_id === session.userId && days.includes(l.log_date),
  );
  const planned = habits.reduce(
    (sum, h) => sum + days.filter((d) => h.weekdays.includes(new Date(`${d}T12:00:00`).getDay() as never)).length,
    0,
  );
  const completed = logs.length;
  const byDay = days.map((d) => ({ date: d, count: logs.filter((l) => l.log_date === d).length }));
  const best = [...byDay].sort((a, b) => b.count - a.count)[0];
  const bestDay =
    best && best.count > 0
      ? new Date(`${best.date}T12:00:00`).toLocaleDateString(undefined, { weekday: "long" })
      : null;
  const summary = summarise(completed, planned, bestDay);

  const report = await mutateStore((s) => {
    const existing = s.reports.find((r) => r.user_id === session.userId && r.week_start === weekStart);
    if (existing) {
      Object.assign(existing, { completed_count: completed, planned_count: planned, summary, consent_public: consentPublic });
      return existing;
    }
    const created: WeeklyReport = {
      id: uid("report"),
      user_id: session.userId,
      week_start: weekStart,
      completed_count: completed,
      planned_count: planned,
      summary,
      consent_public: consentPublic,
      created_at: new Date().toISOString(),
    };
    s.reports.push(created);
    return created;
  });

  return NextResponse.json({ report });
}
