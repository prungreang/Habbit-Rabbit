export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Role = "user" | "moderator" | "admin";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  timezone: string;
  share_weekly_report: boolean;
  notify_reminders: boolean;
  created_at: string;
}

export type HabitColor = "primary" | "secondary" | "accent";

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  emoji: string;
  weekdays: Weekday[];
  color: HabitColor;
  archived: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** A check-off: one habit on one calendar day. */
export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  completed: boolean;
  note: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  kind: "info" | "celebrate" | "report" | "system";
  read_at: string | null;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  created_at: string;
}

export interface WeeklyReport {
  id: string;
  user_id: string;
  week_start: string;
  completed_count: number;
  planned_count: number;
  summary: string;
  consent_public: boolean;
  created_at: string;
}

/** Shape returned by the app's own API routes, so the UI never talks to Supabase directly. */
export interface HabitWithStatus extends Habit {
  doneToday: boolean;
  weekDots: { date: string; done: boolean; planned: boolean }[];
}

export interface AppData {
  profile: Profile;
  habits: Habit[];
  logs: HabitLog[];
  notifications: Notification[];
  mode: "supabase" | "demo";
}
