import Link from "next/link";
import { Rabbit } from "./Rabbit";

export function Logo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-2xl px-1 py-1 transition-colors hover:bg-rabbit-primary/10"
      aria-label="Habit Rabbit — home"
    >
      <span className="transition-transform duration-300 group-hover:-rotate-6">
        <Rabbit size={compact ? 30 : 36} mood="happy" />
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight text-[rgb(var(--ink))]">
        Habit <span className="bg-gradient-to-r from-rabbit-primary to-rabbit-secondary bg-clip-text text-transparent">Rabbit</span>
      </span>
    </Link>
  );
}
