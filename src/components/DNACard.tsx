"use client";

import { useState } from "react";
import { type WalletAnalysis, getExplorerUrl } from "@/lib/analyzer";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { WALLET_DNA_ADDRESS, WALLET_DNA_ABI } from "@/lib/contracts";

import { keccak256, toBytes } from "viem";
import { ShareButton } from "@/components/ShareButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

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

// Protocol match score based on wallet's DNA traits (0-100)
function protocolMatchScore(
  protocol: string,
  deFi: number,
  hold: number,
  diversity: number,
  activity: number
): number {
  const scores: Record<string, number> = {
    "Agni Finance": Math.round((deFi * 0.5 + activity * 0.3 + diversity * 0.2) / 10),
    "Merchant Moe": Math.round((activity * 0.6 + deFi * 0.3 + diversity * 0.1) / 10),
    "Init Capital": Math.round((deFi * 0.4 + diversity * 0.4 + hold * 0.2) / 10),
    "mETH Protocol": Math.round((hold * 0.6 + deFi * 0.2 + diversity * 0.2) / 10),
    "Lendle": Math.round((hold * 0.4 + deFi * 0.4 + diversity * 0.2) / 10),
    "FBTC": Math.round((hold * 0.7 + diversity * 0.2 + deFi * 0.1) / 10),
    "Mantle NFT Market": Math.round((diversity * 0.5 + activity * 0.3 + hold * 0.2) / 10),
    "Mantle Bridge": Math.round((activity * 0.5 + diversity * 0.3 + deFi * 0.2) / 10),
  };
  return Math.min(100, scores[protocol] ?? 50);
}

interface Props {
  analysis: WalletAnalysis;
  onMintDNA: () => void;
}

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

const ARCHETYPE_RARITY: Record<number, string> = {
  0: "12% of wallets",
  1: "18% of wallets",
  2: "22% of wallets",
  3: "8% of wallets",
  4: "25% of wallets",
  5: "3% of wallets",
  6: "12% of wallets",
};

type EvolutionData = {
  targetName: string;
  targetEmoji: string;
  targetColor: string;
  progressItems: Array<{ label: string; current: number; target: number }>;
  actions: Array<{ protocol: string; url: string; action: string }>;
};

