"use client";

import { type WalletAnalysis } from "@/lib/analyzer";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { WALLET_DNA_ADDRESS, WALLET_DNA_ABI } from "@/lib/contracts";
import { keccak256, toBytes } from "viem";
import { ShareButton } from "@/components/ShareButton";

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

export function DNACard({ analysis }: Props) {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

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
    <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-5">
      {/* Archetype Header */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-800/50 flex-shrink-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={analysis.archetypeImage}
            alt={analysis.archetypeName}
            className="w-full h-full object-cover"
            onError={(e) => {
              const t = e.currentTarget;
              t.style.display = "none";
              t.parentElement!.innerHTML = `<span class="text-4xl">${analysis.archetypeEmoji}</span>`;
            }}
          />
        </div>
        <div>
          <div className="text-xs text-emerald-400 font-medium uppercase tracking-wider mb-1">
            DNA Archetype
          </div>
          <div className="text-2xl font-bold text-white">{analysis.archetypeName}</div>
          <div className="text-xs text-gray-500 font-mono mt-1">
            {analysis.address.slice(0, 10)}...{analysis.address.slice(-8)}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 leading-relaxed">{analysis.description}</p>

      {/* AI Insights Section */}
      {analysis.aiInsight && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base">✨</span>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">AI Analysis</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{analysis.aiInsight}</p>

          {analysis.aiStrengths && analysis.aiStrengths.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Strengths</div>
              <div className="flex flex-wrap gap-2">
                {analysis.aiStrengths.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-full bg-emerald-900/50 border border-emerald-700/50 text-xs text-emerald-300"
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

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <StatBadge label="Transactions" value={analysis.txCount.toString()} />
        <StatBadge label="MNT Balance" value={`${analysis.mntBalance} MNT`} />
      </div>

      {/* Score Bars */}
      <div className="space-y-3">
        {scores.map(({ key, value }) => (
          <ScoreBar key={key} label={SCORE_LABELS[key]} value={value} />
        ))}
      </div>

      {/* Share Button */}
      <ShareButton analysis={analysis} />

      {/* Mint Button */}
      {isSuccess ? (
        <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-400 text-sm text-center">
          🎉 DNA NFT minted to your wallet!
        </div>
      ) : (
        <button
          onClick={handleMint}
          disabled={isPending || isConfirming}
          className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-gray-800/60 border border-gray-700">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value / 10);
  const color =
    pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-yellow-500" : "bg-gray-600";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300">{value}/1000</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
