"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#08090c", color: "#eceef2", fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 28 }}>HeistMatch is having trouble</h1>
          <p style={{ color: "#9aa1ad" }}>Please try again in a moment.</p>
          <button onClick={reset} style={{ marginTop: 16, padding: "10px 18px", borderRadius: 10, border: 0, background: "#e8b84a", color: "#1a1305", fontWeight: 600, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
