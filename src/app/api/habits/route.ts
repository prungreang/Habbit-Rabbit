import { NextResponse } from "next/server";
import { getSession } from "@/lib/data";
import { mutateStore } from "@/lib/demo-store";
import { createServerSupabase } from "@/lib/supabase";
import { toISODate, uid } from "@/lib/utils";
import type { Habit, HabitColor, Weekday } from "@/lib/types";

export const runtime = "nodejs";

function parseHabitInput(body: unknown) {
  const b = (body ?? {}) as Record<string, unknown>;
  const title = typeof b.title === "string" ? b.title.trim() : "";
  const notes = typeof b.notes === "string" ? b.notes.trim().slice(0, 500) : "";
  const emoji = typeof b.emoji === "string" && b.emoji.trim() ? b.emoji.trim().slice(0, 4) : "🥕";
  const color: HabitColor =
    b.color === "secondary" || b.color === "accent" ? b.color : "primary";
  const weekdays: Weekday[] = Array.isArray(b.weekdays)
    ? (b.weekdays.map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6) as Weekday[])
    : ([0, 1, 2, 3, 4, 5, 6] as Weekday[]);

  if (title.length < 1 || title.length > 120) {
    return { error: "Give it a name between 1 and 120 characters." } as const;
  }
  return {
    value: {
      title,
      notes: notes || null,
      emoji,
      color,
      weekdays: weekdays.length ? weekdays : ([0, 1, 2, 3, 4, 5, 6] as Weekday[]),
    },
  } as const;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const parsed = parseHabitInput(await request.json().catch(() => ({})));
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  if (session.mode === "supabase") {
    const supabase = (await createServerSupabase())!;
    const { data, error } = await supabase
      .from("habits")
      .insert({ ...parsed.value, user_id: session.userId })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ habit: data as Habit }, { status: 201 });
  }

  const habit = await mutateStore((store) => {
    const now = new Date().toISOString();
    const mine = store.habits.filter((h) => h.user_id === session.userId);
    const created: Habit = {
      id: uid("habit"),
      user_id: session.userId,
      ...parsed.value,
      archived: false,
      sort_order: mine.length,
      created_at: now,
      updated_at: now,
    };
    store.habits.push(created);
    return created;
  });

  return NextResponse.json({ habit }, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  if (session.mode === "supabase") {
    const supabase = (await createServerSupabase())!;
    const { data } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", session.userId)
      .eq("archived", false)
      .order("sort_order");
    return NextResponse.json({ habits: data ?? [], today: toISODate(new Date()) });
  }

  const { readStore } = await import("@/lib/demo-store");
  const store = await readStore();
  return NextResponse.json({
    habits: store.habits.filter((h) => h.user_id === session.userId && !h.archived),
    today: toISODate(new Date()),
  });
}
