import { NextResponse } from "next/server";
import { getSession } from "@/lib/data";
import { mutateStore } from "@/lib/demo-store";
import { createServerSupabase } from "@/lib/supabase";
import type { Habit, HabitColor, Weekday } from "@/lib/types";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const patch: Partial<Habit> = {};
  if (typeof body.title === "string") {
    const title = body.title.trim();
    if (title.length < 1 || title.length > 120) {
      return NextResponse.json({ error: "Give it a name between 1 and 120 characters." }, { status: 400 });
    }
    patch.title = title;
  }
  if (typeof body.notes === "string") patch.notes = body.notes.trim().slice(0, 500) || null;
  if (typeof body.emoji === "string" && body.emoji.trim()) patch.emoji = body.emoji.trim().slice(0, 4);
  if (body.color === "primary" || body.color === "secondary" || body.color === "accent") {
    patch.color = body.color as HabitColor;
  }
  if (Array.isArray(body.weekdays)) {
    const days = body.weekdays.map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6) as Weekday[];
    patch.weekdays = days.length ? days : [0, 1, 2, 3, 4, 5, 6];
  }
  if (typeof body.archived === "boolean") patch.archived = body.archived;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to change." }, { status: 400 });
  }

  if (session.mode === "supabase") {
    const supabase = (await createServerSupabase())!;
    const { data, error } = await supabase
      .from("habits")
      .update(patch)
      .eq("id", id)
      .eq("user_id", session.userId)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ habit: data });
  }

  const habit = await mutateStore((store) => {
    const found = store.habits.find((h) => h.id === id && h.user_id === session.userId);
    if (!found) return null;
    Object.assign(found, patch, { updated_at: new Date().toISOString() });
    return found;
  });
  if (!habit) return NextResponse.json({ error: "Habit not found." }, { status: 404 });
  return NextResponse.json({ habit });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const { id } = await params;

  if (session.mode === "supabase") {
    const supabase = (await createServerSupabase())!;
    const { error } = await supabase.from("habits").delete().eq("id", id).eq("user_id", session.userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  const removed = await mutateStore((store) => {
    const before = store.habits.length;
    store.habits = store.habits.filter((h) => !(h.id === id && h.user_id === session.userId));
    store.logs = store.logs.filter((l) => l.habit_id !== id);
    return before !== store.habits.length;
  });
  if (!removed) return NextResponse.json({ error: "Habit not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