function getEvolution(analysis: WalletAnalysis): EvolutionData {
  const { archetype, deFiScore, holdScore, diversityScore, activityScore, txCount } = analysis;
  switch (archetype) {
    case 0:
      return {
        targetName: "Protocol Master",
        targetEmoji: "⚡",
        targetColor: "#f97316",
        progressItems: [{ label: "DeFi Score (elite)", current: deFiScore, target: 1000 }],
        actions: [
          { protocol: "Init Capital", url: "https://init.capital", action: "Open leveraged yield positions for max DeFi score" },
          { protocol: "Lendle", url: "https://lendle.xyz", action: "Optimize your borrow-supply efficiency" },
        ],
      };
    case 1:
      return {
        targetName: "Yield Farmer",
        targetEmoji: "🌾",
        targetColor: "#22c55e",
        progressItems: [
          { label: "DeFi Score → 500", current: deFiScore, target: 500 },
          { label: "Diversity → 700", current: diversityScore, target: 700 },
        ],
        actions: [
          { protocol: "Agni Finance", url: "https://agni.finance", action: "Provide MNT/USDC liquidity" },
          { protocol: "mETH Protocol", url: "https://meth.mantle.xyz", action: "Stake ETH for liquid mETH yield" },
        ],
      };
    case 2:
      return {
        targetName: "Yield Farmer",
        targetEmoji: "🌾",
        targetColor: "#22c55e",
        progressItems: [
          { label: "DeFi Score → 500", current: deFiScore, target: 500 },
          { label: "Diversity → 700", current: diversityScore, target: 700 },
        ],
        actions: [
          { protocol: "Agni Finance", url: "https://agni.finance", action: "Add your first liquidity position" },
          { protocol: "Merchant Moe", url: "https://merchantmoe.com", action: "Trade to boost activity score" },
        ],
      };
    case 3:
      return {
        targetName: "DeFi Degen",
        targetEmoji: "🔥",
        targetColor: "#f97316",
        progressItems: [{ label: "DeFi Score → 800", current: deFiScore, target: 800 }],
        actions: [
          { protocol: "Init Capital", url: "https://init.capital", action: "Open leveraged yield position" },
          { protocol: "Agni Finance", url: "https://agni.finance", action: "Add concentrated liquidity range" },
        ],
      };
    case 4:
      return {
        targetName: "Trader",
        targetEmoji: "📊",
        targetColor: "#eab308",
        progressItems: [
          { label: "Transactions → 5", current: txCount, target: 5 },
          { label: "Activity → 750", current: activityScore, target: 750 },
        ],
        actions: [
          { protocol: "Mantle Bridge", url: "https://bridge.mantle.xyz", action: "Bridge ETH or USDC to Mantle" },
          { protocol: "Agni Finance", url: "https://agni.finance", action: "Make your first on-chain swap" },
        ],
      };
    case 5:
      return {
        targetName: "Yield Farmer",
        targetEmoji: "🌾",
        targetColor: "#22c55e",
        progressItems: [{ label: "Protocol Diversity → 700", current: diversityScore, target: 700 }],
        actions: [
          { protocol: "Init Capital", url: "https://init.capital", action: "Deploy capital for leveraged yield" },
          { protocol: "Lendle", url: "https://lendle.xyz", action: "Supply MNT to earn passive yield" },
        ],
      };
    case 6:
      return {
        targetName: "Diamond Hands",
        targetEmoji: "💎",
        targetColor: "#06b6d4",
        progressItems: [{ label: "HODLing Score → 800", current: holdScore, target: 800 }],
        actions: [
          { protocol: "mETH Protocol", url: "https://meth.mantle.xyz", action: "Stake ETH for long-term mETH yield" },
          { protocol: "Lendle", url: "https://lendle.xyz", action: "Supply assets for passive income" },
        ],
      };
    default:
      return { targetName: "Elite", targetEmoji: "⚡", targetColor: "#10b981", progressItems: [], actions: [] };
  }
}

