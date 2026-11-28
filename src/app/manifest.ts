import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Habit Rabbit",
    short_name: "HabitRabbit",
    description: "A kinder habit tracker. Small daily wins, no streaks to break.",
    start_url: "/today",
    display: "standalone",
    background_color: "#FDF4FF",
    theme_color: "#E879F9",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
