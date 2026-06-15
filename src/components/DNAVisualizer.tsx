"use client";

import { type WalletAnalysis } from "@/lib/analyzer";

interface Props {
  analysis: WalletAnalysis;
}

/** Primary accent color per archetype index (matches DNACard) */
const ARCHETYPE_ACCENT: Record<number, string> = {
  0: "#f97316", // DeFi Degen — orange
  1: "#06b6d4", // Diamond Hands — cyan
  2: "#a855f7", // NFT Collector — purple
  3: "#22c55e", // Yield Farmer — green
  4: "#10b981", // Newcomer — emerald
  5: "#3b82f6", // Whale — blue
  6: "#eab308", // Trader — yellow
};

/** Full palette per archetype, derived from the accent */
const TRAIT_COLORS: Record<number, string[]> = {
  0: ["#f97316", "#fb923c", "#fdba74", "#c2410c", "#ea580c", "#fed7aa"], // DeFi Degen - oranges
  1: ["#06b6d4", "#22d3ee", "#67e8f9", "#0891b2", "#0e7490", "#a5f3fc"], // Diamond Hands - cyans
  2: ["#a855f7", "#c084fc", "#d8b4fe", "#9333ea", "#7e22ce", "#e9d5ff"], // NFT Collector - purples
  3: ["#22c55e", "#4ade80", "#86efac", "#16a34a", "#15803d", "#bbf7d0"], // Yield Farmer - greens
  4: ["#10b981", "#34d399", "#6ee7b7", "#059669", "#047857", "#a7f3d0"], // Newcomer - emeralds
  5: ["#3b82f6", "#60a5fa", "#93c5fd", "#2563eb", "#1d4ed8", "#bfdbfe"], // Whale - blues
  6: ["#eab308", "#facc15", "#fde047", "#ca8a04", "#a16207", "#fef08a"], // Trader - yellows
};

