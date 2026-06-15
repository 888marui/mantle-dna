"use client";

import { type WalletAnalysis } from "@/lib/analyzer";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { WALLET_DNA_ADDRESS, WALLET_DNA_ABI } from "@/lib/contracts";

import { keccak256, toBytes } from "viem";
import { ShareButton } from "@/components/ShareButton";

const CONTRACT_DEPLOYED = WALLET_DNA_ADDRESS !== "0x0000000000000000000000000000000000000000";

const PROTOCOL_URLS: Record<string, string> = {
  "Agni Finance": "https://agni.finance",
  "Merchant Moe": "https://merchantmoe.com",
  "Init Capital": "https://init.capital",
  "mETH Protocol": "https://meth.mantle.xyz",
  "Lendle": "https://lendle.xyz",
  "FBTC": "https://fbtc.io",
  "Mantle NFT Market": "https://mantle.xyz/ecosystem",
  "Mantle Bridge": "https://bridge.mantle.xyz",
};

interface Props {
  analysis: WalletAnalysis;
  onMintDNA: () => void;
}

const SCORE_LABELS: Record<string, string> = {
  deFiScore: "DeFi",
  holdScore: "HODLing",
  diversityScore: "Diversity",
  activityScore: "Activity",
};

/** Primary accent color per archetype index */
const ARCHETYPE_COLORS: Record<number, string> = {
  0: "#f97316", // DeFi Degen — orange
  1: "#06b6d4", // Diamond Hands — cyan
  2: "#a855f7", // NFT Collector — purple
  3: "#22c55e", // Yield Farmer — green
  4: "#10b981", // Newcomer — emerald
  5: "#3b82f6", // Whale — blue
  6: "#eab308", // Trader — yellow
};

