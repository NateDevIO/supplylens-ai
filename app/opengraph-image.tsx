import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SupplyLens AI - Supply Chain Intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a1628 0%, #111d35 50%, #1a2744 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 80,
            height: 80,
            background: "#3b82f6",
            borderRadius: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            fontWeight: 700,
            color: "white",
            marginBottom: 24,
            boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
          }}
        >
          SL
        </div>

        {/* Title */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontSize: 56, fontWeight: 700, color: "white" }}>
            SupplyLens
          </span>
          <span style={{ fontSize: 56, fontWeight: 700, color: "#60a5fa" }}>
            AI
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 20,
            color: "#94a3b8",
            letterSpacing: 6,
            textTransform: "uppercase" as const,
            marginTop: 12,
          }}
        >
          Supply Chain Intelligence
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 22,
            color: "#cbd5e1",
            marginTop: 32,
            maxWidth: 700,
            textAlign: "center" as const,
            lineHeight: 1.5,
          }}
        >
          AI-powered disruption scenario planning for enterprise logistics
        </div>

        {/* Tech badges */}
        <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
          {["Next.js", "Claude AI", "Leaflet", "Recharts"].map((tech) => (
            <div
              key={tech}
              style={{
                padding: "8px 16px",
                background: "rgba(255,255,255,0.08)",
                borderRadius: 8,
                fontSize: 14,
                color: "#94a3b8",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
