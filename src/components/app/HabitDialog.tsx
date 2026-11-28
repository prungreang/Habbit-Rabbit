"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Habit, HabitColor, Weekday } from "@/lib/types";
import { WEEKDAY_LABELS } from "@/lib/utils";
import { useToast } from "../ToastProvider";

const EMOJIS = ["🥕", "💧", "🌿", "📚", "🧘", "🏃", "🎨", "🎵", "🧺", "☀️", "🌙", "🍎", "✍️", "🫶", "🧠", "🪴"];

const COLORS: { key: HabitColor; label: string; swatch: string }[] = [
  { key: "primary", label: "Blossom", swatch: "bg-rabbit-primary" },
  { key: "secondary", label: "Sky", swatch: "bg-rabbit-secondary" },
  { key: "accent", label: "Honey", swatch: "bg-rabbit-accent" },
];

export function HabitDialog({
  open,
  habit,
  onClose,
  onSaved,
}: {
  open: boolean;
  habit?: Habit | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [emoji, setEmoji] = useState("🥕");
  const [color, setColor] = useState<HabitColor>("primary");
  const [weekdays, setWeekdays] = useState<Weekday[]>([0, 1, 2, 3, 4, 5, 6]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const isEdit = Boolean(habit);

  useEffect(() => {
    if (!open) return;
    setTitle(habit?.title ?? "");
    setNotes(habit?.notes ?? "");
    setEmoji(habit?.emoji ?? "🥕");
    setColor(habit?.color ?? "primary");
    setWeekdays(habit?.weekdays ?? [0, 1, 2, 3, 4, 5, 6]);
    setError(null);
    const t = window.setTimeout(() => titleRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, habit, onClose]);

  const preview = useMemo(
    () => (
      <div className="flex items-center gap-3 rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--page))] px-4 py-3">
        <span aria-hidden="true" className="text-2xl">
          {emoji}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title || "Your new tiny habit"}</p>
          <p className="truncate text-xs muted">{notes || "One small, doable thing."}</p>
        </div>
      </div>
    ),
    [emoji, title, notes],
  );

  function toggleDay(day: Weekday) {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b),
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length === 0) {
      setError("Give it a name — even something tiny like “water the plant”.");
      titleRef.current?.focus();
      return;
    }
    setSaving(true);
    setError(null);
    const payload = { title, notes, emoji, color, weekdays: weekdays.length ? weekdays : [0, 1, 2, 3, 4, 5, 6] };
    const res = await fetch(isEdit ? `/api/habits/${habit!.id}` : "/api/habits", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    toast({
      kind: "success",
      title: isEdit ? "Habit updated" : "Habit added",
      description: isEdit ? "The change is saved." : "It's waiting for you whenever you're ready.",
    });
    onSaved();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-default bg-[#1E1B4B]/25 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="habit-dialog-title"
        className="card relative max-h-[92dvh] w-full max-w-lg animate-hop-in overflow-y-auto rounded-b-none p-5 sm:rounded-3xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="habit-dialog-title" className="text-xl font-extrabold">
              {isEdit ? "Edit habit" : "New habit"}
            </h2>
            <p className="mt-0.5 text-sm muted">Small and specific works best. You can always change it.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="btn-ghost -mr-2 p-2">
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="habit-title" className="label">
              What&apos;s the habit?
            </label>
            <input
              ref={titleRef}
              id="habit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              required
              placeholder="Read two pages"
              className="field"
              aria-describedby={error ? "habit-error" : undefined}
              aria-invalid={Boolean(error)}
            />
          </div>

          <div>
            <label htmlFor="habit-notes" className="label">
              A kind note to yourself <span className="font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              id="habit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Any pace counts. Even a paragraph is a win."
              className="field resize-none"
            />
          </div>

          <fieldset>
            <legend className="label">Pick an icon</legend>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Habit icon">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  role="radio"
                  aria-checked={emoji === e}
                  aria-label={`Icon ${e}`}
                  onClick={() => setEmoji(e)}
                  className={`grid h-10 w-10 place-items-center rounded-xl border text-lg transition-all duration-200 hover:-translate-y-0.5 ${
                    emoji === e
                      ? "border-rabbit-primary bg-rabbit-primary/15 shadow-glow"
                      : "border-[rgb(var(--line))] hover:border-rabbit-primary/50"
                  }`}
                >
                  <span aria-hidden="true">{e}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="label">Colour</legend>
            <div className="flex gap-2" role="radiogroup" aria-label="Habit colour">
              {COLORS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  role="radio"
                  aria-checked={color === c.key}
                  onClick={() => setColor(c.key)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                    color === c.key
                      ? "border-[rgb(var(--ink))]/20 bg-[rgb(var(--page))] shadow-soft"
                      : "border-[rgb(var(--line))] hover:border-rabbit-primary/50"
                  }`}
                >
                  <span aria-hidden="true" className={`h-3.5 w-3.5 rounded-full ${c.swatch}`} />
                  {c.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="label">Which days?</legend>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAY_LABELS.map((label, index) => {
                const day = index as Weekday;
                const on = weekdays.includes(day);
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleDay(day)}
                    className={`min-w-11 rounded-full border px-3 py-2 text-xs font-bold transition-all ${
                      on
                        ? "border-transparent bg-rabbit-secondary text-white shadow-soft"
                        : "border-[rgb(var(--line))] text-[rgb(var(--ink-muted))] hover:border-rabbit-secondary/60"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs muted">Leave none selected to show it every day.</p>
          </fieldset>

          {preview}

          {error && (
            <p id="habit-error" role="alert" className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-300">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add habit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
