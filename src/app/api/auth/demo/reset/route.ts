import { NextResponse } from "next/server";
import { getSession } from "@/lib/data";
import { resetDemoUser } from "@/lib/demo-store";

export async function POST() {
  const session = await getSession(true);
  if (!session) return NextResponse.json({ error: "No session" }, { status: 401 });
  if (session.mode === "demo") await resetDemoUser(session.userId);
  return NextResponse.json({ ok: true });
}
