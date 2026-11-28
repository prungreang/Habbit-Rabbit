"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgb(var(--line))]
        text-[rgb(var(--ink))] transition-all duration-300 hover:border-rabbit-primary/60 hover:bg-rabbit-primary/10 ${className}`}
    >
      <Sun
        aria-hidden="true"
        className={`absolute h-5 w-5 transition-all duration-300 ${isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`}
      />
      <Moon
        aria-hidden="true"
        className={`absolute h-5 w-5 transition-all duration-300 ${isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"}`}
      />
    </button>
  );
}
