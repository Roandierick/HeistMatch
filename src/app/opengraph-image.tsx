import { ImageResponse } from "next/og";

export const alt = "HeistMatch · GTA 6 Heist Finder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(70% 60% at 50% 0%, rgba(232,184,74,0.16), #08090c 70%)",
          color: "#eceef2",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 40, fontWeight: 700 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#14171e", border: "2px solid #2a2f3a", display: "flex", alignItems: "center", justifyContent: "center", color: "#e8b84a", fontSize: 34 }}>
            H
          </div>
          <span>
            Heist<span style={{ color: "#e8b84a" }}>Match</span>
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: -2 }}>GTA 6 Heist Finder</div>
          <div style={{ fontSize: 36, color: "#9aa1ad" }}>Find your crew. Run the heist.</div>
        </div>
        <div style={{ fontSize: 22, color: "#6b7280" }}>Independent platform · not affiliated with Rockstar Games</div>
      </div>
    ),
    size,
  );
}
