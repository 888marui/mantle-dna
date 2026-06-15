"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { analyzeWallet, type WalletAnalysis, type NetworkType } from "@/lib/analyzer";
import { DNACard } from "@/components/DNACard";
import { DNAVisualizer } from "@/components/DNAVisualizer";
import { WalletButton } from "@/components/WalletButton";
import Link from "next/link";

const LOADING_STAGES = [
  "Fetching on-chain data...",
  "Computing DNA traits...",
  "Running AI analysis...",
];

const ARCHETYPE_RARITY: Record<number, string> = {
  0: "12% of wallets", 1: "18% of wallets", 2: "22% of wallets",
  3: "8% of wallets", 4: "25% of wallets", 5: "3% of wallets", 6: "12% of wallets",
};

export default function WalletPage({ params }: { params: { address: string } }) {
  const { address } = params;
  const searchParams = useSearchParams();
  const network: NetworkType = searchParams.get('network') === 'mainnet' ? 'mainnet' : 'sepolia';
  const [analysis, setAnalysis] = useState<WalletAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState(0);
  const [blockNumber, setBlockNumber] = useState<number | null>(null);

  const rpcUrl = network === 'mainnet'
    ? (process.env.NEXT_PUBLIC_MANTLE_MAINNET_RPC || "https://rpc.mantle.xyz")
    : (process.env.NEXT_PUBLIC_MANTLE_RPC || "https://rpc.sepolia.mantle.xyz");

  const fetchBlock = useCallback(() => {
    fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.result) setBlockNumber(parseInt(d.result, 16)); })
      .catch(() => {});
  }, [rpcUrl]);

  useEffect(() => {
    fetchBlock();
  }, [fetchBlock]);

  useEffect(() => {
    if (!loading) { setLoadingStage(0); return; }
    setLoadingStage(0);
    const interval = setInterval(() => {
      setLoadingStage((prev) => (prev + 1) % LOADING_STAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

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

          {/* Right: live block + wallet button */}
          <div className="flex items-center gap-3">
            {blockNumber && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-600 font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                #{blockNumber.toLocaleString()}
              </div>
            )}
            <WalletButton />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-16">
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

        {/* Error */}
        {error && !loading && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Results */}
        {analysis && !loading && (
          <div className="space-y-6">
            {/* Certificate header — styled with archetype color */}
            {(() => {
              const ARCHETYPE_COLORS: Record<number, string> = {
                0: "#f97316", 1: "#06b6d4", 2: "#a855f7", 3: "#22c55e",
                4: "#10b981", 5: "#3b82f6", 6: "#eab308",
              };
              const color = ARCHETYPE_COLORS[analysis.archetype] ?? "#10b981";
              return (
                <div className="text-center space-y-2 py-4 relative">
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse 60% 100% at 50% 0%, ${color}12 0%, transparent 70%)` }}
                  />
                  <div className="text-xs uppercase tracking-widest" style={{ color: `${color}80` }}>
                    DNA Certificate · Mantle Network
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {analysis.archetypeEmoji} {analysis.archetypeName}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {address.slice(0, 14)}...{address.slice(-12)}
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>
                      {ARCHETYPE_RARITY[analysis.archetype] ?? "Rare"}
                    </span>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-500">
                      DNA Strength {Math.round((analysis.deFiScore + analysis.holdScore + analysis.diversityScore + analysis.activityScore) / 40)}%
                    </span>
                    <span className="text-gray-600">·</span>
                    <span className="px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>
                      Mantle Score {analysis.mantleScore}/100
                    </span>
                    <span className="text-gray-600">·</span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                      {analysis.network === 'mainnet' ? '🟢 Mainnet' : '🔵 Sepolia'}
                    </span>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DNACard analysis={analysis} onMintDNA={() => {}} />
              <DNAVisualizer analysis={analysis} />
            </div>

            {/* Share row */}
            {(() => {
              const shareText = `🧬 My Mantle DNA: ${analysis.archetypeName} ${analysis.archetypeEmoji}\n\nDeFi: ${analysis.deFiScore}/1000 | HODL: ${analysis.holdScore}/1000 | Mantle Score: ${analysis.mantleScore}/100\n\n${analysis.aiInsight || analysis.description}\n\nDiscover yours 👇\nhttps://mantle-dna.xyz/wallet/${address}?network=${analysis.network}\n#MantleDNA #Mantle #Web3`;
              const walletShareUrl = `https://mantle-dna.xyz/wallet/${address}?network=${analysis.network}`;
              return (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black hover:bg-gray-900 text-white text-sm font-medium border border-gray-700 transition-colors"
                  >
                    Share on 𝕏
                  </a>
                  <a
                    href={`https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(walletShareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-colors hover:opacity-80"
                    style={{ background: "#7c3aed", border: "1px solid #6d28d9" }}
                  >
                    ⬡ Farcaster
                  </a>
                  <a
                    href={`/api/og?${new URLSearchParams({
                      address,
                      archetype: String(analysis.archetype),
                      defi: String(analysis.deFiScore),
                      hodl: String(analysis.holdScore),
                      diversity: String(analysis.diversityScore),
                      activity: String(analysis.activityScore),
                      network: analysis.network,
                      mantleScore: String(analysis.mantleScore),
                      download: "1",
                    }).toString()}`}
                    download={`mantle-dna-${analysis.archetypeName.toLowerCase().replace(/\s/g, "-")}-${address.slice(0, 8)}.png`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 text-sm font-medium border border-gray-700 transition-colors"
                  >
                    ↓ Certificate
                  </a>
                  <a
                    href={`/compare?a=${address}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 text-sm font-medium border border-gray-700 transition-colors"
                  >
                    🔬 Compare wallets
                  </a>
                  <Link
                    href="/"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 text-sm font-medium border border-gray-700 transition-colors"
                  >
                    🧬 Analyze your wallet
                  </Link>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </main>
  );
}
