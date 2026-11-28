"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, RotateCcw, Save } from "lucide-react";
import type { Profile } from "@/lib/types";
import { useToast } from "../ToastProvider";
import { useTheme } from "../ThemeProvider";

export function ProfileForm({ profile, mode }: { profile: Profile; mode: "supabase" | "demo" }) {
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(profile.full_name ?? "");
  const [timezone, setTimezone] = useState(profile.timezone);
  const [share, setShare] = useState(profile.share_weekly_report);
  const [reminders, setReminders] = useState(profile.notify_reminders);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: name,
        timezone,
        share_weekly_report: share,
        notify_reminders: reminders,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast({ kind: "error", title: "Couldn't save", description: data.error ?? "Please try again." });
      return;
    }
    toast({ kind: "success", title: "Profile saved" });
    router.refresh();
  }

  async function signOut() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    toast({ kind: "info", title: "Signed out", description: "Your habits are waiting whenever you come back." });
    router.push("/");
    router.refresh();
  }

  async function resetDemo() {
    const res = await fetch("/api/auth/demo/reset", { method: "POST" });
    if (!res.ok) {
      toast({ kind: "error", title: "Couldn't reset" });
      return;
    }
    toast({ kind: "success", title: "Fresh start", description: "Sample habits are back." });
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="card p-5 sm:p-6">
        <h2 className="text-lg font-extrabold">You</h2>
        <p className="mt-1 text-sm muted">Only used to greet you. Nothing here is public.</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-name" className="label">
              Display name
            </label>
            <input
              id="profile-name"
              className="field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="profile-email" className="label">
              Email
            </label>
            <input id="profile-email" className="field opacity-70" value={profile.email ?? "—"} readOnly disabled />
          </div>
          <div>
            <label htmlFor="profile-tz" className="label">
              Time zone
            </label>
            <input
              id="profile-tz"
              className="field"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="America/New_York"
            />
            <p className="mt-1 text-xs muted">Your day rolls over in this zone.</p>
          </div>
          <div>
            <span className="label">Role</span>
            <p className="chip bg-rabbit-secondary/15 text-rabbit-secondary capitalize">{profile.role}</p>
          </div>
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <h2 className="text-lg font-extrabold">Your choices</h2>
        <div className="mt-3 space-y-3">
          <Toggle
            id="share-report"
            label="Keep weekly reports on my account"
            hint="Off by default. Even when on, reports stay private to you."
            checked={share}
            onChange={setShare}
          />
          <Toggle
            id="reminders"
            label="Gentle reminders"
            hint="An occasional nudge, never a guilt trip. You can silence these any time."
            checked={reminders}
            onChange={setReminders}
          />
        </div>

        <fieldset className="mt-5">
          <legend className="label">Appearance</legend>
          <div className="flex gap-2">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                aria-pressed={theme === t}
                className={`btn-secondary capitalize ${theme === t ? "border-rabbit-primary bg-rabbit-primary/10" : ""}`}
              >
                {t} mode
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          <Save aria-hidden="true" className="h-4 w-4" />
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button type="button" className="btn-secondary" onClick={signOut}>
          <LogOut aria-hidden="true" className="h-4 w-4" />
          Sign out
        </button>
        {mode === "demo" && (
          <button type="button" className="btn-ghost" onClick={resetDemo}>
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Reset demo data
          </button>
        )}
      </div>
    </form>
  );
}

function Toggle({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--page))] p-3 transition-colors hover:border-rabbit-primary/50"
    >
      <span className="relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full bg-[rgb(var(--line))] transition-colors peer-checked:bg-rabbit-primary peer-focus-visible:ring-4 peer-focus-visible:ring-rabbit-secondary/30" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-0.5 block text-xs muted">{hint}</span>
      </span>
    </label>
  );
}
