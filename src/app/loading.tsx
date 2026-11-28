import { Rabbit } from "@/components/Rabbit";

export default function Loading() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3" role="status" aria-live="polite">
      <Rabbit mood="happy" size={96} className="animate-float-slow" />
      <p className="text-sm font-semibold muted">Hopping over…</p>
    </div>
  );
}
