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
        <svg width="200" height="280" viewBox="0 0 200 280" className="overflow-visible">
          <defs>
            {/* Radial glow filter for nodes */}
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
            return (
              <g key={i}>
                {/* Rung connecting the two nodes — rendered first so nodes sit on top */}
                <line
                  x1={strand.leftX}
                  y1={strand.y}
                  x2={strand.rightX}
                  y2={strand.y}
                  stroke={strand.color}
                  strokeWidth={1.5}
                  opacity={strand.opacity * 0.5}
                />

                {/* Left backbone node */}
                <circle
                  cx={strand.leftX}
                  cy={strand.y}
                  r={5.5}
                  fill={strand.color}
                  opacity={strand.opacity}
                  filter="url(#nodeGlow)"
                  style={{
                    animation: `helixPulse ${pulseBase}s ease-in-out ${delayLeft.toFixed(3)}s infinite`,
                  }}
                />

                {/* Right backbone node */}
                <circle
                  cx={strand.rightX}
                  cy={strand.y}
                  r={5.5}
                  fill={strand.color}
                  opacity={strand.opacity}
                  filter="url(#nodeGlow)"
                  style={{
                    animation: `helixPulse ${pulseBase}s ease-in-out ${delayRight.toFixed(3)}s infinite`,
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Trait Legend */}
      <div className="space-y-2">
        <div className="text-xs text-gray-500 uppercase tracking-wider">Trait Breakdown</div>
        <div className="grid grid-cols-2 gap-2">
          {traitLabels(analysis).map((t) => (
            <div key={t.label} className="flex items-center gap-2 text-xs">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: t.color, boxShadow: `0 0 4px ${t.color}80` }}
              />
              <span className="text-gray-400">{t.label}</span>
              <span className="text-gray-300 ml-auto font-mono">{t.value}</span>
            </div>
          ))}
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

function traitLabels(analysis: WalletAnalysis) {
  const colors = TRAIT_COLORS[analysis.archetype] || TRAIT_COLORS[0];
  return [
    { label: "DeFi", value: `${(analysis.deFiScore / 10).toFixed(0)}%`, color: colors[0] },
    { label: "Holding", value: `${(analysis.holdScore / 10).toFixed(0)}%`, color: colors[1] },
    { label: "Diversity", value: `${(analysis.diversityScore / 10).toFixed(0)}%`, color: colors[2] },
    { label: "Activity", value: `${(analysis.activityScore / 10).toFixed(0)}%`, color: colors[3] },
  ];
}
