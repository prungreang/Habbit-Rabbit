import { ImageResponse } from "next/og";

export const alt = "Habit Rabbit — a kinder habit tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: "linear-gradient(135deg,#FDF4FF 0%,#FCE7FE 45%,#E0F2FE 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 28,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 58,
              boxShadow: "0 12px 30px rgba(30,27,75,.14)",
            }}
          >
            🐰
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#E879F9", letterSpacing: -0.5 }}>Habit Rabbit</div>
        </div>

        <div
          style={{
            marginTop: 44,
            fontSize: 78,
            fontWeight: 800,
            color: "#1E1B4B",
            lineHeight: 1.05,
            letterSpacing: -2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Small wins.</span>
          <span>No streaks to break.</span>
        </div>

        <div style={{ marginTop: 28, fontSize: 30, color: "#6B6790", display: "flex", maxWidth: 880 }}>
          A gentle habit tracker with a weekly report you choose to see.
        </div>

        <div style={{ marginTop: 40, display: "flex", gap: 14 }}>
          {["Daily tasks", "Week view", "Kinder reporting"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                padding: "12px 24px",
                borderRadius: 999,
                background: "rgba(255,255,255,.85)",
                color: "#1E1B4B",
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
