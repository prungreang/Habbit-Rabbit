import "server-only";
import { createServerSupabase, isSupabaseConfigured } from "./supabase";
import { ensureDemoUser, getDemoUserId } from "./demo-store";
import type {
  AppData,
  ContactMessage,
  Habit,
  HabitLog,
  Notification,
  Profile,
  Role,
  WeeklyReport,
} from "./types";

export interface Session {
  mode: "supabase" | "demo";
  userId: string;
  profile: Profile;
}

/**
 * The single place the app asks "who is this?".
 * Supabase when configured, otherwise a local demo profile kept in a cookie + JSON file.
 */
export async function getSession(create = false): Promise<Session | null> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();
    const fallback: Profile = {
      id: data.user.id,
      email: data.user.email ?? null,
      full_name: (data.user.user_metadata?.full_name as string) ?? null,
      avatar_url: (data.user.user_metadata?.avatar_url as string) ?? null,
      role: "user",
      timezone: "UTC",
      share_weekly_report: false,
      notify_reminders: true,
      created_at: data.user.created_at,
    };
    return { mode: "supabase", userId: data.user.id, profile: profile ?? fallback };
  }

  const id = await getDemoUserId(create);
  if (!id) return null;
  const store = await ensureDemoUser(id);
  const profile = store.profiles.find((p) => p.id === id);
  if (!profile) return null;
  return { mode: "demo", userId: id, profile };
}

/** Everything a signed-in page needs, in one call. */
export async function getAppData(): Promise<AppData | null> {
  const session = await getSession();
  if (!session) return null;

  if (session.mode === "supabase") {
    const supabase = (await createServerSupabase())!;
    const [{ data: habits }, { data: logs }, { data: notifications }] = await Promise.all([
      supabase
        .from("habits")
        .select("*")
        .eq("user_id", session.userId)
        .eq("archived", false)
        .order("sort_order", { ascending: true }),
      supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", session.userId)
        .order("log_date", { ascending: false })
        .limit(400),
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.userId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    return {
      mode: "supabase",
      profile: session.profile,
      habits: (habits ?? []) as Habit[],
      logs: (logs ?? []) as HabitLog[],
      notifications: (notifications ?? []) as Notification[],
    };
  }

  const store = await ensureDemoUser(session.userId);
  return {
    mode: "demo",
    profile: session.profile,
    habits: store.habits
      .filter((h) => h.user_id === session.userId && !h.archived)
      .sort((a, b) => a.sort_order - b.sort_order),
    logs: store.logs.filter((l) => l.user_id === session.userId),
    notifications: store.notifications
      .filter((n) => n.user_id === session.userId)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
  };
}

export function canManage(session: Session): boolean {
  return session.profile.role === "admin" || session.profile.role === "moderator";
}

export type StaffRow = {
  profile: Profile;
  habitCount: number;
  checkIns: number;
  lastActive: string | null;
};

/** Staff-only overview used by /admin. */
export async function getStaffOverview(): Promise<{
  rows: StaffRow[];
  messages: ContactMessage[];
  reports: WeeklyReport[];
  totals: { users: number; habits: number; checkIns: number; messages: number };
}> {
  const session = await getSession();
  if (!session || !canManage(session)) {
    return { rows: [], messages: [], reports: [], totals: { users: 0, habits: 0, checkIns: 0, messages: 0 } };
  }

  if (session.mode === "supabase") {
    const supabase = (await createServerSupabase())!;
    const [{ data: profiles }, { data: habits }, { data: logs }, { data: messages }, { data: reports }] =
      await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200),
        supabase.from("habits").select("user_id").limit(2000),
        supabase.from("habit_logs").select("user_id, log_date").limit(5000),
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("weekly_reports").select("*").order("created_at", { ascending: false }).limit(100),
      ]);
    const rows = buildRows((profiles ?? []) as Profile[], (habits ?? []) as Habit[], (logs ?? []) as HabitLog[]);
    return {
      rows,
      messages: (messages ?? []) as ContactMessage[],
      reports: (reports ?? []) as WeeklyReport[],
      totals: {
        users: rows.length,
        habits: habits?.length ?? 0,
        checkIns: logs?.length ?? 0,
        messages: messages?.length ?? 0,
      },
    };
  }

  const { readStore } = await import("./demo-store");
  const store = await readStore();
  const rows = buildRows(store.profiles, store.habits, store.logs);
  return {
    rows,
    messages: [...store.contact].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    reports: store.reports,
    totals: {
      users: rows.length,
      habits: store.habits.length,
      checkIns: store.logs.length,
      messages: store.contact.length,
    },
  };
}

function buildRows(profiles: Profile[], habits: Habit[], logs: HabitLog[]): StaffRow[] {
  return profiles.map((profile) => {
    const userLogs = logs.filter((l) => l.user_id === profile.id);
    return {
      profile,
      habitCount: habits.filter((h) => h.user_id === profile.id && !h.archived).length,
      checkIns: userLogs.length,
      lastActive: userLogs.map((l) => l.log_date).sort().at(-1) ?? null,
    };
  });
}

export const ROLE_LABELS: Record<Role, string> = {
  user: "Member",
  moderator: "Moderator",
  admin: "Admin",
};
