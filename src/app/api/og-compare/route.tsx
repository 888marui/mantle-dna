import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const ARCHETYPES = [
  { name: "DeFi Degen", emoji: "🔥", color: "#f97316" },
  { name: "Diamond Hands", emoji: "💎", color: "#06b6d4" },
  { name: "NFT Collector", emoji: "🎨", color: "#a855f7" },
  { name: "Yield Farmer", emoji: "🌾", color: "#22c55e" },
  { name: "Newcomer", emoji: "🌱", color: "#10b981" },
  { name: "Whale", emoji: "🐋", color: "#3b82f6" },
  { name: "Trader", emoji: "📊", color: "#eab308" },
];

// GET /api/og-compare?a=0x...&archetypeA=0&scoreA=65&b=0x...&archetypeB=1&scoreB=45&compat=70
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const addrA = searchParams.get("a") || "0x0000000000000000000000000000000000000001";
  const addrB = searchParams.get("b") || "0x0000000000000000000000000000000000000002";
  const archetypeAIdx = Number(searchParams.get("archetypeA") ?? 0);
  const archetypeBIdx = Number(searchParams.get("archetypeB") ?? 1);
  const scoreA = Number(searchParams.get("scoreA") ?? 0);
  const scoreB = Number(searchParams.get("scoreB") ?? 0);
  const compat = Number(searchParams.get("compat") ?? 65);
  const network = searchParams.get("network") ?? "mainnet";

  const atypeA = ARCHETYPES[archetypeAIdx] ?? ARCHETYPES[4];
  const atypeB = ARCHETYPES[archetypeBIdx] ?? ARCHETYPES[1];

  const compatColor = compat >= 75 ? "#22c55e" : compat >= 55 ? "#eab308" : "#f97316";
  const shortA = `${addrA.slice(0, 8)}...${addrA.slice(-6)}`;
  const shortB = `${addrB.slice(0, 8)}...${addrB.slice(-6)}`;

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
        {/* Dual radial glows */}
        <div style={{
          position: "absolute", width: "500px", height: "400px", borderRadius: "50%",
          background: `radial-gradient(ellipse, ${atypeA.color}18 0%, transparent 70%)`,
          top: "50%", left: "20%", transform: "translate(-50%, -50%)", display: "flex",
        }} />
        <div style={{
          position: "absolute", width: "500px", height: "400px", borderRadius: "50%",
          background: `radial-gradient(ellipse, ${atypeB.color}18 0%, transparent 70%)`,
          top: "50%", right: "20%", transform: "translate(50%, -50%)", display: "flex",
        }} />

        {/* Border frame */}
        <div style={{
          position: "absolute", top: "24px", left: "24px", right: "24px", bottom: "24px",
          border: "1px solid rgba(55,65,81,0.6)", borderRadius: "24px", display: "flex",
        }} />

        {/* Header */}
        <div style={{
          position: "absolute", top: "48px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
        }}>
          <div style={{ fontSize: "13px", color: "#4b5563", textTransform: "uppercase", letterSpacing: "4px" }}>
            🧬 Mantle DNA · Comparison
          </div>
        </div>

        {/* Main 3-column layout */}
        <div style={{ display: "flex", alignItems: "center", gap: "0px", width: "1100px", zIndex: 1 }}>
          {/* Wallet A */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
            padding: "32px 28px",
            borderRadius: "20px",
            background: `${atypeA.color}08`,
            border: `1px solid ${atypeA.color}30`,
          }}>
            <div style={{ fontSize: "72px", lineHeight: 1 }}>{atypeA.emoji}</div>
            <div style={{ fontSize: "11px", color: atypeA.color, textTransform: "uppercase", letterSpacing: "3px" }}>Wallet A</div>
            <div style={{ fontSize: "32px", fontWeight: 900, color: "white", letterSpacing: "-1px", lineHeight: 1, textAlign: "center" }}>
              {atypeA.name}
            </div>
            <div style={{ fontSize: "13px", color: "#6b7280", fontFamily: "monospace" }}>{shortA}</div>
            <div style={{
              fontSize: "13px", padding: "4px 12px", borderRadius: "999px",
              background: `${atypeA.color}18`, border: `1px solid ${atypeA.color}40`,
              color: atypeA.color, display: "flex",
            }}>
              {scoreA >= 80 ? "💜 Platinum" : scoreA >= 60 ? "🏆 Gold" : scoreA >= 30 ? "🥈 Silver" : "🥉 Bronze"} · {scoreA}/100
            </div>
          </div>

          {/* Center: Compatibility */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            padding: "0 40px",
            minWidth: "220px",
          }}>
            <div style={{ fontSize: "12px", color: "#4b5563", textTransform: "uppercase", letterSpacing: "3px" }}>
              Compatibility
            </div>
            <div style={{ fontSize: "80px", fontWeight: 900, color: compatColor, lineHeight: 1 }}>
              {compat}%
            </div>
            <div style={{ fontSize: "14px", color: compatColor }}>
              {compat >= 75 ? "Highly Compatible" : compat >= 55 ? "Moderately Compatible" : "Contrasting Profiles"}
            </div>
            <div style={{ fontSize: "11px", color: "#374151", padding: "3px 10px", borderRadius: "999px", background: "#1f2937", border: "1px solid #374151", display: "flex" }}>
              {network === "mainnet" ? "🟢 Mainnet" : "🔵 Sepolia"}
            </div>
            <div style={{ fontSize: "28px", color: "#374151" }}>⟵ vs ⟶</div>
          </div>

          {/* Wallet B */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
            padding: "32px 28px",
            borderRadius: "20px",
            background: `${atypeB.color}08`,
            border: `1px solid ${atypeB.color}30`,
          }}>
            <div style={{ fontSize: "72px", lineHeight: 1 }}>{atypeB.emoji}</div>
            <div style={{ fontSize: "11px", color: atypeB.color, textTransform: "uppercase", letterSpacing: "3px" }}>Wallet B</div>
            <div style={{ fontSize: "32px", fontWeight: 900, color: "white", letterSpacing: "-1px", lineHeight: 1, textAlign: "center" }}>
              {atypeB.name}
            </div>
            <div style={{ fontSize: "13px", color: "#6b7280", fontFamily: "monospace" }}>{shortB}</div>
            <div style={{
              fontSize: "13px", padding: "4px 12px", borderRadius: "999px",
              background: `${atypeB.color}18`, border: `1px solid ${atypeB.color}40`,
              color: atypeB.color, display: "flex",
            }}>
              {scoreB >= 80 ? "💜 Platinum" : scoreB >= 60 ? "🏆 Gold" : scoreB >= 30 ? "🥈 Silver" : "🥉 Bronze"} · {scoreB}/100
            </div>
          </div>
        </div>

        {/* Bottom branding */}
        <div style={{
          position: "absolute", bottom: "36px",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <span style={{ fontSize: "18px" }}>🧬</span>
          <span style={{ fontSize: "15px", color: "#4b5563" }}>mantle-dna.xyz · DNA Comparison</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