export function DNACard({ analysis }: Props) {
  const [addrCopied, setAddrCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { lang } = useLanguage();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Check if DNA has already been minted for this wallet on-chain
  const { data: existingTokenId } = useReadContract({
    address: WALLET_DNA_ADDRESS,
    abi: WALLET_DNA_ABI,
    functionName: "walletToTokenId",
    args: [analysis.address as `0x${string}`],
    query: { enabled: CONTRACT_DEPLOYED },
  });
  const alreadyMinted = CONTRACT_DEPLOYED && existingTokenId != null && BigInt(existingTokenId as bigint) > BigInt(0);

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

  const handleDownloadCert = async () => {
    setIsDownloading(true);
    try {
      const params = new URLSearchParams({
        address: analysis.address,
        archetype: String(analysis.archetype),
        defi: String(analysis.deFiScore),
        hodl: String(analysis.holdScore),
        diversity: String(analysis.diversityScore),
        activity: String(analysis.activityScore),
        network: analysis.network,
        mantleScore: String(analysis.mantleScore),
      });
      const res = await fetch(`/api/og?${params}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mantle-dna-${analysis.archetypeName.toLowerCase().replace(/\s/g, "-")}-${analysis.address.slice(0, 8)}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(`/api/og?address=${analysis.address}`, "_blank");
    } finally {
      setIsDownloading(false);
    }
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
        animation: "fadeSlideIn 0.4s ease-out both",
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
            {t(lang, "dna_archetype")}
          </div>
          <div className="text-2xl font-bold text-white">{analysis.archetypeName}</div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: `${accentColor}20`, color: accentColor }}
            >
              Top {ARCHETYPE_RARITY[analysis.archetype] ?? "rare"}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-500 border border-gray-700">
              {analysis.network === 'mainnet' ? '🟢 Mainnet' : '🔵 Sepolia'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-gray-500 font-mono">
              {analysis.address.slice(0, 10)}...{analysis.address.slice(-8)}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(analysis.address).catch(() => {});
                setAddrCopied(true);
                setTimeout(() => setAddrCopied(false), 1500);
              }}
              className="text-[10px] px-1 py-0.5 rounded text-gray-600 hover:text-gray-400 transition-colors"
              title="Copy address"
            >
              {addrCopied ? "✓" : "⎘"}
            </button>
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
              <span className="text-gray-400 font-medium uppercase tracking-wider">{t(lang, "dna_strength")}</span>
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

      {/* Mantle Ecosystem Score */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400 font-medium uppercase tracking-wider">{t(lang, "mantle_score")}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
              style={{
                background: analysis.mantleScore >= 80 ? "rgba(168,85,247,0.15)" :
                            analysis.mantleScore >= 60 ? "rgba(234,179,8,0.15)" :
                            analysis.mantleScore >= 30 ? "rgba(156,163,175,0.15)" : "rgba(120,113,108,0.15)",
                color: analysis.mantleScore >= 80 ? "#c084fc" :
                       analysis.mantleScore >= 60 ? "#facc15" :
                       analysis.mantleScore >= 30 ? "#9ca3af" : "#78716c",
                border: `1px solid ${analysis.mantleScore >= 80 ? "rgba(168,85,247,0.3)" :
                                     analysis.mantleScore >= 60 ? "rgba(234,179,8,0.3)" :
                                     analysis.mantleScore >= 30 ? "rgba(156,163,175,0.3)" : "rgba(120,113,108,0.3)"}`,
              }}
            >
              {analysis.mantleScore >= 80 ? t(lang, "tier_platinum") :
               analysis.mantleScore >= 60 ? t(lang, "tier_gold") :
               analysis.mantleScore >= 30 ? t(lang, "tier_silver") : t(lang, "tier_bronze")}
            </span>
            <span className="font-bold text-sm" style={{ color: accentColor }}>{analysis.mantleScore}/100</span>
          </div>
        </div>
        <div className="h-1 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${analysis.mantleScore}%`,
              background: `linear-gradient(90deg, ${accentColor}aa, ${accentColor})`,
              boxShadow: `0 0 8px ${accentColor}60`,
            }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            analysis.mantleScore >= 20 && { label: t(lang, "badge_mnt") },
            parseFloat(analysis.mntBalance) >= 1 && { label: t(lang, "badge_whale") },
            analysis.tokenBalances?.mETH && { label: t(lang, "badge_meth") },
            (analysis.tokenBalances?.USDT || analysis.tokenBalances?.USDC) && { label: t(lang, "badge_stable") },
            analysis.tokenBalances?.WMNT && { label: t(lang, "badge_defi") },
            analysis.txCount > 5 && { label: t(lang, "badge_veteran") },
          ].filter(Boolean).map((badge) => (
            <span
              key={(badge as { label: string }).label}
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ background: `${accentColor}15`, color: `${accentColor}cc`, border: `1px solid ${accentColor}30` }}
            >
              ✓ {(badge as { label: string }).label}
            </span>
          ))}
        </div>
      </div>

      {/* Fresh wallet note */}
      {analysis.archetype === 4 && analysis.txCount < 5 && parseFloat(analysis.mntBalance) < 0.001 && (
        <div className="px-3 py-2 rounded-xl text-xs text-gray-500"
          style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
          <span className="font-medium text-emerald-600">{t(lang, "early_stage")}</span>
          {" — "}
          <a href="https://agni.finance" target="_blank" rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-400 underline underline-offset-2 transition-colors">
            Agni Finance
          </a>
          {" "}
          {lang === "ja" ? "でDNAを育てよう。" : "to grow your DNA."}
        </div>
      )}

      {/* AI Insights Section */}
      {analysis.aiInsight && (
        <div
          className="p-4 rounded-xl space-y-3"
          style={{
            background: `linear-gradient(135deg, ${accentColor}14, ${accentColor}06)`,
            border: `1px solid ${accentColor}30`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: accentColor }}
              >
                {t(lang, "ai_analysis")}
              </span>
            </div>
            <span className="text-[10px] text-gray-600 font-mono">{t(lang, "powered_by")}</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{analysis.aiInsight}</p>

          {analysis.aiStrengths && analysis.aiStrengths.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs text-gray-500 uppercase tracking-wider">{t(lang, "strengths")}</div>
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
              <div className="text-xs text-gray-500 uppercase tracking-wider">{t(lang, "watch_out")}</div>
              <p className="text-xs text-yellow-400/80 leading-relaxed">⚠️ {analysis.aiWatchOut}</p>
            </div>
          )}

          {analysis.aiPrediction && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500 uppercase tracking-wider">{t(lang, "prediction")}</div>
              <p className="text-xs text-blue-400/80 leading-relaxed">🔮 {analysis.aiPrediction}</p>
            </div>
          )}
        </div>
      )}

      {/* DNA Evolution Path */}
      {(() => {
        const evo = getEvolution(analysis);
        return (
          <div
            className="p-4 rounded-xl space-y-3"
            style={{ background: "rgba(17,24,39,0.8)", border: "1px solid rgba(55,65,81,0.5)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t(lang, "evolution_path")}</span>
              <span className="text-[10px] text-gray-700">{t(lang, "evolution_actions")}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-gray-400">
                <span>{analysis.archetypeEmoji}</span>
                <span className="text-xs">{analysis.archetypeName}</span>
              </div>
              <span className="text-gray-700">→</span>
              <div className="flex items-center gap-1.5 font-semibold text-xs" style={{ color: evo.targetColor }}>
                <span>{evo.targetEmoji}</span>
                <span>{evo.targetName}</span>
              </div>
            </div>
            {evo.progressItems.map((item) => {
              const pct = Math.min(100, Math.round((item.current / item.target) * 100));
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-mono" style={{ color: evo.targetColor }}>{item.current}/{item.target}</span>
                  </div>
                  <div className="h-1 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: evo.targetColor,
                        boxShadow: `0 0 4px ${evo.targetColor}60`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="grid grid-cols-2 gap-2">
              {evo.actions.map((action) => (
                <a
                  key={action.protocol}
                  href={action.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg border border-gray-800 hover:border-gray-600 transition-all hover:scale-[1.01] group"
                  style={{ background: "rgba(8,12,20,0.9)" }}
                >
                  <div className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors">
                    {action.protocol} ↗
                  </div>
                  <div className="text-[10px] text-gray-600 mt-0.5 leading-tight">{action.action}</div>
                </a>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Protocol Affinity */}
      <div className="space-y-2">
        <div className="text-xs text-gray-500 uppercase tracking-wider">{t(lang, "protocol_match")}</div>
        <div className="space-y-1.5">
          {analysis.protocolAffinity.map((protocol) => {
            const match = protocolMatchScore(protocol, analysis.deFiScore, analysis.holdScore, analysis.diversityScore, analysis.activityScore);
            return (
              <a
                key={protocol}
                href={PROTOCOL_URLS[protocol] ?? "https://mantle.xyz/ecosystem"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 group"
              >
                <div className="text-xs text-gray-500 w-28 shrink-0 group-hover:text-gray-300 transition-colors truncate">
                  {protocol}
                </div>
                <div className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${match}%`,
                      background: `linear-gradient(90deg, ${accentColor}80, ${accentColor})`,
                    }}
                  />
                </div>
                <div className="text-[10px] font-mono w-8 text-right shrink-0" style={{ color: accentColor }}>
                  {match}%
                </div>
                <span className="text-[10px] text-gray-700 group-hover:text-gray-500 transition-colors">↗</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatBadge label={t(lang, "transactions")} value={analysis.txCount.toString()} accentColor={accentColor} />
        <StatBadge label={t(lang, "mnt_balance")} value={`${analysis.mntBalance} MNT`} accentColor={accentColor} />
        <a
          href={getExplorerUrl(analysis.address, analysis.network)}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-xl flex flex-col justify-between transition-all hover:opacity-80"
          style={{
            background: "rgba(31,41,55,0.6)",
            border: `1px solid ${accentColor}25`,
          }}
        >
          <div className="text-xs text-gray-500 mb-1">{t(lang, "explorer")}</div>
          <div className="text-sm font-semibold" style={{ color: accentColor }}>{t(lang, "view")}</div>
        </a>
      </div>

      {/* Token Holdings (mainnet only, when real data available) */}
      {analysis.tokenBalances && Object.keys(analysis.tokenBalances).length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500 uppercase tracking-wider">{t(lang, "real_tokens")}</div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-500 border border-emerald-900">
              {t(lang, "live_onchain")}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(analysis.tokenBalances).map(([symbol, amount]) => (
              <div
                key={symbol}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                style={{
                  background: `${accentColor}10`,
                  border: `1px solid ${accentColor}30`,
                }}
              >
                <span className="text-gray-400 font-medium">{symbol}</span>
                <span style={{ color: accentColor }} className="font-semibold font-mono">{amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score Bars */}
      <div className="space-y-3">
        {scores.map(({ key, value }) => {
          const labelKey = key === "deFiScore" ? "score_defi" :
                          key === "holdScore" ? "score_hodl" :
                          key === "diversityScore" ? "score_diversity" : "score_activity";
          return (
            <ScoreBar
              key={key}
              label={t(lang, labelKey as Parameters<typeof t>[1])}
              value={value}
              accentColor={accentColor}
            />
          );
        })}
      </div>

      {/* Share + Download row */}
      <div className="space-y-2">
        <ShareButton analysis={analysis} />
        <button
          onClick={handleDownloadCert}
          disabled={isDownloading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-600 text-xs font-medium transition-colors disabled:opacity-50"
        >
          {isDownloading ? t(lang, "downloading") : t(lang, "download_cert")}
        </button>
      </div>

      {/* Mint Button */}
      {isSuccess ? (
        <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-400 text-sm text-center">
          {t(lang, "minted_success")} Token #{String(existingTokenId ?? "")}
        </div>
      ) : alreadyMinted ? (
        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900 text-center space-y-1">
          <div className="text-xs text-emerald-400 font-semibold">{t(lang, "already_minted")}</div>
          <div className="text-xs text-gray-500">Token #{String(existingTokenId)}</div>
          <a
            href={`${getExplorerUrl(analysis.address, analysis.network)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-600 hover:text-emerald-400 underline underline-offset-2 transition-colors"
          >
            {t(lang, "view_explorer")}
          </a>
        </div>
      ) : !CONTRACT_DEPLOYED ? (
        <div
          className="p-4 rounded-xl space-y-2"
          style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}25` }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: accentColor }}>
              {t(lang, "deploying_title")}
            </span>
            <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
              Mantle Sepolia
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            {t(lang, "deploying_desc")}
          </p>
          <div className="flex gap-2 flex-wrap">
            {([t(lang, "nft_feature_1"), t(lang, "nft_feature_2"), t(lang, "nft_feature_3")]).map((trait) => (
              <span
                key={trait}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: `${accentColor}15`, color: `${accentColor}cc` }}
              >
                ✓ {trait}
              </span>
            ))}
          </div>
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
          {isPending || isConfirming ? t(lang, "minting") : t(lang, "mint_nft")}
        </button>
      )}

      <p className="text-xs text-gray-600 text-center">
        {t(lang, "soulbound_note")}
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

function scoreTier(v: number): string {
  if (v >= 800) return "Elite";
  if (v >= 600) return "Strong";
  if (v >= 400) return "Moderate";
  return "Growing";
}

function ScoreBar({ label, value, accentColor }: { label: string; value: number; accentColor: string }) {
  const pct = Math.round(value / 10);
  const tier = scoreTier(value);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-400">{label}</span>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{
              background: value >= 800 ? `${accentColor}25` : "rgba(31,41,55,0.6)",
              color: value >= 800 ? accentColor : "#6b7280",
            }}
          >
            {tier}
          </span>
          <span className="text-gray-500 font-mono">{value}</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${accentColor}aa, ${accentColor})`,
            boxShadow: `0 0 6px ${accentColor}60`,
            animation: `fillBar 0.9s cubic-bezier(0.4,0,0.2,1) both`,
            ["--bar-width" as string]: `${pct}%`,
          }}
        />
      </div>
    </div>
  );
}
