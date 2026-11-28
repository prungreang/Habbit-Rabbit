import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { DEMO_COOKIE } from "@/lib/demo-store";

export async function POST() {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    await supabase?.auth.signOut();
  }
  const jar = await cookies();
  jar.delete(DEMO_COOKIE);
  return NextResponse.json({ ok: true });
}
