/** Gentle, factual summary — encouraging but never overstated. */
export function summarise(completed: number, planned: number, bestDay: string | null): string {
  if (planned === 0) {
    return "A quiet week with nothing planned, which is allowed. Whenever you're ready, one small habit is plenty to start with.";
  }
  const ratio = completed / planned;
  const dayLine = bestDay ? ` Your steadiest day was ${bestDay}.` : "";
  if (completed === 0) {
    return `Nothing was checked off this week, and that's okay — weeks like this happen to everyone. The habits are still there, waiting without judgement. Start again with the smallest one when it feels right.`;
  }
  if (ratio >= 0.8) {
    return `You checked off ${completed} of ${planned} planned moments this week — that's most of them.${dayLine} You clearly made room for yourself.`;
  }
  if (ratio >= 0.4) {
    return `You checked off ${completed} of ${planned} planned moments this week — a solid, steady effort.${dayLine} Showing up some of the time is how habits actually take root.`;
  }
  return `You checked off ${completed} of ${planned} planned moments this week. Small as it sounds, that's ${completed} time${completed === 1 ? "" : "s"} you made a caring choice for yourself.${dayLine}`;
}

