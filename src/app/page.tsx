import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  Heart,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Rabbit } from "@/components/Rabbit";
import { getSession } from "@/lib/data";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const FEATURES = [
  {
    icon: Check,
    title: "Daily to-dos you own",
    body: "Add, edit, delete and check things off. Nothing is scored, nothing accumulates against you.",
  },
  {
    icon: CalendarDays,
    title: "A week you can change",
    body: "See the whole week in one grid. Tick a day you forgot. Un-tick a day you misjudged. Both fine.",
  },
  {
    icon: BarChart3,
    title: "Reports you ask for",
    body: "A weekly summary that's honest about numbers and kind about the person. Private unless you share.",
  },
  {
    icon: Search,
    title: "Find anything fast",
    body: "Search your habits in a keystroke, and export any week as a CSV whenever you want your data.",
  },
  {
    icon: UserRound,
    title: "Your profile, your choices",
    body: "Name, time zone, reminders, sharing — every switch is off by default and yours to flip.",
  },
  {
    icon: ShieldCheck,
    title: "Safe by design",
    body: "Row-level security, role-based staff access, no public profiles. Only counts, never content, for admins.",
  },
];

const NO_LIST = ["No streak counters", "No leaderboards", "No red \"you missed it\"", "No guilt notifications"];

export default async function HomePage() {
  const session = await getSession();
  const startHref = session ? "/today" : "/sign-in";

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-50 border-b border-transparent bg-[rgb(var(--page))]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav aria-label="Site" className="flex items-center gap-1 sm:gap-2">
            <Link href="/contact" className="btn-ghost hidden sm:inline-flex">
              Contact
            </Link>
            <ThemeToggle />
            <Link href={startHref} className="btn-primary">
              {session ? "Open app" : "Get started"}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="chip bg-rabbit-primary/12 text-rabbit-primary">
                <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                A habit tracker with no streak to lose
              </span>
              <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Small wins.
                <br />
                <span className="bg-gradient-to-r from-rabbit-primary via-purple-400 to-rabbit-secondary bg-clip-text text-transparent">
                  Zero pressure.
                </span>
              </h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed muted sm:text-lg">
                Habit Rabbit is a gentle home for the tiny things you&apos;d like to do more of. Check one off and
                something celebrates with you. Miss a day and nothing at all happens — that&apos;s the whole point.
              </p>

              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                <Link href={startHref} className="btn-primary px-6 py-3 text-base">
                  Start tracking — it&apos;s free
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <Link href="/sign-in" className="btn-secondary px-6 py-3 text-base">
                  See the demo
                </Link>
              </div>

              <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5">
                {NO_LIST.map((item) => (
                  <li key={item} className="flex items-center gap-1.5 text-xs font-semibold muted">
                    <span aria-hidden="true" className="text-rabbit-primary">
                      ✕
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute inset-0 -z-10 scale-105 rounded-[3rem] bg-gradient-to-br from-rabbit-primary/25 via-rabbit-secondary/20 to-rabbit-accent/25 blur-2xl" />
              <div className="card overflow-hidden p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-rabbit-primary">Tuesday</p>
                    <p className="font-display text-xl font-extrabold">Hi Bunny 🐰</p>
                  </div>
                  <Rabbit mood="cheer" size={54} />
                </div>
                <p className="mt-1 text-xs muted">One is a real win. That&apos;s genuinely enough for today.</p>
                <ul className="mt-4 space-y-2">
                  {[
                    { emoji: "💧", title: "Drink a glass of water", done: true },
                    { emoji: "🌿", title: "Ten minute walk outside", done: true },
                    { emoji: "📚", title: "Read two pages", done: false },
                    { emoji: "🧺", title: "Tidy one small surface", done: false },
                  ].map((task) => (
                    <li
                      key={task.title}
                      className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 ${
                        task.done
                          ? "border-[rgb(var(--line))] opacity-75"
                          : "border-rabbit-primary/35"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`grid h-8 w-8 place-items-center rounded-xl ${
                          task.done
                            ? "bg-gradient-to-br from-rabbit-primary to-rabbit-secondary text-white"
                            : "border border-dashed border-[rgb(var(--line))] bg-rabbit-primary/10"
                        }`}
                      >
                        {task.done ? <Check className="h-4 w-4" strokeWidth={3} /> : task.emoji}
                      </span>
                      <span className={`text-sm font-semibold ${task.done ? "line-through decoration-rabbit-primary/60" : ""}`}>
                        {task.title}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-rabbit-accent/15 px-3 py-2">
                  <Sparkles aria-hidden="true" className="h-4 w-4 shrink-0 text-rabbit-accent" />
                  <p className="text-[11px] font-semibold text-amber-800 dark:text-rabbit-accent">
                    Two checked off. That counts. Truly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section aria-labelledby="features-heading" className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
          <h2 id="features-heading" className="text-2xl font-extrabold sm:text-3xl">
            Everything you need. Nothing that nags.
          </h2>
          <p className="mt-2 max-w-2xl text-sm muted sm:text-base">
            Built for people who have tried the streak apps and quietly quit. Every feature here assumes you&apos;re
            doing your best.
          </p>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="card group p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
              >
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rabbit-primary/12 text-rabbit-primary transition-transform duration-300 group-hover:scale-110">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-base font-extrabold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed muted">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Philosophy */}
        <section aria-labelledby="ethos-heading" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <div className="card overflow-hidden bg-gradient-to-br from-rabbit-primary/[.09] via-transparent to-rabbit-secondary/[.09] p-6 sm:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <h2 id="ethos-heading" className="text-2xl font-extrabold sm:text-3xl">
                  A safe space, on purpose
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed muted sm:text-base">
                  We removed the mechanics that make habit apps stressful. No streaks to protect, no XP, no ranks, no
                  public profiles. Just your days, and a rabbit that&apos;s glad you showed up.
                </p>
                <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {[
                    { icon: Heart, text: "Celebrates one check-off as much as ten" },
                    { icon: Lock, text: "Private by default, sharing is opt-in" },
                    { icon: ShieldCheck, text: "Role-based staff access, no habit snooping" },
                    { icon: BarChart3, text: "Reports only when you ask for one" },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-2.5 text-sm">
                      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-rabbit-primary" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center">
                <Rabbit mood="sleepy" size={180} className="animate-float-slow" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[rgb(var(--line))] px-4 py-8 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <Logo />
          <p className="text-xs muted">Made with care. No streaks were harmed.</p>
          <nav aria-label="Footer" className="flex gap-4 text-xs font-semibold muted">
            <Link href="/contact" className="transition-colors hover:text-rabbit-primary">
              Contact
            </Link>
            <Link href="/sign-in" className="transition-colors hover:text-rabbit-primary">
              Sign in
            </Link>
            <Link href="/today" className="transition-colors hover:text-rabbit-primary">
              Today
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
