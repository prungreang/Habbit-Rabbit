"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, CalendarDays, House, ListTodo, Menu, ShieldCheck, UserRound, X } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationsBell } from "./NotificationsBell";
import type { Notification, Role } from "@/lib/types";

const LINKS = [
  { href: "/today", label: "Today", icon: ListTodo },
  { href: "/week", label: "Week", icon: CalendarDays },
  { href: "/insights", label: "Insights", icon: BarChart3 },
];

export function NavBar({
  notifications = [],
  role = "user",
}: {
  notifications?: Notification[];
  role?: Role;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const staff = role === "admin" || role === "moderator";

  const links = [
    ...LINKS,
    ...(staff ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[rgb(var(--line))] bg-[rgb(var(--page))]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-rabbit-primary/15 text-[rgb(var(--ink))] shadow-[inset_0_0_0_1px_rgba(232,121,249,.35)]"
                    : "text-[rgb(var(--ink-muted))] hover:bg-rabbit-primary/10 hover:text-[rgb(var(--ink))]"
                }`}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <NotificationsBell initial={notifications} />
          <ThemeToggle />
          <Link href="/profile" className="btn-ghost hidden px-3 sm:inline-flex">
            Profile
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgb(var(--line))] md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="animate-fade-up border-t border-[rgb(var(--line))] px-4 pb-4 pt-2 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {[...links, { href: "/", label: "Home", icon: House }, { href: "/profile", label: "Profile", icon: UserRound }].map(
              ({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[rgb(var(--ink))] transition-colors hover:bg-rabbit-primary/10"
                  >
                    <Icon aria-hidden="true" className="h-4 w-4 text-rabbit-primary" />
                    {label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
