"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, Users } from "lucide-react";
import type { ContactMessage, Profile, Role } from "@/lib/types";
import { useToast } from "../ToastProvider";

const ROLE_STYLE: Record<Role, string> = {
  admin: "bg-rabbit-primary/15 text-rabbit-primary",
  moderator: "bg-rabbit-secondary/15 text-rabbit-secondary",
  user: "bg-rabbit-accent/20 text-amber-700 dark:text-rabbit-accent",
};

const STATUS_STYLE: Record<ContactMessage["status"], string> = {
  new: "bg-rabbit-primary/15 text-rabbit-primary",
  read: "bg-rabbit-secondary/15 text-rabbit-secondary",
  replied: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
};

export function AdminDashboard({
  rows,
  messages,
  totals,
  viewerRole,
}: {
  rows: { profile: Profile; habitCount: number; checkIns: number; lastActive: string | null }[];
  messages: ContactMessage[];
  totals: { users: number; habits: number; checkIns: number; messages: number };
  viewerRole: Role;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const [tab, setTab] = useState<"members" | "messages">("members");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"name" | "checkIns" | "lastActive">("checkIns");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter(
      (r) =>
        !q ||
        (r.profile.full_name ?? "").toLowerCase().includes(q) ||
        (r.profile.email ?? "").toLowerCase().includes(q) ||
        r.profile.role.includes(q),
    );
    return [...list].sort((a, b) => {
      if (sort === "name") return (a.profile.full_name ?? "").localeCompare(b.profile.full_name ?? "");
      if (sort === "lastActive") return (b.lastActive ?? "").localeCompare(a.lastActive ?? "");
      return b.checkIns - a.checkIns;
    });
  }, [rows, query, sort]);

  const filteredMessages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q),
    );
  }, [messages, query]);

  async function changeRole(userId: string, role: Role) {
    const res = await fetch("/api/admin/role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast({ kind: "error", title: "Role not changed", description: data.error ?? "Please try again." });
      return;
    }
    toast({ kind: "success", title: "Role updated" });
    startTransition(() => router.refresh());
  }

  async function setStatus(id: string, status: ContactMessage["status"]) {
    const res = await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) {
      toast({ kind: "error", title: "Couldn't update the message" });
      return;
    }
    toast({ kind: "success", title: `Marked ${status}` });
    startTransition(() => router.refresh());
  }

  return (
    <section className="space-y-5" aria-labelledby="admin-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-rabbit-primary">Staff area</p>
          <h1 id="admin-heading" className="mt-1 text-3xl font-extrabold sm:text-4xl">
            Admin
          </h1>
          <p className="mt-1.5 text-sm muted">
            You&apos;re signed in as <span className="font-semibold capitalize">{viewerRole}</span>. Members&apos; habit
            details stay private — this shows counts only.
          </p>
        </div>
        <span className="chip bg-rabbit-primary/10 text-rabbit-primary">
          <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" /> Role-based access
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Members", value: totals.users, icon: Users },
          { label: "Habits", value: totals.habits, icon: Users },
          { label: "Check-ins", value: totals.checkIns, icon: Users },
          { label: "Messages", value: totals.messages, icon: Users },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs font-bold uppercase tracking-wider muted">{s.label}</p>
            <p className="mt-1 font-display text-3xl font-extrabold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Admin sections" className="inline-flex rounded-full border border-[rgb(var(--line))] p-1">
          {(["members", "messages"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-all ${
                tab === t ? "bg-rabbit-primary text-white shadow-soft" : "muted hover:text-[rgb(var(--ink))]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <label htmlFor="admin-search" className="sr-only">
              Search {tab}
            </label>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 muted" />
            <input
              id="admin-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${tab}…`}
              className="field pl-9"
            />
          </div>
          {tab === "members" && (
            <label className="text-xs font-semibold muted">
              <span className="sr-only">Sort members by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="field py-2 text-xs"
              >
                <option value="checkIns">Most check-ins</option>
                <option value="name">Name</option>
                <option value="lastActive">Recently active</option>
              </select>
            </label>
          )}
        </div>
      </div>

      {tab === "members" ? (
        <div className="card overflow-x-auto p-1">
          <table className="w-full min-w-[640px] text-sm">
            <caption className="sr-only">Members and their activity</caption>
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider muted">
                <th scope="col" className="px-4 py-3">Member</th>
                <th scope="col" className="px-4 py-3">Role</th>
                <th scope="col" className="px-4 py-3 text-right">Habits</th>
                <th scope="col" className="px-4 py-3 text-right">Check-ins</th>
                <th scope="col" className="px-4 py-3">Last active</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ profile, habitCount, checkIns, lastActive }) => (
                <tr key={profile.id} className="border-t border-[rgb(var(--line))] transition-colors hover:bg-rabbit-primary/[.04]">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{profile.full_name ?? "Unnamed"}</p>
                    <p className="text-xs muted">{profile.email ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    {viewerRole === "admin" ? (
                      <select
                        aria-label={`Role for ${profile.full_name ?? "member"}`}
                        value={profile.role}
                        onChange={(e) => changeRole(profile.id, e.target.value as Role)}
                        className="rounded-full border border-[rgb(var(--line))] bg-[rgb(var(--surface))] px-2 py-1 text-xs font-semibold capitalize"
                      >
                        <option value="user">Member</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`chip capitalize ${ROLE_STYLE[profile.role]}`}>{profile.role}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{habitCount}</td>
                  <td className="px-4 py-3 text-right font-semibold">{checkIns}</td>
                  <td className="px-4 py-3 text-xs muted">{lastActive ?? "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm muted">
                    No members match that search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {filteredMessages.map((m) => (
            <li key={m.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold">{m.subject}</p>
                  <p className="text-xs muted">
                    {m.name} · {m.email} · {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`chip capitalize ${STATUS_STYLE[m.status]}`}>{m.status}</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm">{m.message}</p>
              <div className="mt-3 flex gap-2">
                {(["new", "read", "replied"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(m.id, s)}
                    disabled={m.status === s}
                    className="btn-secondary px-3 py-1 text-xs capitalize"
                  >
                    Mark {s}
                  </button>
                ))}
              </div>
            </li>
          ))}
          {filteredMessages.length === 0 && (
            <li className="card px-4 py-10 text-center text-sm muted">No messages here.</li>
          )}
        </ul>
      )}
    </section>
  );
}