export function DNACard({ analysis }: Props) {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const accentColor = ARCHETYPE_COLORS[analysis.archetype] ?? "#10b981";

  const scores = [
    { key: "deFiScore", value: analysis.deFiScore },
    { key: "holdScore", value: analysis.holdScore },
    { key: "diversityScore", value: analysis.diversityScore },
    { key: "activityScore", value: analysis.activityScore },
  ];

  const handleMint = () => {
    const insightText = analysis.aiInsight || analysis.description;
    const aiInsightHash = keccak256(toBytes(insightText));

    writeContract({
      address: WALLET_DNA_ADDRESS,
      abi: WALLET_DNA_ABI,
      functionName: "mintDNA",
      args: [
        analysis.address as `0x${string}`,
        `ipfs://QmDNA${analysis.address.slice(2, 10)}`,
        {
          archetype: analysis.archetype,
          txCount: analysis.txCount,
          deFiScore: analysis.deFiScore,
          holdScore: analysis.holdScore,
          diversityScore: analysis.diversityScore,
          activityScore: analysis.activityScore,
          firstSeenBlock: analysis.firstSeenBlock,
          analyzedAt: analysis.analyzedAt,
          aiInsightHash,
        },
      ],
    });
  };

  return (
    <div
      className="p-6 rounded-2xl bg-gray-900/60 space-y-5 relative overflow-hidden"
      style={{
        border: "1px solid transparent",
        backgroundClip: "padding-box",
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

      {/* Archetype Header */}
      <div className="flex items-center gap-4">
        {/* Image container with glow ring */}
        <div className="relative flex-shrink-0">
          {/* Glow ring behind image */}
          <div
            className="absolute inset-0 rounded-2xl blur-md"
            style={{ background: `${accentColor}50`, transform: "scale(1.15)" }}
          />
          <div
            className="relative w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`,
              border: `1.5px solid ${accentColor}60`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={analysis.archetypeImage}
              alt={analysis.archetypeName}
              className="w-full h-full object-cover"
              onError={(e) => {
                const t = e.currentTarget;
                t.style.display = "none";
                t.parentElement!.innerHTML = `<span class="text-5xl">${analysis.archetypeEmoji}</span>`;
              }}
            />
            {/* Emoji overlay badge — top-right corner */}
            <span
              className="absolute top-1 right-1 text-sm leading-none select-none"
              style={{
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))",
              }}
            >
              {analysis.archetypeEmoji}
            </span>
          </div>
        </div>

        <div>
          <div
            className="text-xs font-medium uppercase tracking-wider mb-1"
            style={{ color: accentColor }}
          >
            DNA Archetype
          </div>
          <div className="text-2xl font-bold text-white">{analysis.archetypeName}</div>
          <div className="text-xs text-gray-500 font-mono mt-1">
            {analysis.address.slice(0, 10)}...{analysis.address.slice(-8)}
          </div>
          <div className="text-xs text-gray-600 mt-0.5">
            First seen ~block #{analysis.firstSeenBlock.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 leading-relaxed">{analysis.description}</p>

      {/* Total DNA Score */}
      {(() => {
        const totalPct = Math.round(
          ((analysis.deFiScore + analysis.holdScore + analysis.diversityScore + analysis.activityScore) / 40)
        );
        return (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-medium uppercase tracking-wider">DNA Strength</span>
              <span className="font-bold text-sm" style={{ color: accentColor }}>{totalPct}%</span>
            </div>
            <div className="h-1 rounded-full bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${totalPct}%`,
                  background: `linear-gradient(90deg, ${accentColor}aa, ${accentColor})`,
                  boxShadow: `0 0 8px ${accentColor}60`,
                }}
              />
            </div>
          </div>
        );
      })()}

      {/* AI Insights Section */}
      {analysis.aiInsight && (
        <div
          className="p-4 rounded-xl space-y-3"
          style={{
            background: `linear-gradient(135deg, ${accentColor}14, ${accentColor}06)`,
            border: `1px solid ${accentColor}30`,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">✨</span>
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: accentColor }}
            >
              AI Analysis
            </span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{analysis.aiInsight}</p>

          {analysis.aiStrengths && analysis.aiStrengths.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Strengths</div>
              <div className="flex flex-wrap gap-2">
                {analysis.aiStrengths.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{
                      background: `${accentColor}20`,
                      border: `1px solid ${accentColor}40`,
                      color: accentColor,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.aiWatchOut && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Watch Out</div>
              <p className="text-xs text-yellow-400/80 leading-relaxed">⚠️ {analysis.aiWatchOut}</p>
            </div>
          )}

          {analysis.aiPrediction && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Prediction</div>
              <p className="text-xs text-blue-400/80 leading-relaxed">🔮 {analysis.aiPrediction}</p>
            </div>
          )}
        </div>
      )}

      {/* Protocol Affinity */}
      <div className="space-y-2">
        <div className="text-xs text-gray-500 uppercase tracking-wider">Mantle Ecosystem Affinity</div>
        <div className="flex flex-wrap gap-2">
          {analysis.protocolAffinity.map((protocol) => (
            <a
              key={protocol}
              href={PROTOCOL_URLS[protocol] ?? "https://mantle.xyz/ecosystem"}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105"
              style={{
                background: `${accentColor}15`,
                border: `1px solid ${accentColor}35`,
                color: "#9ca3af",
              }}
            >
              {protocol} ↗
            </a>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatBadge label="Transactions" value={analysis.txCount.toString()} accentColor={accentColor} />
        <StatBadge label="MNT Balance" value={`${analysis.mntBalance} MNT`} accentColor={accentColor} />
        <a
          href={`https://explorer.sepolia.mantle.xyz/address/${analysis.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-xl flex flex-col justify-between transition-all hover:opacity-80"
          style={{
            background: "rgba(31,41,55,0.6)",
            border: `1px solid ${accentColor}25`,
          }}
        >
          <div className="text-xs text-gray-500 mb-1">Explorer</div>
          <div className="text-sm font-semibold" style={{ color: accentColor }}>View ↗</div>
        </a>
      </div>

      {/* Score Bars */}
      <div className="space-y-3">
        {scores.map(({ key, value }) => (
          <ScoreBar key={key} label={SCORE_LABELS[key]} value={value} accentColor={accentColor} />
        ))}
      </div>

      {/* Share Button */}
      <ShareButton analysis={analysis} />

      {/* Mint Button */}
      {isSuccess ? (
        <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-400 text-sm text-center">
          🎉 DNA NFT minted to your wallet!
        </div>
      ) : !CONTRACT_DEPLOYED ? (
        <div className="p-3 rounded-xl bg-gray-800/60 border border-gray-700 text-gray-500 text-xs text-center">
          Soulbound NFT minting coming soon — contract deploying to Mantle Sepolia
        </div>
      ) : (
        <button
          onClick={handleMint}
          disabled={isPending || isConfirming}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
            boxShadow: `0 0 16px ${accentColor}40`,
          }}
        >
          {isPending || isConfirming ? "Minting..." : "Mint DNA as Soulbound NFT"}
        </button>
      )}

      <p className="text-xs text-gray-600 text-center">
        Soulbound — non-transferable proof of your on-chain identity
      </p>
    </div>
  );
}

function StatBadge({ label, value, accentColor }: { label: string; value: string; accentColor: string }) {
  return (
    <div
      className="p-3 rounded-xl"
      style={{
        background: "rgba(31,41,55,0.6)",
        border: `1px solid ${accentColor}25`,
      }}
    >
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function ScoreBar({ label, value, accentColor }: { label: string; value: number; accentColor: string }) {
  const pct = Math.round(value / 10);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300">{value}/1000</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${accentColor}aa, ${accentColor})`,
            boxShadow: `0 0 6px ${accentColor}60`,
          }}
        />
      </div>
    </div>
  );
}
