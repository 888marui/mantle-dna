import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const ARCHETYPE_COLORS: Record<string, string> = {
  "0": "#f97316",  // DeFi Degen — orange
  "1": "#06b6d4",  // Diamond Hands — cyan
  "2": "#a855f7",  // NFT Collector — purple
  "3": "#22c55e",  // Yield Farmer — green
  "4": "#10b981",  // Newcomer — emerald
  "5": "#3b82f6",  // Whale — blue
  "6": "#eab308",  // Trader — yellow
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address") || "0x0000000000000000000000000000000000000000";
  const archetypeIndex = searchParams.get("archetype") || "4";
  const name = searchParams.get("name") || "Newcomer";
  const emoji = searchParams.get("emoji") || "🌱";
  const defi = searchParams.get("defi") || "0";
  const hodl = searchParams.get("hodl") || "0";
  const diversity = searchParams.get("diversity") || "0";
  const activity = searchParams.get("activity") || "0";

  const color = ARCHETYPE_COLORS[archetypeIndex] ?? "#10b981";
  const shortAddr = `${address.slice(0, 10)}...${address.slice(-8)}`;

  const totalPct = Math.round((Number(defi) + Number(hodl) + Number(diversity) + Number(activity)) / 40);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Radial glow background */}
        <div
          style={{
            position: "absolute",
            width: "700px",
            height: "500px",
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${color}20 0%, transparent 70%)`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
          }}
        />

        {/* Border frame */}
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: "24px",
            right: "24px",
            bottom: "24px",
            border: `1px solid ${color}40`,
            borderRadius: "24px",
            display: "flex",
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: "120px",
            right: "120px",
            height: "2px",
            background: `linear-gradient(90deg, transparent, ${color}90, transparent)`,
            display: "flex",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            zIndex: 1,
            padding: "0 60px",
          }}
        >
          {/* Emoji */}
          <div style={{ fontSize: "96px", lineHeight: 1 }}>{emoji}</div>

          {/* Label */}
          <div
            style={{
              fontSize: "14px",
              color: color,
              textTransform: "uppercase",
              letterSpacing: "5px",
            }}
          >
            DNA Archetype
          </div>

          {/* Archetype Name */}
          <div
            style={{
              fontSize: "80px",
              fontWeight: 900,
              color: "white",
              letterSpacing: "-3px",
              lineHeight: 1,
            }}
          >
            {name}
          </div>

          {/* Address */}
          <div style={{ fontSize: "18px", color: "#4b5563", fontFamily: "monospace" }}>
            {shortAddr}
          </div>

          {/* DNA Strength bar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "500px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <span style={{ fontSize: "14px", color: "#6b7280" }}>DNA Strength</span>
              <span style={{ fontSize: "14px", color: color, fontWeight: 700 }}>{totalPct}%</span>
            </div>
            <div style={{ width: "100%", height: "8px", background: "#1f2937", borderRadius: "999px", display: "flex" }}>
              <div
                style={{
                  width: `${totalPct}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${color}aa, ${color})`,
                  borderRadius: "999px",
                  display: "flex",
                }}
              />
            </div>
          </div>

          {/* Score grid */}
          <div style={{ display: "flex", gap: "48px", marginTop: "4px" }}>
            {[
              { label: "DeFi", value: defi },
              { label: "HODLing", value: hodl },
              { label: "Diversity", value: diversity },
              { label: "Activity", value: activity },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}
              >
                <div style={{ fontSize: "32px", fontWeight: 800, color: color }}>{value}</div>
                <div style={{ fontSize: "13px", color: "#6b7280" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "22px" }}>🧬</span>
          <span style={{ fontSize: "18px", color: "#4b5563" }}>mantle-dna.xyz</span>
          <span style={{ fontSize: "14px", color: "#374151", marginLeft: "8px" }}>• Mantle Network</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
