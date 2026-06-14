"use client";

import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { useState } from "react";
import { analyzeWallet, type WalletAnalysis } from "@/lib/analyzer";
import { DNACard } from "@/components/DNACard";
import { DNAVisualizer } from "@/components/DNAVisualizer";
import { SearchBar } from "@/components/SearchBar";

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
    } catch (e) {
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
          <ConnectKitButton />
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DNACard analysis={analysis} onMintDNA={() => {}} />
            <DNAVisualizer analysis={analysis} />
          </div>
        )}

        {/* Feature Pills */}
        {!analysis && !loading && (
          <div className="flex flex-wrap justify-center gap-3 pt-8">
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
