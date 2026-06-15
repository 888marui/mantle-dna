"use client";

import { useAccount } from "wagmi";
import { WalletButton } from "@/components/WalletButton";
import { useState, useEffect } from "react";
import { analyzeWallet, type WalletAnalysis, type NetworkType } from "@/lib/analyzer";
import { DNACard } from "@/components/DNACard";
import { DNAVisualizer } from "@/components/DNAVisualizer";
import { SearchBar } from "@/components/SearchBar";

const FEATURED_WALLETS: Array<{ address: string; archetype: string; emoji: string; label: string; network: NetworkType }> = [
  {
    address: "0x000000000000000000000000000000000000dEaD",
    archetype: "Diamond Hands",
    emoji: "💎",
    label: "Burn Address",
    network: "mainnet",
  },
  {
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    archetype: "DeFi Degen",
    emoji: "🔥",
    label: "Vitalik.eth",
    network: "mainnet",
  },
  {
    address: "0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326",
    archetype: "Trader",
    emoji: "📊",
    label: "MEV Builder",
    network: "mainnet",
  },
];

const STATS = [
  { label: "Archetypes", value: "7 Types" },
  { label: "Network", value: "Mantle" },
  { label: "Analysis", value: "AI-Powered" },
  { label: "Identity", value: "Soulbound" },
];

const ARCHETYPES_GALLERY = [
  { name: "DeFi Degen", emoji: "🔥", color: "#f97316", rarity: "12%", desc: "High-frequency swaps, yield chasing, protocol hopping." },
  { name: "Diamond Hands", emoji: "💎", color: "#06b6d4", rarity: "18%", desc: "Patient accumulation, low churn, long-term conviction." },
  { name: "NFT Collector", emoji: "🎨", color: "#a855f7", rarity: "22%", desc: "Digital art, collectibles, and cultural curation." },
  { name: "Yield Farmer", emoji: "🌾", color: "#22c55e", rarity: "8%", desc: "Liquidity provision, compounding rewards, APY hunting." },
  { name: "Newcomer", emoji: "🌱", color: "#10b981", rarity: "25%", desc: "Fresh wallet, early explorer of the Mantle ecosystem." },
  { name: "Whale", emoji: "🐋", color: "#3b82f6", rarity: "3%", desc: "High-value positions, strategic moves, market impact." },
  { name: "Trader", emoji: "📊", color: "#eab308", rarity: "12%", desc: "Precision DEX execution, momentum reading, sharp timing." },
];

const RECENT_KEY = "mantle_dna_recent";

interface RecentEntry {
  address: string;
  archetypeName: string;
  archetypeEmoji: string;
  analyzedAt: number;
}

