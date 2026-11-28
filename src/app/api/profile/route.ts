import { NextResponse } from "next/server";
import { getSession } from "@/lib/data";
import { mutateStore } from "@/lib/demo-store";
import { createServerSupabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const patch: Partial<Profile> = {};
  if (typeof body.full_name === "string") {
    const name = body.full_name.trim().slice(0, 80);
    if (!name) return NextResponse.json({ error: "Your name can't be empty." }, { status: 400 });
    patch.full_name = name;
  }
  if (typeof body.timezone === "string" && body.timezone.length < 64) patch.timezone = body.timezone;
  if (typeof body.share_weekly_report === "boolean") patch.share_weekly_report = body.share_weekly_report;
  if (typeof body.notify_reminders === "boolean") patch.notify_reminders = body.notify_reminders;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to change." }, { status: 400 });
  }

  if (session.mode === "supabase") {
    const supabase = (await createServerSupabase())!;
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", session.userId)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ profile: data });
  }

  const profile = await mutateStore((store) => {
    const found = store.profiles.find((p) => p.id === session.userId);
    if (!found) return null;
    Object.assign(found, patch);
    return found;
  });
  if (!profile) return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  return NextResponse.json({ profile });
}
