import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        rabbit: {
          primary: "#E879F9",
          secondary: "#38BDF8",
          accent: "#FBBF24",
          bg: "#FDF4FF",
          ink: "#1E1B4B",
          // soft surfaces tuned for light mode
          card: "#FFFFFF",
          muted: "#6B6790",
        },
        night: {
          bg: "#14102B",
          card: "#1E1840",
          line: "#2E2657",
          ink: "#F5F0FF",
          muted: "#B9B2E0",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      borderRadius: { blob: "2rem" },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(30, 27, 75, 0.18)",
        glow: "0 0 0 4px rgba(232, 121, 249, 0.18)",
      },
      keyframes: {
        "hop-in": {
          "0%": { transform: "translateY(10px) scale(.96)", opacity: "0" },
          "60%": { transform: "translateY(-3px) scale(1.02)", opacity: "1" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        "pop-check": {
          "0%": { transform: "scale(1)" },
          "45%": { transform: "scale(1.18) rotate(-6deg)" },
          "100%": { transform: "scale(1) rotate(0)" },
        },
        "float-slow": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "wiggle": {
          "0%,100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "hop-in": "hop-in .45s cubic-bezier(.34,1.56,.64,1) both",
        "pop-check": "pop-check .4s ease-out",
        "float-slow": "float-slow 4s ease-in-out infinite",
        wiggle: "wiggle 1.6s ease-in-out infinite",
        "fade-up": "fade-up .5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