function loadRecent(): RecentEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecent(analysis: WalletAnalysis) {
  if (typeof window === "undefined") return;
  const entry: RecentEntry = {
    address: analysis.address,
    archetypeName: analysis.archetypeName,
    archetypeEmoji: analysis.archetypeEmoji,
    analyzedAt: analysis.analyzedAt,
  };
  const prev = loadRecent().filter((r) => r.address !== entry.address);
  const next = [entry, ...prev].slice(0, 3);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const [analysis, setAnalysis] = useState<WalletAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<RecentEntry[]>([]);
  const [statsMounted, setStatsMounted] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [blockNumber, setBlockNumber] = useState<number | null>(null);

  const LOADING_STAGES = [
    "Fetching on-chain data...",
    "Computing DNA traits...",
    "Running AI analysis...",
  ];

  useEffect(() => {
    setRecentAnalyses(loadRecent());
    const t = setTimeout(() => setStatsMounted(true), 300);
    fetch(process.env.NEXT_PUBLIC_MANTLE_RPC || "https://rpc.sepolia.mantle.xyz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.result) setBlockNumber(parseInt(d.result, 16)); })
      .catch(() => {});
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!loading) {
      setLoadingStage(0);
      return;
    }
    setLoadingStage(0);
    const interval = setInterval(() => {
      setLoadingStage((prev) => (prev + 1) % LOADING_STAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const handleAnalyze = async (walletAddress: string, network: NetworkType = 'sepolia') => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzeWallet(walletAddress, network);
      setAnalysis(result);
      saveRecent(result);
      setRecentAnalyses(loadRecent());
    } catch {
      setError("Failed to analyze wallet. Make sure it's a valid Mantle address.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeSelf = () => {
    if (address) handleAnalyze(address, 'sepolia');
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-gray-800/60 px-6 py-4 backdrop-blur-sm sticky top-0 z-10 bg-[#0a0a0a]/90">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧬</span>
            <div>
              <span className="text-xl font-bold text-white tracking-tight">Mantle DNA</span>
              <span className="ml-2 px-2 py-0.5 text-[10px] rounded-full bg-emerald-900/60 text-emerald-400 border border-emerald-800">
                Hackathon
              </span>
            </div>
          </div>
          {blockNumber && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-600 font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Block #{blockNumber.toLocaleString()}
            </div>
          )}
          <WalletButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        {/* Hero */}
        <div className="text-center space-y-4 relative">
          {/* Subtle radial glow behind heading */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(16,185,129,0.12) 0%, transparent 70%)",
            }}
          />
          <h1 className="relative text-4xl md:text-5xl font-bold text-white leading-tight">
            Discover Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
              On-Chain DNA
            </span>
          </h1>
          <p className="relative text-gray-400 text-lg max-w-xl mx-auto">
            Enter any Mantle wallet address to instantly reveal its unique on-chain personality
            profile — powered by AI analysis and minted as a Soulbound NFT.
          </p>

          {/* Stats Bar — pulse on mount */}
          <div className="relative flex flex-wrap justify-center gap-6 pt-2">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="text-center"
                style={{
                  animation: statsMounted
                    ? `statPulse 0.5s ease-out ${i * 80}ms both`
                    : undefined,
                }}
              >
                <div className="text-lg font-bold text-emerald-400">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="space-y-3">
          <SearchBar onAnalyze={handleAnalyze} loading={loading} />
          {isConnected && (
            <div className="text-center">
              <button
                onClick={handleAnalyzeSelf}
                className="text-sm text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors"
              >
                Analyze my wallet ({address?.slice(0, 6)}...{address?.slice(-4)})
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-400 text-sm text-center space-y-2">
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs text-red-500 hover:text-red-400 underline underline-offset-2 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="text-5xl animate-spin">🧬</div>
            <p className="text-emerald-400 font-medium">{LOADING_STAGES[loadingStage]}</p>
            <div className="flex gap-2">
              {LOADING_STAGES.map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: i === loadingStage ? "24px" : "8px",
                    background: i === loadingStage ? "#10b981" : "#374151",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {analysis && !loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DNACard analysis={analysis} onMintDNA={() => {}} />
              <DNAVisualizer analysis={analysis} />
            </div>
            {/* Actions row */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={`/wallet/${analysis.address}`}
                className="text-sm text-emerald-500 hover:text-emerald-400 underline underline-offset-4 transition-colors"
              >
                🔗 Shareable link
              </a>
              <span className="text-gray-700">•</span>
              <button
                onClick={() => { setAnalysis(null); setError(null); }}
                className="text-sm text-gray-500 hover:text-gray-400 underline underline-offset-4 transition-colors"
              >
                Try another wallet
              </button>
            </div>
          </div>
        )}

        {/* How It Works */}
        {!analysis && !loading && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-400 text-center uppercase tracking-wider">
              How It Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  step: "01",
                  icon: "🔍",
                  title: "Paste Your Address",
                  desc: "Enter any Mantle wallet address. We fetch your on-chain data live from Mantle Sepolia.",
                },
                {
                  step: "02",
                  icon: "🧬",
                  title: "AI Analysis",
                  desc: "Claude AI analyzes your DeFi activity, transaction patterns, and portfolio behavior to reveal your DNA.",
                },
                {
                  step: "03",
                  icon: "🎭",
                  title: "Mint Your Identity",
                  desc: "Receive one of 7 archetypes and mint it as a soulbound NFT — your permanent on-chain identity on Mantle.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="p-5 rounded-xl bg-gray-900/60 border border-gray-800 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-emerald-600 font-mono">{item.step}</span>
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <div className="text-sm font-semibold text-white">{item.title}</div>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Archetype Gallery */}
        {!analysis && !loading && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                DNA Archetypes
              </h2>
              <p className="text-xs text-gray-600">Which one are you?</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {ARCHETYPES_GALLERY.map((a) => (
                <div
                  key={a.name}
                  className="group relative p-3 rounded-xl flex flex-col items-center gap-2 text-center cursor-default"
                  style={{
                    background: `${a.color}08`,
                    border: `1px solid ${a.color}25`,
                  }}
                >
                  <span className="text-2xl">{a.emoji}</span>
                  <div
                    className="text-xs font-semibold leading-tight"
                    style={{ color: a.color }}
                  >
                    {a.name}
                  </div>
                  <div
                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ background: `${a.color}15`, color: `${a.color}99` }}
                  >
                    {a.rarity}
                  </div>
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 p-2 rounded-lg bg-gray-900 border border-gray-700 text-[10px] text-gray-400 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                    {a.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Wallets */}
        {!analysis && !loading && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white text-center">Featured Wallets</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {FEATURED_WALLETS.map((fw) => (
                <button
                  key={fw.address}
                  onClick={() => handleAnalyze(fw.address, fw.network)}
                  className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-emerald-700 transition-colors text-left space-y-2 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{fw.emoji}</span>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        {fw.archetype}
                      </div>
                      <div className="text-xs text-gray-500">{fw.label}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 font-mono truncate">
                    {fw.address.slice(0, 16)}...{fw.address.slice(-8)}
                  </div>
                  <div className="text-xs text-emerald-600 group-hover:text-emerald-400 transition-colors">
                    Click to analyze →
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Analyses */}
        {!analysis && !loading && recentAnalyses.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-400 text-center uppercase tracking-wider">
              Recent
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {recentAnalyses.map((r) => (
                <button
                  key={r.address}
                  onClick={() => handleAnalyze(r.address)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900/70 border border-gray-800 hover:border-emerald-700 text-sm transition-colors group"
                >
                  <span className="text-base">{r.archetypeEmoji}</span>
                  <span className="text-gray-300 group-hover:text-emerald-400 transition-colors font-mono text-xs">
                    {r.address.slice(0, 6)}...{r.address.slice(-4)}
                  </span>
                  <span className="text-gray-500 text-xs">{r.archetypeName}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Feature Pills */}
        {!analysis && !loading && (
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {features.map((f) => (
              <div
                key={f}
                className="px-4 py-2 rounded-full bg-gray-900 border border-gray-800 text-sm text-gray-400"
              >
                {f}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global keyframe for stats pulse */}
      <style>{`
        @keyframes statPulse {
          0% { opacity: 0; transform: translateY(6px) scale(0.95); }
          60% { opacity: 1; transform: translateY(-2px) scale(1.04); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Footer */}
      <footer className="border-t border-gray-800/40 px-6 py-8 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span>🧬</span>
            <span className="font-semibold text-gray-500">Mantle DNA</span>
            <span>—</span>
            <span>Built on Mantle Network</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/about"
              className="hover:text-emerald-500 transition-colors"
            >
              About
            </a>
            <a
              href="https://mantle.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-500 transition-colors"
            >
              Mantle ↗
            </a>
            <a
              href="https://explorer.sepolia.mantle.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-500 transition-colors"
            >
              Explorer ↗
            </a>
            <a
              href="https://dorahacks.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-500 transition-colors"
            >
              DoraHacks ↗
            </a>
            <a
              href="https://github.com/888marui/mantle-dna"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-500 transition-colors"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

const features = [
  "🔗 Mantle Network",
  "🧬 7 Archetypes",
  "🎭 Soulbound NFT",
  "⚡ Instant Analysis",
  "🔒 Non-Transferable",
  "📊 On-chain Scores",
];
