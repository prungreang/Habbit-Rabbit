"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Rabbit } from "@/components/Rabbit";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Umami custom event — cheap, privacy-friendly, and only an event name is sent.
    const umami = (window as unknown as { umami?: { track: (e: string, d?: Record<string, unknown>) => void } }).umami;
    umami?.track("app_error", { digest: error.digest ?? "none" });
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <Rabbit mood="sleepy" size={130} className="animate-float-slow" />
      <p className="mt-4 font-display text-5xl font-extrabold tracking-tight text-rabbit-secondary">500</p>
      <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">The rabbit tripped over a carrot</h1>
      <p className="mt-2 max-w-md text-sm muted">
        Something went wrong on our side, not yours. Your habits are safe. Try again in a moment.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/today" className="btn-secondary">
          Back to today
        </Link>
      </div>
    </div>
  );
}
