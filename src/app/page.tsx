"use client";

import { useAccount } from "wagmi";
import { WalletButton } from "@/components/WalletButton";
import { useState } from "react";
import { analyzeWallet, type WalletAnalysis } from "@/lib/analyzer";
import { DNACard } from "@/components/DNACard";
import { DNAVisualizer } from "@/components/DNAVisualizer";
import { SearchBar } from "@/components/SearchBar";

const FEATURED_WALLETS = [
  {
    address: "0x000000000000000000000000000000000000dEaD",
    archetype: "Diamond Hands",
    emoji: "💎",
    label: "Dead Address",
  },
  {
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    archetype: "DeFi Degen",
    emoji: "🔥",
    label: "Vitalik.eth",
  },
  {
    address: "0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326",
    archetype: "Trader",
    emoji: "📊",
    label: "MEV Builder",
  },
];

const STATS = [
  { label: "Hackers", value: "1,500+" },
  { label: "Network", value: "Mantle Testnet" },
  { label: "Analysis", value: "AI-Powered" },
  { label: "Prize Pool", value: "$100K" },
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const [analysis, setAnalysis] = useState<WalletAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (walletAddress: string) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzeWallet(walletAddress);
      setAnalysis(result);
    } catch {
      setError("Failed to analyze wallet. Make sure it's a valid Mantle address.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeSelf = () => {
    if (address) handleAnalyze(address);
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
          <WalletButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        {/* Hero */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Discover Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
              On-Chain DNA
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Enter any Mantle wallet address to instantly reveal its unique on-chain personality profile — powered by AI analysis and minted as a Soulbound NFT.
          </p>
          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-6 pt-2">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
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
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="text-5xl animate-spin">🧬</div>
            <p className="text-gray-400">Sequencing on-chain DNA...</p>
          </div>
        )}

        {/* Results */}
        {analysis && !loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DNACard analysis={analysis} onMintDNA={() => {}} />
              <DNAVisualizer analysis={analysis} />
            </div>
            {/* Share on X after analysis */}
            <div className="flex justify-center">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `🧬 Just discovered my Mantle DNA: I'm a ${analysis.archetypeName} ${analysis.archetypeEmoji}\n\nDeFi: ${analysis.deFiScore}/1000 | HODL: ${analysis.holdScore}/1000\n\n${analysis.aiInsight || analysis.description}\n\nDiscover your on-chain DNA 👇\nmantle-dna.xyz\n#MantleDNA #Mantle #Web3`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-black hover:bg-gray-900 text-white text-sm font-semibold border border-gray-700 transition-colors"
              >
                <span>Share your DNA on 𝕏</span>
              </a>
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
                  onClick={() => handleAnalyze(fw.address)}
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
