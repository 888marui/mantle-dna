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

function seedFromAddress(address: string, i: number): number {
  const bytes = address.toLowerCase().replace("0x", "");
  return parseInt(bytes.slice(i * 2, i * 2 + 4), 16) || 0;
}

function computeFromAddress(address: string) {
  const s = (i: number) => seedFromAddress(address, i);
  const deFiScore = s(1) % 1000;
  const holdScore = s(2) % 1000;
  const diversityScore = s(3) % 1000;
  const activityScore = s(4) % 1000;
  const txCount = Math.floor(s(5) / 10);

  let archetype: number;
  if (txCount < 5) archetype = 4;
  else if (deFiScore > 800) archetype = 0;
  else if (holdScore > 800) archetype = 1;
  else if (diversityScore > 700 && deFiScore > 500) archetype = 3;
  else if (activityScore > 750) archetype = 6;
  else archetype = 2;

  return { deFiScore, holdScore, diversityScore, activityScore, archetype };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isLanding = searchParams.get("landing") === "true";

  // Landing page OG — show all archetypes as a grid
  if (isLanding) {
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
              width: "800px",
              height: "500px",
              borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(16,185,129,0.15) 0%, transparent 70%)",
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
              top: "20px",
              left: "20px",
              right: "20px",
              bottom: "20px",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: "24px",
              display: "flex",
            }}
          />
          {/* Top accent */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "120px",
              right: "120px",
              height: "2px",
              background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.8), transparent)",
              display: "flex",
            }}
          />
          {/* Main content */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", zIndex: 1, padding: "0 60px" }}>
            <div style={{ fontSize: "14px", color: "#10b981", textTransform: "uppercase", letterSpacing: "6px" }}>
              Mantle Network · AI-Powered
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "64px" }}>🧬</span>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "72px", fontWeight: 900, color: "white", letterSpacing: "-3px", lineHeight: 1 }}>
                  Mantle DNA
                </div>
                <div style={{ fontSize: "22px", color: "#6b7280", marginTop: "4px" }}>
                  Discover your on-chain identity
                </div>
              </div>
            </div>
            {/* Archetype emoji row */}
            <div style={{ display: "flex", gap: "20px", marginTop: "8px" }}>
              {ARCHETYPES.map((a) => (
                <div key={a.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "16px",
                      background: `${a.color}18`,
                      border: `1px solid ${a.color}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "36px",
                    }}
                  >
                    {a.emoji}
                  </div>
                  <div style={{ fontSize: "10px", color: a.color, fontWeight: 600 }}>{a.name.split(" ")[0]}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Bottom */}
          <div style={{ position: "absolute", bottom: "36px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "15px", color: "#4b5563" }}>7 archetypes · AI insights · Soulbound NFT · mantle-dna.xyz</span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const address = searchParams.get("address") || "0x0000000000000000000000000000000000000000";

  const computed = computeFromAddress(address);

  const archetypeIndex = Number(searchParams.get("archetype") ?? computed.archetype);
  const archetype = ARCHETYPES[archetypeIndex] ?? ARCHETYPES[4];
  const name = searchParams.get("name") || archetype.name;
  const emoji = searchParams.get("emoji") || archetype.emoji;
  const color = archetype.color;

  const defi = Number(searchParams.get("defi") ?? computed.deFiScore);
  const hodl = Number(searchParams.get("hodl") ?? computed.holdScore);
  const diversity = Number(searchParams.get("diversity") ?? computed.diversityScore);
  const activity = Number(searchParams.get("activity") ?? computed.activityScore);
  const network = searchParams.get("network") ?? "mainnet";
  const mantleScore = Number(searchParams.get("mantleScore") ?? 0);

  const isDownload = searchParams.get("download") === "1";
  const shortAddr = `${address.slice(0, 10)}...${address.slice(-8)}`;
  const totalPct = Math.round((defi + hodl + diversity + activity) / 40);

  // Generate ATCG DNA sequence from address (unique per wallet)
  const hex = address.toLowerCase().replace("0x", "");
  const bases = ["A", "T", "C", "G"];
  let dnaSequence = "";
  for (let i = 0; i < 24; i++) {
    const nibble = parseInt(hex[i % hex.length], 16) || 0;
    dnaSequence += bases[nibble % 4];
    if ((i + 1) % 8 === 0 && i < 23) dnaSequence += " ";
  }

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
            gap: "18px",
            zIndex: 1,
            padding: "0 60px",
          }}
        >
          <div style={{ fontSize: "88px", lineHeight: 1 }}>{emoji}</div>

          <div
            style={{
              fontSize: "13px",
              color: color,
              textTransform: "uppercase",
              letterSpacing: "5px",
            }}
          >
            DNA Archetype
          </div>

          <div
            style={{
              fontSize: "76px",
              fontWeight: 900,
              color: "white",
              letterSpacing: "-3px",
              lineHeight: 1,
            }}
          >
            {name}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ fontSize: "17px", color: "#4b5563", fontFamily: "monospace" }}>
              {shortAddr}
            </div>
            <div style={{
              fontSize: "12px",
              padding: "3px 10px",
              borderRadius: "999px",
              background: network === "mainnet" ? "rgba(16,185,129,0.15)" : "rgba(59,130,246,0.15)",
              border: `1px solid ${network === "mainnet" ? "rgba(16,185,129,0.4)" : "rgba(59,130,246,0.4)"}`,
              color: network === "mainnet" ? "#10b981" : "#3b82f6",
              display: "flex",
            }}>
              {network === "mainnet" ? "🟢 Mainnet" : "🔵 Sepolia"}
            </div>
            {mantleScore > 0 && (
              <div style={{
                fontSize: "12px",
                padding: "3px 10px",
                borderRadius: "999px",
                background: `${color}18`,
                border: `1px solid ${color}40`,
                color: color,
                display: "flex",
              }}>
                {mantleScore >= 80 ? "💜 Platinum" : mantleScore >= 60 ? "🏆 Gold" : mantleScore >= 30 ? "🥈 Silver" : "🥉 Bronze"} · {mantleScore}/100
              </div>
            )}
          </div>

          {/* DNA Strength bar */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              width: "480px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>DNA Strength</span>
              <span style={{ fontSize: "13px", color: color, fontWeight: 700 }}>{totalPct}%</span>
            </div>
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "#1f2937",
                borderRadius: "999px",
                display: "flex",
              }}
            >
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

          {/* Score row */}
          <div style={{ display: "flex", gap: "44px", marginTop: "4px" }}>
            {[
              { label: "DeFi", value: defi },
              { label: "HODLing", value: hodl },
              { label: "Diversity", value: diversity },
              { label: "Activity", value: activity },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <div style={{ fontSize: "30px", fontWeight: 800, color: color }}>{value}</div>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* DNA sequence */}
        <div
          style={{
            position: "absolute",
            bottom: "68px",
            fontFamily: "monospace",
            fontSize: "13px",
            letterSpacing: "3px",
            color: `${color}50`,
          }}
        >
          {dnaSequence}
        </div>

        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: "36px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "18px" }}>🧬</span>
          <span style={{ fontSize: "15px", color: "#4b5563" }}>mantle-dna.xyz</span>
          <span style={{ fontSize: "12px", color: "#374151", marginLeft: "8px" }}>
            • Mantle Network
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: isDownload ? {
        "Content-Disposition": `attachment; filename="mantle-dna-${archetype.name.toLowerCase().replace(/\s/g, "-")}-${address.slice(0, 8)}.png"`,
        "Content-Type": "image/png",
      } : undefined,
    }
  );
}
