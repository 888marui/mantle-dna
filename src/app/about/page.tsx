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
            Mantle DNA is an AI-powered wallet personality profiler built for Mantle Network.
            It analyzes on-chain behavior to generate a unique &quot;DNA archetype&quot; for any wallet,
            rendered as a visual genome and optionally minted as a Soulbound NFT on Mantle.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Tech Stack</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "Next.js 14", role: "App Router, API routes, Edge runtime OG images", icon: "⚡" },
              { name: "Mantle RPC (dual-network)", role: "Live MNT balance, tx count, ERC-20 tokens (USDT/USDC/mETH/WMNT) on Mainnet & Sepolia", icon: "🔗" },
              { name: "Claude Haiku", role: "AI wallet personality analysis via Anthropic SDK — references real token holdings and scores", icon: "🤖" },
              { name: "viem + wagmi v2", role: "Type-safe Ethereum + ERC-20 readContract, wallet connect for both chains", icon: "🔧" },
              { name: "next/og (ImageResponse)", role: "Dynamic 1200×630 OG cards with network badge, Mantle Score, downloadable as DNA Certificates", icon: "🖼️" },
              { name: "ERC-721 Soulbound NFT", role: "Non-transferable on-chain identity with AI insight keccak256 hash", icon: "🎭" },
              { name: "Hardhat + Solidity 0.8.20", role: "Smart contract with self-mint, oracle-mint, and full test coverage", icon: "⛓️" },
              { name: "Tailwind CSS + SVG", role: "Animated DNA helix with ATCG labels, radar chart, base composition", icon: "🎨" },
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
                step: "1. Dual-Network On-Chain Analysis",
                desc: "Submit a wallet address with Mantle Mainnet or Sepolia selection. We fetch the real MNT balance, transaction nonce, and on Mainnet — real ERC-20 token balances (USDT, USDC, mETH, WMNT) via readContract. These feed into a trait computation engine calculating DeFi Engagement, HODLing, Protocol Diversity, and On-chain Activity scores (0–1000 each), adjusted by actual token holdings. A Mantle Ecosystem Score (0-100) is also computed from on-chain engagement signals.",
              },
              {
                step: "2. Rule-Based Archetype Classification",
                desc: "A deterministic classifier maps trait scores to one of 7 archetypes: DeFi Degen (deFiScore > 800), Diamond Hands (holdScore > 800), Yield Farmer (diversity > 700 + defi > 500), Trader (activityScore > 750), Whale (balance > 100 MNT), Newcomer (txCount < 5), or NFT Collector (balanced profile). The classification reason is displayed transparently on the card.",
              },
              {
                step: "3. AI Personality Profile",
                desc: "Claude Haiku (claude-haiku-4-5-20251001) generates a unique insight, 3 on-chain strengths, a risk watch-out, and a Mantle ecosystem prediction — grounded in the wallet's actual trait scores and network context. A deterministic fallback ensures insights always display even without an API key.",
              },
              {
                step: "4. Visual DNA + Social Sharing + Evolution Path",
                desc: "The wallet genome is rendered as: an animated double helix with labeled A-T/C-G base pairs, a 4-axis radar chart, a 32-character ATCG sequence, and a base composition breakdown (% A, T, C, G unique to each address). A DNA Evolution Path shows the next archetype to unlock, with score progress bars and 2 actionable Mantle protocol cards. Each wallet gets a shareable URL with a dynamically generated OG image (with network badge + Mantle Score) downloadable as a 1200×630 DNA Certificate PNG.",
              },
              {
                step: "5. Soulbound NFT Mint",
                desc: "The DNA traits (archetype, scores, analyzed-at timestamp, and a keccak256 hash of the AI insight text) are encoded into an ERC-721 Soulbound NFT on Mantle. Transfers are blocked at the contract level. Wallets can self-mint their own DNA, or an authorized oracle can mint on behalf of wallets. The frontend checks the on-chain mint status in real-time and shows the token ID if already minted.",
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
          <h2 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">7 DNA Archetypes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {[
              { emoji: "🔥", name: "DeFi Degen", rule: "deFiScore > 800", color: "#f97316" },
              { emoji: "💎", name: "Diamond Hands", rule: "holdScore > 800", color: "#06b6d4" },
              { emoji: "🎨", name: "NFT Collector", rule: "Balanced profile", color: "#a855f7" },
              { emoji: "🌾", name: "Yield Farmer", rule: "diversity > 700 + defi > 500", color: "#22c55e" },
              { emoji: "🌱", name: "Newcomer", rule: "txCount < 5", color: "#10b981" },
              { emoji: "🐋", name: "Whale", rule: "balance > 100 MNT", color: "#3b82f6" },
              { emoji: "📊", name: "Trader", rule: "activityScore > 750", color: "#eab308" },
            ].map((a) => (
              <div key={a.name} className="px-3 py-2.5 rounded-lg bg-gray-900 border border-gray-800 flex items-center gap-2">
                <span className="text-base">{a.emoji}</span>
                <div>
                  <div className="font-semibold" style={{ color: a.color }}>{a.name}</div>
                  <div className="text-gray-600 text-[10px] font-mono">{a.rule}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Mantle Ecosystem Integration</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Each archetype maps to a curated set of Mantle protocols based on behavioral affinity.
            Protocol badges on the DNA card link directly to each protocol.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
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

        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/50 space-y-2">
          <div className="text-sm font-semibold text-emerald-400">Built for Mantle Turing Test Hackathon 2026</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
            <div>⚡ Technical Depth — AI + RPC + SBT + OG</div>
            <div>💡 Innovation — DNA metaphor + social sharing</div>
            <div>🔗 Mantle Ecosystem — 8 protocol integrations</div>
            <div>✅ Product Complete — end-to-end working flow</div>
          </div>
        </div>
      </div>
    </main>
  );
}
