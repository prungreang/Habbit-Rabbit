import { NextResponse } from "next/server";
import { getSession } from "@/lib/data";
import { mutateStore } from "@/lib/demo-store";
import { createServerSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function PATCH() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const now = new Date().toISOString();

  if (session.mode === "supabase") {
    const supabase = (await createServerSupabase())!;
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("user_id", session.userId)
      .is("read_at", null);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  await mutateStore((store) => {
    store.notifications
      .filter((n) => n.user_id === session.userId && !n.read_at)
      .forEach((n) => (n.read_at = now));
  });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  if (session.mode === "supabase") {
    const supabase = (await createServerSupabase())!;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(20);
    return NextResponse.json({ notifications: data ?? [] });
  }

  const { readStore } = await import("@/lib/demo-store");
  const store = await readStore();
  return NextResponse.json({
    notifications: store.notifications
      .filter((n) => n.user_id === session.userId)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
  });
}
