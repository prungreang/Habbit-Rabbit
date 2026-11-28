import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Local YYYY-MM-DD (never UTC — a habit belongs to the user's own day). */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, delta: number): string {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + delta);
  return toISODate(d);
}

/** Monday-start week containing `iso`. */
export function startOfWeek(iso: string): string {
  const d = fromISODate(iso);
  const shift = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - shift);
  return toISODate(d);
}

export function weekDates(startIso: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(startIso, i));
}

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

export function prettyDate(iso: string): string {
  return fromISODate(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function shortDate(iso: string): string {
  return fromISODate(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function isToday(iso: string) {
  return iso === toISODate(new Date());
}

export function weekOfLabel(startIso: string) {
  const end = addDays(startIso, 6);
  const a = fromISODate(startIso);
  const b = fromISODate(end);
  const sameMonth = a.getMonth() === b.getMonth();
  const left = a.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const right = b.toLocaleDateString(
    undefined,
    sameMonth ? { day: "numeric" } : { month: "short", day: "numeric" },
  );
  return `${left} – ${right}`;
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

/** Warm, non-judgemental copy. No streaks, no "don't break the chain". */
export function encouragementFor(completed: number, planned: number): string {
  if (planned === 0) return "A quiet day is a fine day. Add a small thing whenever you feel like it.";
  if (completed === 0) return "Nothing done yet — that's okay. The day is still yours.";
  if (completed === 1) return "One is a real win. That's genuinely enough for today.";
  if (completed < planned) return "Look at you go. Everything you did today counts, whatever's left can wait.";
  return "You did everything you planned today. Take a moment to feel good about that.";
}
