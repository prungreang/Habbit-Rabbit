"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Rabbit } from "./Rabbit";

/**
 * The celebration. Deliberately small, warm and dismissible — no confetti cannons,
 * no score popups, nothing that implies a streak is at stake.
 */
export function Celebration({ message, onDone }: { message: string | null; onDone: () => void }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!message) return;
    setShown(true);
    const t = window.setTimeout(() => {
      setShown(false);
      onDone();
    }, 2600);
    return () => window.clearTimeout(t);
  }, [message, onDone]);

  const sparkles = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        left: 12 + i * 12,
        delay: i * 0.07,
        size: 8 + ((i * 5) % 9),
      })),
    [],
  );

  if (!message || !shown) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center p-6"
    >
      <div className="absolute inset-0 bg-[#1E1B4B]/10 backdrop-blur-[2px] dark:bg-black/30" />
      <div className="relative animate-hop-in">
        {sparkles.map((s, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="absolute animate-float-slow text-rabbit-accent"
            style={{
              left: `${s.left}%`,
              top: `${-20 + (i % 3) * 70}%`,
              animationDelay: `${s.delay}s`,
              fontSize: s.size + 6,
            }}
          >
            ✦
          </span>
        ))}
        <div className="card relative flex max-w-xs flex-col items-center gap-2 px-8 py-7 text-center">
          <Rabbit mood="cheer" size={96} className="animate-float-slow" />
          <p className="font-display text-lg font-extrabold leading-tight">{message}</p>
          <p className="flex items-center gap-1 text-xs font-semibold text-rabbit-primary">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
            That counts. Truly.
          </p>
        </div>
      </div>
    </div>
  );
}
