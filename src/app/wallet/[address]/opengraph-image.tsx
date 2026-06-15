import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ARCHETYPES = [
  { name: "DeFi Degen", emoji: "🔥", color: "#f97316" },
  { name: "Diamond Hands", emoji: "💎", color: "#06b6d4" },
  { name: "NFT Collector", emoji: "🎨", color: "#a855f7" },
  { name: "Yield Farmer", emoji: "🌾", color: "#22c55e" },
  { name: "Newcomer", emoji: "🌱", color: "#10b981" },
  { name: "Whale", emoji: "🐋", color: "#3b82f6" },
  { name: "Trader", emoji: "📊", color: "#eab308" },
];

function computeArchetype(address: string) {
  const bytes = address.toLowerCase().replace("0x", "");
  const seed = (i: number) => parseInt(bytes.slice(i * 2, i * 2 + 4), 16) || 0;

  const deFiScore = seed(1) % 1000;
  const holdScore = seed(2) % 1000;
  const diversityScore = seed(3) % 1000;
  const activityScore = seed(4) % 1000;
  const txCount = Math.floor(seed(5) / 10);

  let archetype: number;
  if (txCount < 5) archetype = 4;
  else if (deFiScore > 800) archetype = 0;
  else if (holdScore > 800) archetype = 1;
  else if (diversityScore > 700 && deFiScore > 500) archetype = 3;
  else if (activityScore > 750) archetype = 6;
  else archetype = 2;

  const totalPct = Math.round((deFiScore + holdScore + diversityScore + activityScore) / 40);

  const bases = ["A", "T", "C", "G"];
  let dnaSeq = "";
  for (let i = 0; i < 24; i++) {
    const nibble = parseInt(bytes[i % bytes.length], 16) || 0;
    dnaSeq += bases[nibble % 4];
    if ((i + 1) % 8 === 0 && i < 23) dnaSeq += " ";
  }

  return { archetype, deFiScore, holdScore, diversityScore, activityScore, totalPct, dnaSeq };
}

export default function OGImage({ params }: { params: { address: string } }) {
  const { address } = params;
  const { archetype: archetypeIdx, deFiScore, holdScore, diversityScore, activityScore, totalPct, dnaSeq } =
    computeArchetype(address);
  const archetype = ARCHETYPES[archetypeIdx] ?? ARCHETYPES[4];
  const { name, emoji, color } = archetype;
  const shortAddr = `${address.slice(0, 10)}...${address.slice(-8)}`;

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
        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            width: "700px",
            height: "500px",
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${color}22 0%, transparent 70%)`,
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
        {/* Top accent */}
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px", zIndex: 1 }}>
          <div style={{ fontSize: "88px", lineHeight: 1 }}>{emoji}</div>
          <div style={{ fontSize: "13px", color: color, textTransform: "uppercase", letterSpacing: "5px" }}>
            DNA Archetype
          </div>
          <div style={{ fontSize: "76px", fontWeight: 900, color: "white", letterSpacing: "-3px", lineHeight: 1 }}>
            {name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ fontSize: "17px", color: "#4b5563", fontFamily: "monospace" }}>{shortAddr}</div>
            <div style={{
              fontSize: "12px",
              padding: "3px 10px",
              borderRadius: "999px",
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.4)",
              color: "#10b981",
              display: "flex",
            }}>
              🟢 Mantle Network
            </div>
          </div>

          {/* DNA Strength bar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>DNA Strength</span>
              <span style={{ fontSize: "13px", color: color, fontWeight: 700 }}>{totalPct}%</span>
            </div>
            <div style={{ width: "100%", height: "8px", background: "#1f2937", borderRadius: "999px", display: "flex" }}>
              <div style={{ width: `${totalPct}%`, height: "100%", background: `linear-gradient(90deg, ${color}aa, ${color})`, borderRadius: "999px", display: "flex" }} />
            </div>
          </div>

          {/* Scores */}
          <div style={{ display: "flex", gap: "44px", marginTop: "4px" }}>
            {[
              { label: "DeFi", value: deFiScore },
              { label: "HODLing", value: holdScore },
              { label: "Diversity", value: diversityScore },
              { label: "Activity", value: activityScore },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div style={{ fontSize: "30px", fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* DNA sequence */}
        <div style={{ position: "absolute", bottom: "68px", fontFamily: "monospace", fontSize: "13px", letterSpacing: "3px", color: `${color}50` }}>
          {dnaSeq}
        </div>

        {/* Branding */}
        <div style={{ position: "absolute", bottom: "36px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🧬</span>
          <span style={{ fontSize: "15px", color: "#4b5563" }}>mantle-dna.xyz · Mantle Turing Test Hackathon</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
