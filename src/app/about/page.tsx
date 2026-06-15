import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Mantle DNA",
  description: "Technical architecture and innovation behind Mantle DNA",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-gray-800/60 px-6 py-4 backdrop-blur-sm sticky top-0 z-10 bg-[#0a0a0a]/90">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl">🧬</span>
            <span className="text-xl font-bold text-white tracking-tight">Mantle DNA</span>
          </Link>
          <Link href="/" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            ← Try it
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white">About Mantle DNA</h1>
          <p className="text-gray-400 leading-relaxed">
            Mantle DNA is an AI-powered wallet personality profiler built for the Mantle Network.
            It analyzes on-chain behavior to generate a unique &quot;DNA archetype&quot; for any wallet,
            minted as a soulbound NFT on Mantle Sepolia.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Tech Stack</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "Next.js 14", role: "App Router, API routes, Edge runtime", icon: "⚡" },
              { name: "Mantle RPC", role: "Real-time balance + transaction count", icon: "🔗" },
              { name: "Claude Haiku", role: "AI wallet personality analysis", icon: "🤖" },
              { name: "viem + wagmi", role: "Type-safe Ethereum interactions", icon: "🔧" },
              { name: "next/og (ImageResponse)", role: "Dynamic 1200×630 OG card generation", icon: "🖼️" },
              { name: "ERC-721 Soulbound NFT", role: "Non-transferable on-chain identity", icon: "🎭" },
              { name: "Hardhat + Solidity", role: "Smart contract development", icon: "⛓️" },
              { name: "Tailwind CSS", role: "Utility-first styling", icon: "🎨" },
            ].map((item) => (
              <div key={item.name} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex gap-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-white">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">How It Works</h2>
          <div className="space-y-3">
            {[
              {
                step: "1. On-Chain Analysis",
                desc: "When you submit a wallet address, we fetch the real MNT balance and transaction count from Mantle Sepolia via RPC. These feed into a deterministic trait computation engine that calculates DeFi, HODLing, Diversity, and Activity scores (0-1000 each).",
              },
              {
                step: "2. Archetype Classification",
                desc: "A rule-based classifier maps trait scores to one of 7 archetypes: DeFi Degen, Diamond Hands, NFT Collector, Yield Farmer, Newcomer, Whale, or Trader. Archetype selection is deterministic — the same address always gets the same archetype.",
              },
              {
                step: "3. AI Personality Profile",
                desc: "Claude Haiku (claude-haiku-4-5-20251001) generates a unique narrative insight, 3 on-chain strengths, a risk watch-out, and a Mantle ecosystem prediction — all grounded in the wallet's actual trait scores. A deterministic fallback ensures insights always display even without an API key.",
              },
              {
                step: "4. Visual DNA + Sharing",
                desc: "The wallet's genome is rendered as an animated double helix, a 4-axis radar chart, and a unique ATCG base sequence. Users get a shareable /wallet/[address] URL with a dynamically generated 1200×630 OG image for rich Twitter previews.",
              },
              {
                step: "5. Soulbound NFT Mint",
                desc: "The DNA traits (archetype, scores, analyzed-at timestamp, and a keccak256 hash of the AI insight) are encoded into an ERC-721 Soulbound NFT on Mantle Sepolia. Transfers are blocked at the contract level, making it a permanent on-chain identity token.",
              },
            ].map((item) => (
              <div key={item.step} className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 space-y-1">
                <div className="text-sm font-semibold text-emerald-400">{item.step}</div>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Mantle Ecosystem Integration</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Each archetype maps to a curated set of Mantle protocols based on behavioral affinity:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {[
              "Agni Finance", "Merchant Moe", "Init Capital",
              "mETH Protocol", "Lendle", "FBTC",
              "Mantle Bridge", "Mantle NFT Market",
            ].map((p) => (
              <div key={p} className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 text-center">
                {p}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/50 space-y-1">
          <div className="text-sm font-semibold text-emerald-400">Built for Mantle Turing Test Hackathon 2026</div>
          <p className="text-xs text-gray-500">
            Demonstrates Technical Depth (AI + on-chain), Innovation (DNA metaphor, OG sharing),
            Mantle Ecosystem (7 protocol integrations), and Product Completeness (end-to-end flow).
          </p>
        </div>
      </div>
    </main>
  );
}