export function DNAVisualizer({ analysis }: Props) {
  const accentColor = ARCHETYPE_ACCENT[analysis.archetype] ?? "#10b981";
  const colors = TRAIT_COLORS[analysis.archetype] || TRAIT_COLORS[0];
  const strands = generateStrands(analysis, colors);

  // Each node gets a unique animation-delay so they pulse in a wave
  const pulseBase = 0.8; // seconds per cycle

  return (
    <div
      className="p-6 rounded-2xl bg-gray-900/60 space-y-5 relative overflow-hidden"
      style={{
        border: "1px solid transparent",
        boxShadow: `0 0 0 1px ${accentColor}40, 0 4px 32px ${accentColor}18`,
        background: `linear-gradient(#111827cc, #111827cc) padding-box,
                     linear-gradient(135deg, ${accentColor}60, transparent 50%, ${accentColor}30) border-box`,
      }}
    >
      {/* Subtle top-edge glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}80, transparent)` }}
      />

      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">DNA Sequence</div>
        <div className="text-lg font-bold text-white">Visual Genome</div>
      </div>

      {/* DNA Helix SVG */}
      <div className="flex justify-center">
        <svg width="220" height="280" viewBox="0 0 220 280" className="overflow-visible">
          <defs>
            <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {strands.map((strand, i) => {
            const delayLeft = ((i * 2) / (strands.length * 2)) * pulseBase;
            const delayRight = ((i * 2 + 1) / (strands.length * 2)) * pulseBase;
            // Base pairs: A-T and C-G from address nibbles
            const hex = analysis.address.toLowerCase().replace("0x", "");
            const nibble = parseInt(hex[i % hex.length] || "0", 16);
            const PAIR_LABELS = [["A", "T"], ["T", "A"], ["C", "G"], ["G", "C"]];
            const [leftBase, rightBase] = PAIR_LABELS[nibble % 4];
            const showLabel = strand.opacity > 0.65; // only label prominent nodes
            return (
              <g key={i}>
                {/* Rung */}
                <line
                  x1={strand.leftX}
                  y1={strand.y}
                  x2={strand.rightX}
                  y2={strand.y}
                  stroke={strand.color}
                  strokeWidth={1.5}
                  opacity={strand.opacity * 0.4}
                />

                {/* Left node */}
                <circle
                  cx={strand.leftX}
                  cy={strand.y}
                  r={5.5}
                  fill={strand.color}
                  opacity={strand.opacity}
                  filter="url(#nodeGlow)"
                  style={{ animation: `helixPulse ${pulseBase}s ease-in-out ${delayLeft.toFixed(3)}s infinite` }}
                />
                {showLabel && (
                  <text
                    x={strand.leftX - 11}
                    y={strand.y + 3.5}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="700"
                    fill={strand.color}
                    opacity={strand.opacity * 0.8}
                    fontFamily="monospace"
                  >
                    {leftBase}
                  </text>
                )}

                {/* Right node */}
                <circle
                  cx={strand.rightX}
                  cy={strand.y}
                  r={5.5}
                  fill={strand.color}
                  opacity={strand.opacity}
                  filter="url(#nodeGlow)"
                  style={{ animation: `helixPulse ${pulseBase}s ease-in-out ${delayRight.toFixed(3)}s infinite` }}
                />
                {showLabel && (
                  <text
                    x={strand.rightX + 11}
                    y={strand.y + 3.5}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="700"
                    fill={strand.color}
                    opacity={strand.opacity * 0.8}
                    fontFamily="monospace"
                  >
                    {rightBase}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Radar Chart */}
      <div className="space-y-2">
        <div className="text-xs text-gray-500 uppercase tracking-wider">Trait Radar</div>
        <RadarChart analysis={analysis} accentColor={accentColor} />
      </div>

      {/* DNA Sequence Code */}
      <div className="space-y-1.5">
        <div className="text-xs text-gray-600 uppercase tracking-wider">Sequence ID</div>
        <div
          className="font-mono text-xs leading-relaxed break-all"
          style={{ color: `${accentColor}80` }}
        >
          {generateDNACode(analysis.address)}
        </div>
      </div>

      {/* Timestamp */}
      <div className="text-xs text-gray-600 text-center">
        Analyzed {new Date(analysis.analyzedAt * 1000).toLocaleString()}
      </div>

      {/* Keyframe for node pulse */}
      <style>{`
        @keyframes helixPulse {
          0%, 100% { r: 5.5; opacity: var(--base-opacity, 0.8); }
          50% { r: 7.5; opacity: 1; }
        }
      `}</style>
    </div>
  );
}

interface Strand {
  y: number;
  leftX: number;
  rightX: number;
  color: string;
  opacity: number;
}

function generateStrands(analysis: WalletAnalysis, colors: string[]): Strand[] {
  const strands: Strand[] = [];
  const count = 20;
  const centerX = 100;
  const amplitude = 60;

  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 4;
    const y = 20 + i * (240 / count);
    const sinVal = Math.sin(t);
    const leftX = centerX + sinVal * amplitude;
    const rightX = centerX - sinVal * amplitude;
    const colorIndex = Math.floor((i / count) * colors.length) % colors.length;
    const opacity = 0.45 + 0.55 * Math.abs(sinVal);

    strands.push({ y, leftX, rightX, color: colors[colorIndex], opacity });
  }
  return strands;
}

function generateDNACode(address: string): string {
  const hex = address.toLowerCase().replace("0x", "");
  const bases = ["A", "T", "C", "G"];
  let code = "";
  for (let i = 0; i < 32; i++) {
    const nibble = parseInt(hex[i % hex.length], 16);
    code += bases[nibble % 4];
    if ((i + 1) % 8 === 0 && i < 31) code += " ";
  }
  return code;
}

function RadarChart({ analysis, accentColor }: { analysis: WalletAnalysis; accentColor: string }) {
  const cx = 110;
  const cy = 110;
  const r = 80;

  const scores = [
    { label: "DeFi", value: analysis.deFiScore / 1000, angle: -90 },
    { label: "Activity", value: analysis.activityScore / 1000, angle: 0 },
    { label: "HODLing", value: analysis.holdScore / 1000, angle: 90 },
    { label: "Diversity", value: analysis.diversityScore / 1000, angle: 180 },
  ];

  const toXY = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];

  const polygonPoints = (level: number) =>
    scores.map((s) => toXY(s.angle, r * level)).map((p) => `${p.x},${p.y}`).join(" ");

  const dataPoints = scores.map((s) => toXY(s.angle, r * s.value)).map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex justify-center">
      <svg width="220" height="220" viewBox="0 0 220 220">
        {/* Grid polygons */}
        {gridLevels.map((level) => (
          <polygon
            key={level}
            points={polygonPoints(level)}
            fill="none"
            stroke={`${accentColor}20`}
            strokeWidth={1}
          />
        ))}

        {/* Axis lines */}
        {scores.map((s) => {
          const end = toXY(s.angle, r);
          return (
            <line
              key={s.label}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              stroke={`${accentColor}25`}
              strokeWidth={1}
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={dataPoints}
          fill={`${accentColor}25`}
          stroke={accentColor}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Data points */}
        {scores.map((s) => {
          const pt = toXY(s.angle, r * s.value);
          return (
            <circle
              key={s.label}
              cx={pt.x}
              cy={pt.y}
              r={4}
              fill={accentColor}
              style={{ filter: `drop-shadow(0 0 4px ${accentColor})` }}
            />
          );
        })}

        {/* Axis labels */}
        {scores.map((s) => {
          const labelR = r + 18;
          const pt = toXY(s.angle, labelR);
          const pct = Math.round(s.value * 100);
          return (
            <g key={s.label}>
              <text
                x={pt.x}
                y={pt.y - 4}
                textAnchor="middle"
                fontSize="9"
                fill="#6b7280"
                fontFamily="system-ui"
              >
                {s.label}
              </text>
              <text
                x={pt.x}
                y={pt.y + 8}
                textAnchor="middle"
                fontSize="9"
                fontWeight="600"
                fill={accentColor}
                fontFamily="system-ui"
              >
                {pct}%
              </text>
            </g>
          );
        })}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={3} fill={`${accentColor}60`} />
      </svg>
    </div>
  );
}
