"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { analyzeWallet, type WalletAnalysis, type NetworkType } from "@/lib/analyzer";
import { DNACard } from "@/components/DNACard";
import { DNAVisualizer } from "@/components/DNAVisualizer";
import { WalletButton } from "@/components/WalletButton";
import Link from "next/link";

export default function WalletPage({ params }: { params: { address: string } }) {
  const { address } = params;
  const searchParams = useSearchParams();
  const network: NetworkType = searchParams.get('network') === 'mainnet' ? 'mainnet' : 'sepolia';
  const [analysis, setAnalysis] = useState<WalletAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    analyzeWallet(address, network)
      .then((result) => {
        setAnalysis(result);
      })
      .catch(() => {
        setError("Failed to analyze wallet. Make sure it's a valid Mantle address.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [address, network]);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-gray-800/60 px-6 py-4 backdrop-blur-sm sticky top-0 z-10 bg-[#0a0a0a]/90">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Left: back link */}
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors"
          >
            <span>←</span>
            <span>Analyze another</span>
          </Link>

          {/* Center: page title */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <div className="text-sm font-semibold text-white">
              {analysis
                ? `${analysis.archetypeName} ${analysis.archetypeEmoji}`
                : "Decoding DNA..."}
            </div>
            <div className="text-xs text-gray-500 font-mono">
              {address.slice(0, 10)}...{address.slice(-8)}
            </div>
          </div>

          {/* Right: wallet button */}
          <WalletButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="text-5xl animate-spin">🧬</div>
            <p className="text-emerald-400 font-medium">Decoding on-chain DNA...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Results */}
        {analysis && !loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DNACard analysis={analysis} onMintDNA={() => {}} />
              <DNAVisualizer analysis={analysis} />
            </div>

            {/* Share on X */}
            <div className="flex justify-center">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `🧬 Just discovered my Mantle DNA: I'm a ${analysis.archetypeName} ${analysis.archetypeEmoji}\n\nDeFi: ${analysis.deFiScore}/1000 | HODL: ${analysis.holdScore}/1000\n\n${analysis.aiInsight || analysis.description}\n\nDiscover your on-chain DNA 👇\nmantle-dna.xyz/wallet/${address}${analysis.network === 'mainnet' ? '?network=mainnet' : ''}\n#MantleDNA #Mantle #Web3`
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
      </div>
    </main>
  );
}
