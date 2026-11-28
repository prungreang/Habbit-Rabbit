export function PageSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your habits…</span>
      <div className="skeleton h-4 w-32" />
      <div className="skeleton mt-3 h-9 w-64" />
      <div className="skeleton mt-6 h-24 w-full rounded-3xl" />
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton h-16 w-full rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
