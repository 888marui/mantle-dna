"use client";

import { type WalletAnalysis } from "@/lib/analyzer";

interface Props {
  analysis: WalletAnalysis;
}

const TRAIT_COLORS: Record<number, string[]> = {
  0: ["#10b981", "#059669", "#047857", "#065f46", "#10b981", "#34d399"], // DeFi Degen - greens
  1: ["#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#60a5fa", "#93c5fd"], // Diamond Hands - blues
  2: ["#a855f7", "#9333ea", "#7e22ce", "#6b21a8", "#c084fc", "#d8b4fe"], // NFT Collector - purples
  3: ["#f59e0b", "#d97706", "#b45309", "#92400e", "#fbbf24", "#fcd34d"], // Yield Farmer - ambers
  4: ["#6b7280", "#4b5563", "#374151", "#1f2937", "#9ca3af", "#d1d5db"], // Newcomer - grays
  5: ["#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#f87171", "#fca5a5"], // Whale - reds
  6: ["#06b6d4", "#0891b2", "#0e7490", "#155e75", "#22d3ee", "#67e8f9"], // Trader - cyans
};

export function DNAVisualizer({ analysis }: Props) {
  const colors = TRAIT_COLORS[analysis.archetype] || TRAIT_COLORS[0];
  const strands = generateStrands(analysis, colors);

  return (
    <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-5">
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">DNA Sequence</div>
        <div className="text-lg font-bold text-white">Visual Genome</div>
      </div>

      {/* DNA Helix SVG */}
      <div className="flex justify-center">
        <svg width="200" height="280" viewBox="0 0 200 280" className="overflow-visible">
          {strands.map((strand, i) => (
            <g key={i}>
              {/* Left backbone circle */}
              <circle
                cx={strand.leftX}
                cy={strand.y}
                r={5}
                fill={strand.color}
                opacity={strand.opacity}
              />
              {/* Right backbone circle */}
              <circle
                cx={strand.rightX}
                cy={strand.y}
                r={5}
                fill={strand.color}
                opacity={strand.opacity}
              />
              {/* Rung connecting the two */}
              <line
                x1={strand.leftX}
                y1={strand.y}
                x2={strand.rightX}
                y2={strand.y}
                stroke={strand.color}
                strokeWidth={2}
                opacity={strand.opacity * 0.6}
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Trait Legend */}
      <div className="space-y-2">
        <div className="text-xs text-gray-500 uppercase tracking-wider">Trait Breakdown</div>
        <div className="grid grid-cols-2 gap-2">
          {traitLabels(analysis).map((t) => (
            <div key={t.label} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.color }} />
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
    const opacity = 0.4 + 0.6 * Math.abs(sinVal);

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
