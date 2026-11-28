"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { Rabbit } from "@/components/Rabbit";
import { useToast } from "@/components/ToastProvider";

export function SignInCard({ next = "/today", configured }: { next?: string; configured: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [working, setWorking] = useState(false);

  async function continueLocally() {
    setWorking(true);
    const res = await fetch("/api/auth/demo", { method: "POST" });
    setWorking(false);
    if (!res.ok) {
      toast({ kind: "error", title: "Couldn't start a session", description: "Please try again." });
      return;
    }
    toast({ kind: "success", title: "Welcome in 🐰", description: "Your sample habits are ready to play with." });
    startTransition(() => {
      router.push(next);
      router.refresh();
    });
  }

  return (
    <div className="card w-full max-w-md p-6 sm:p-8">
      <div className="flex flex-col items-center text-center">
        <Rabbit mood="happy" size={96} className="animate-float-slow" />
        <h1 className="mt-3 text-2xl font-extrabold">Welcome back</h1>
        <p className="mt-1.5 text-sm muted">
          Sign in to pick up your habits. No streak will ever be broken here — there aren&apos;t any.
        </p>
      </div>

      <div className="mt-6 space-y-2.5">
        {configured ? (
          <a
            href={`/auth/callback?next=${encodeURIComponent(next)}`}
            className="btn-secondary w-full py-3"
          >
            <GoogleMark />
            Continue with Google
          </a>
        ) : (
          <>
            <button type="button" className="btn-secondary w-full py-3" disabled aria-describedby="google-hint">
              <GoogleMark />
              Continue with Google
            </button>
            <p id="google-hint" className="rounded-xl bg-rabbit-accent/15 px-3 py-2 text-xs leading-relaxed text-amber-800 dark:text-rabbit-accent">
              Google sign-in switches on as soon as this app is connected to a Supabase project — set
              <code className="mx-1 rounded bg-black/5 px-1 py-0.5 font-mono text-[11px] dark:bg-white/10">NEXT_PUBLIC_SUPABASE_URL</code>
              and enable the Google provider. See <span className="font-semibold">README.md</span>.
            </p>
            <button type="button" onClick={continueLocally} className="btn-primary w-full py-3" disabled={working || pending}>
              {working || pending ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <ArrowRight aria-hidden="true" className="h-4 w-4" />}
              Continue without an account
            </button>
            <p className="text-center text-xs muted">
              Local demo — everything stays on this computer.
            </p>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed muted">
        By continuing you agree to be treated kindly. Questions?{" "}
        <Link href="/contact" className="font-semibold text-rabbit-secondary underline-offset-2 hover:underline">
          Say hello
        </Link>
        .
      </p>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2a7 7 0 0 1-6.6-4.8h-4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.5a7.2 7.2 0 0 1 0-4.9V6.5h-4a12 12 0 0 0 0 11z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.5l4 3.1A7 7 0 0 1 12 4.8z" />
    </svg>
  );
}
