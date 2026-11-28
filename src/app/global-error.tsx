"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#FDF4FF",
          color: "#1E1B4B",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div>
          <p style={{ fontSize: 56, fontWeight: 800, color: "#E879F9", margin: 0 }}>500</p>
          <h1 style={{ fontSize: 22, margin: "8px 0" }}>The rabbit tripped over a carrot</h1>
          <p style={{ color: "#6B6790", fontSize: 14, maxWidth: 380 }}>Something went wrong on our side. Your habits are safe.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              borderRadius: 999,
              border: "none",
              padding: "12px 24px",
              background: "#E879F9",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
