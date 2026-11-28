import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";

/** Google OAuth lands here with a code; exchange it for a session cookie and continue. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const safeNext = next && next.startsWith("/") ? next : "/today";

  const supabase = await createServerSupabase();
  if (!supabase) {
    return NextResponse.redirect(new URL("/sign-in", url.origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?error=missing_code", url.origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, url.origin));
  }

  return NextResponse.redirect(new URL(safeNext, url.origin));
}
