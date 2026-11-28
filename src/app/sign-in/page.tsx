import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase";
import { SignInCard } from "@/components/app/SignInCard";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Habit Rabbit with Google, or try the local demo. Your habits, no pressure.",
};

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/today");
  const { next } = await searchParams;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <ThemeToggle />
      </header>
      <main id="main" className="flex flex-1 items-center justify-center px-4 pb-16 sm:px-6">
        <SignInCard next={next && next.startsWith("/") ? next : "/today"} configured={isSupabaseConfigured()} />
      </main>
    </div>
  );
}
