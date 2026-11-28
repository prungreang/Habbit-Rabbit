import { NextResponse } from "next/server";
import { canManage, getSession } from "@/lib/data";
import { mutateStore } from "@/lib/demo-store";
import { createServerSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

/** Staff-only: move a contact message between new / read / replied. */
export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!canManage(session)) return NextResponse.json({ error: "Staff only." }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as { id?: string; status?: string };
  const status = body.status;
  if (!body.id || !status || !["new", "read", "replied"].includes(status)) {
    return NextResponse.json({ error: "Unknown message or status." }, { status: 400 });
  }

  if (session.mode === "supabase") {
    const supabase = (await createServerSupabase())!;
    const { error } = await supabase.from("contact_messages").update({ status }).eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  await mutateStore((store) => {
    const msg = store.contact.find((m) => m.id === body.id);
    if (msg) msg.status = status as "new" | "read" | "replied";
  });
  return NextResponse.json({ ok: true });
}
