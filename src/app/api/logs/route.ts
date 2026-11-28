import { NextResponse } from "next/server";
import { getSession } from "@/lib/data";
import { mutateStore } from "@/lib/demo-store";
import { createServerSupabase } from "@/lib/supabase";
import { toISODate, uid } from "@/lib/utils";

export const runtime = "nodejs";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Check a habit off (or undo it) for one day. No streaks are computed or stored — by design. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    habitId?: string;
    date?: string;
    completed?: boolean;
  };
  const habitId = body.habitId;
  const date = body.date && DATE_RE.test(body.date) ? body.date : toISODate(new Date());
  const completed = body.completed !== false;

  if (!habitId) return NextResponse.json({ error: "Which habit?" }, { status: 400 });

  if (session.mode === "supabase") {
    const supabase = (await createServerSupabase())!;
    const { data: habit } = await supabase
      .from("habits")
      .select("id")
      .eq("id", habitId)
      .eq("user_id", session.userId)
      .maybeSingle();
    if (!habit) return NextResponse.json({ error: "Habit not found." }, { status: 404 });

    if (completed) {
      const { error } = await supabase
        .from("habit_logs")
        .upsert(
          { habit_id: habitId, user_id: session.userId, log_date: date, completed: true },
          { onConflict: "habit_id,log_date" },
        );
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      await supabase
        .from("habit_logs")
        .delete()
        .eq("habit_id", habitId)
        .eq("user_id", session.userId)
        .eq("log_date", date);
    }
    return NextResponse.json({ ok: true, date, completed });
  }

  const result = await mutateStore((store) => {
    const habit = store.habits.find((h) => h.id === habitId && h.user_id === session.userId);
    if (!habit) return null;
    const existing = store.logs.find((l) => l.habit_id === habitId && l.log_date === date);
    if (completed && !existing) {
      store.logs.push({
        id: uid("log"),
        habit_id: habitId,
        user_id: session.userId,
        log_date: date,
        completed: true,
        note: null,
        created_at: new Date().toISOString(),
      });
    }
    if (!completed && existing) {
      store.logs = store.logs.filter((l) => l.id !== existing.id);
    }
    return { ok: true, date, completed };
  });

  if (!result) return NextResponse.json({ error: "Habit not found." }, { status: 404 });
  return NextResponse.json(result);
}
