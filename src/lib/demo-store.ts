import "server-only";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import type {
  ContactMessage,
  Habit,
  HabitLog,
  Notification,
  Profile,
  WeeklyReport,
} from "./types";
import { toISODate, uid } from "./utils";

/**
 * Local demo store.
 *
 * When Supabase credentials are absent (which is how this build ships), the app keeps the
 * exact same data shapes in a JSON file and a signed cookie so every screen — CRUD, search,
 * week view, report, notifications, contact form, admin table — works end to end without a
 * backend. Point NEXT_PUBLIC_SUPABASE_URL / ANON_KEY at a real project and every route switches
 * to Supabase automatically (see src/lib/supabase.ts and src/lib/data.ts).
 */

export const DEMO_COOKIE = "hr_demo_user";
const STORE_DIR = process.env.HABIT_RABBIT_STORE_DIR || process.env.VERCEL ? "/tmp" : ".data";
const STORE_FILE = `${STORE_DIR}/habit-rabbit-demo.json`;

export interface DemoStore {
  profiles: Profile[];
  habits: Habit[];
  logs: HabitLog[];
  notifications: Notification[];
  contact: ContactMessage[];
  reports: WeeklyReport[];
}

const empty = (): DemoStore => ({
  profiles: [],
  habits: [],
  logs: [],
  notifications: [],
  contact: [],
  reports: [],
});

async function fs() {
  return import("node:fs/promises");
}

export async function readStore(): Promise<DemoStore> {
  try {
    const { readFile } = await fs();
    const raw = await readFile(STORE_FILE, "utf8");
    return { ...empty(), ...(JSON.parse(raw) as DemoStore) };
  } catch {
    return empty();
  }
}

export async function writeStore(store: DemoStore): Promise<void> {
  const { mkdir, writeFile } = await fs();
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function mutateStore<T>(fn: (s: DemoStore) => T | Promise<T>): Promise<T> {
  const store = await readStore();
  const result = await fn(store);
  await writeStore(store);
  return result;
}

/** Cookie holding the demo user id; created on first visit. */
export async function getDemoUserId(create = false): Promise<string | null> {
  const jar = await cookies();
  const existing = jar.get(DEMO_COOKIE)?.value;
  if (existing) return existing;
  if (!create) return null;
  const id = randomUUID();
  try {
    jar.set(DEMO_COOKIE, id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  } catch {
    // read-only context (e.g. a Server Component render) — caller will retry after a refresh
  }
  return id;
}

const SAMPLE_HABITS: Array<Omit<Habit, "id" | "user_id" | "created_at" | "updated_at">> = [
  {
    title: "Drink a glass of water",
    notes: "First thing, before anything else.",
    emoji: "💧",
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    color: "secondary",
    archived: false,
    sort_order: 0,
  },
  {
    title: "Ten minute walk outside",
    notes: "Any pace. Looking at things counts.",
    emoji: "🌿",
    weekdays: [1, 2, 3, 4, 5],
    color: "primary",
    archived: false,
    sort_order: 1,
  },
  {
    title: "Read two pages",
    notes: null,
    emoji: "📚",
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    color: "accent",
    archived: false,
    sort_order: 2,
  },
  {
    title: "Tidy one small surface",
    notes: "Just one. That's the whole task.",
    emoji: "🧺",
    weekdays: [1, 3, 5],
    color: "primary",
    archived: false,
    sort_order: 3,
  },
];

function sampleLogs(userId: string, habits: Habit[]): HabitLog[] {
  const logs: HabitLog[] = [];
  const today = new Date();
  // deterministic-ish pattern over the last 20 days so the week + charts have something honest to show
  const pattern: Record<string, number[]> = {
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    1: [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19],
    2: [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    3: [2, 4, 6, 7, 9, 11, 12, 14, 16, 17, 19],
  };
  habits.forEach((habit, index) => {
    for (const daysAgo of pattern[index] ?? []) {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      const iso = toISODate(d);
      const weekday = d.getDay();
      if (!habit.weekdays.includes(weekday as never)) continue;
      logs.push({
        id: uid("log"),
        habit_id: habit.id,
        user_id: userId,
        log_date: iso,
        completed: true,
        note: null,
        created_at: new Date().toISOString(),
      });
    }
  });
  return logs;
}

/** Idempotently makes sure the demo user exists, with a friendly starting kit. */
export async function ensureDemoUser(userId: string): Promise<DemoStore> {
  return mutateStore((store) => {
    let profile = store.profiles.find((p) => p.id === userId);
    if (!profile) {
      profile = {
        id: userId,
        email: "hello@habit-rabbit.local",
        full_name: "Bunny",
        avatar_url: null,
        role: "admin", // so the demo can show the admin/moderator surfaces
        timezone: "America/New_York",
        share_weekly_report: false,
        notify_reminders: true,
        created_at: new Date().toISOString(),
      };
      store.profiles.push(profile);

      const now = new Date().toISOString();
      const habits: Habit[] = SAMPLE_HABITS.map((h) => ({
        ...h,
        id: uid("habit"),
        user_id: userId,
        created_at: now,
        updated_at: now,
      }));
      store.habits.push(...habits);
      store.logs.push(...sampleLogs(userId, habits));
      store.notifications.push(
        {
          id: uid("note"),
          user_id: userId,
          title: "Welcome to Habit Rabbit 🐰",
          body: "There are no streaks here, nothing to lose. Tick something when it feels good.",
          kind: "info",
          read_at: null,
          created_at: now,
        },
        {
          id: uid("note"),
          user_id: userId,
          title: "Your week is ready when you are",
          body: "Open the Week tab any time for a gentle look back. Nothing is shared unless you say so.",
          kind: "info",
          read_at: null,
          created_at: now,
        },
      );
    }
    return store;
  });
}

export async function resetDemoUser(userId: string): Promise<void> {
  await mutateStore((store) => {
    store.habits = store.habits.filter((h) => h.user_id !== userId);
    store.logs = store.logs.filter((l) => l.user_id !== userId);
    store.notifications = store.notifications.filter((n) => n.user_id !== userId);
    store.reports = store.reports.filter((r) => r.user_id !== userId);
    store.profiles = store.profiles.filter((p) => p.id !== userId);
    return store;
  });
  await ensureDemoUser(userId);
}
