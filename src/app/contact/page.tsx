import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ContactForm } from "@/components/app/ContactForm";
import { Rabbit } from "@/components/Rabbit";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions, ideas or a hello — the Habit Rabbit humans read every message.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <Link href="/" className="btn-ghost hidden sm:inline-flex">
            Home
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-4 pb-20 pt-6 sm:px-6">
        <div className="flex items-center gap-4">
          <Rabbit mood="happy" size={72} className="shrink-0 animate-float-slow" />
          <div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">Say hello</h1>
            <p className="mt-1 text-sm muted">
              Ideas, bugs, or something that felt off — we read everything and reply like people.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <ContactForm />
        </div>

        <p className="mt-4 text-xs muted">
          We never sell your details, and we won&apos;t add you to a mailing list you didn&apos;t ask for.
        </p>
      </main>
    </div>
  );
}
