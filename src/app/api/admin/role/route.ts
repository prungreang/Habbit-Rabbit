import { NextResponse } from "next/server";
import { getSession } from "@/lib/data";
import { mutateStore } from "@/lib/demo-store";
import { createServerSupabase } from "@/lib/supabase";
import type { Role } from "@/lib/types";

export const runtime = "nodejs";

/** Admins only: promote/demote another member. Moderators can read but not change roles. */
export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (session.profile.role !== "admin") {
    return NextResponse.json({ error: "Only admins can change roles." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as { userId?: string; role?: Role };
  if (!body.userId || !body.role || !["user", "moderator", "admin"].includes(body.role)) {
    return NextResponse.json({ error: "Unknown member or role." }, { status: 400 });
  }
  if (body.userId === session.userId && body.role !== "admin") {
    return NextResponse.json({ error: "You can't remove your own admin access." }, { status: 400 });
  }

  if (session.mode === "supabase") {
    const supabase = (await createServerSupabase())!;
    const { error } = await supabase.from("profiles").update({ role: body.role }).eq("id", body.userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  await mutateStore((store) => {
    const profile = store.profiles.find((p) => p.id === body.userId);
    if (profile) profile.role = body.role as Role;
  });
  return NextResponse.json({ ok: true });
}
