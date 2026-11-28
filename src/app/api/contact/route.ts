import { NextResponse } from "next/server";
import { getSession } from "@/lib/data";
import { mutateStore } from "@/lib/demo-store";
import { createAdminSupabase } from "@/lib/supabase";
import { uid } from "@/lib/utils";
import type { ContactMessage } from "@/lib/types";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const honeypot = typeof body.website === "string" ? body.website : "";

  const errors: Record<string, string> = {};
  if (name.length < 1 || name.length > 80) errors.name = "Please tell us your name (up to 80 characters).";
  if (!EMAIL_RE.test(email)) errors.email = "That email doesn't look quite right.";
  if (subject.length < 1 || subject.length > 140) errors.subject = "A short subject, up to 140 characters.";
  if (message.length < 1 || message.length > 2000) errors.message = "A message between 1 and 2000 characters.";
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  // Silently accept bot submissions so they don't learn the honeypot exists.
  if (honeypot) return NextResponse.json({ ok: true });

  const session = await getSession();
  const admin = createAdminSupabase();

  if (admin) {
    const { error } = await admin.from("contact_messages").insert({
      user_id: session?.mode === "supabase" ? session.userId : null,
      name,
      email,
      subject,
      message,
    });
    if (error) return NextResponse.json({ error: "We couldn't save that. Please try again." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const record = await mutateStore((store) => {
    const created: ContactMessage = {
      id: uid("msg"),
      user_id: session?.userId ?? null,
      name,
      email,
      subject,
      message,
      status: "new",
      created_at: new Date().toISOString(),
    };
    store.contact.push(created);
    return created;
  });

  return NextResponse.json({ ok: true, id: record.id });
}
