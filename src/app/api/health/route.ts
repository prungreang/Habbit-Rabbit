import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ status: "ok", app: "habit-rabbit", time: new Date().toISOString() });
}
