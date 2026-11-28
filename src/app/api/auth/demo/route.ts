import { NextResponse } from "next/server";
import { getSession } from "@/lib/data";

/** Starts (or resumes) the local demo session. Harmless no-op when Supabase is configured. */
export async function POST() {
  const session = await getSession(true);
  return NextResponse.json({ ok: Boolean(session), mode: session?.mode ?? null });
}
