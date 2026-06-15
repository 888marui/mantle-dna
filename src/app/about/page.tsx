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
          <div className="flex items-center gap-4">
            <Link href="/compare" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
              Compare
            </Link>
            <Link href="/" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
              ← Try it
            </Link>
          </div>
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
              { name: "5× REST APIs + 2× OG image routes", role: "GET /api/wallet, GET /api/compare, POST /api/batch, GET /api/health — public, CORS-enabled, full OPTIONS support. GET /api/og and GET /api/og-compare for dynamic image generation", icon: "🌐" },
              { name: "next/og (ImageResponse)", role: "Dynamic 1200×630 OG cards — /api/og for single wallet DNA Certificates, /api/og-compare for side-by-side comparison cards", icon: "🖼️" },
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
                step: "4. Visual DNA + Social Sharing + Evolution Path + Comparison",
                desc: "The wallet genome is rendered as: an animated double helix with labeled A-T/C-G base pairs, a 4-axis radar chart, a 32-character ATCG sequence, and a base composition breakdown (% A, T, C, G unique to each address). A DNA Evolution Path shows the next archetype to unlock, with score progress bars and 2 actionable Mantle protocol cards. The /compare page lets you compare two wallets side-by-side with a DNA Compatibility Score (0-100), DNA Distance metric, per-trait comparison bars, and archetype-pair commentary. Each wallet gets a shareable URL with a dynamically generated OG image (with network badge + Mantle Score) downloadable as a 1200×630 DNA Certificate PNG.",
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
          <h2 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Public REST API</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Mantle DNA exposes a public JSON API for on-chain wallet analysis and comparison — no auth required, CORS-enabled.
            Returns DNA scores, archetype, Mantle Ecosystem Score, live token balances, and cross-wallet compatibility.
            Start at <span className="font-mono text-emerald-500">GET /api/health</span> for a full endpoint listing.
          </p>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 font-mono text-xs space-y-2">
              <a href="/api/health" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors">GET /api/health ↗</a>
              <div className="text-gray-500 text-[11px] leading-relaxed">{`{ "status": "ok", "service": "Mantle DNA API", "endpoints": { ... }, "networks": ["mainnet", "sepolia"] }`}</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 font-mono text-xs space-y-2">
              <div className="text-emerald-400">POST /api/batch</div>
              <div className="text-gray-600 text-[11px]">Body: {"{ \"addresses\": [\"0x...\", \"0x...\"], \"network\": \"mainnet\" }"}</div>
              <div className="text-gray-500 text-[11px] leading-relaxed">{`{
  "results": [{ "address": "0x...", "status": "ok", "data": { ...wallet analysis } }, ...],
  "summary": { "total": 3, "successful": 3, "archetypeDistribution": { "Whale": 1, "Trader": 2 }, "topArchetype": {...} },
  "analyzedAt": "2026-06-15T08:30:00.000Z"
}`}</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 font-mono text-xs space-y-2">
              <div className="text-emerald-400">GET /api/wallet/{"{address}"}?network=mainnet</div>
              <div className="text-gray-500 text-[11px] leading-relaxed">{`{
  "address": "0x...",
  "network": "mainnet",
  "mntBalance": "12.3400",
  "txCount": 42,
  "tokenBalances": { "mETH": "1.50", "WMNT": "5.00" },
  "archetype": 3,
  "archetypeName": "Yield Farmer",
  "scores": { "deFiScore": 720, "holdScore": 580, "diversityScore": 810, "activityScore": 340 },
  "mantleScore": 65,
  "dnaStrength": 61,
  "explorerUrl": "https://explorer.mantle.xyz/address/0x...",
  "analyzedAt": "2026-06-15T08:30:00.000Z"
}`}</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 font-mono text-xs space-y-2">
              <div className="text-emerald-400">GET /api/compare?a={"{address}"}&b={"{address}"}&network=mainnet</div>
              <div className="text-gray-500 text-[11px] leading-relaxed">{`{
  "walletA": { "address": "0x...", "archetype": 0, "archetypeName": "DeFi Degen", "scores": {...}, "mantleScore": 45 },
  "walletB": { "address": "0x...", "archetype": 1, "archetypeName": "Diamond Hands", "scores": {...}, "mantleScore": 72 },
  "comparison": {
    "compatibility": 40,
    "dnaDistance": 0.83,
    "scoreDiffs": { "deFiScore": 320, "holdScore": -410, "diversityScore": 65, "activityScore": 190 },
    "dominantTraitA": "activityScore",
    "dominantTraitB": "holdScore"
  },
  "analyzedAt": "2026-06-15T08:30:00.000Z"
}`}</div>
            </div>
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

        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/50 space-y-3">
          <div className="text-sm font-semibold text-emerald-400">Built for Mantle Turing Test Hackathon 2026</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="space-y-0.5">
              <div className="text-gray-300 font-medium">⚡ Technical Depth (30%)</div>
              <div className="text-gray-600">4× live ERC-20 balances (USDT/USDC/mETH/WMNT) · Claude Haiku AI · keccak256 on-chain AI hash · Edge OG images (/api/og + /api/og-compare) · per-wallet opengraph-image.tsx · Hardhat SBT contract · 5× public REST APIs (wallet, compare, batch, health + archetypeReason field) with CORS + OPTIONS + caching · in-memory analysis cache · sitemap + robots.txt</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-gray-300 font-medium">💡 Innovation (25%)</div>
              <div className="text-gray-600">DNA metaphor + ATCG visualization · DNA Evolution Path showing next archetype · Mantle Ecosystem Score (0-100) with Bronze/Silver/Gold/Platinum tiers · Achievement badges · X + Farcaster sharing · DNA Comparison with compatibility score + DNA distance metric</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-gray-300 font-medium">🔗 Mantle Ecosystem (25%)</div>
              <div className="text-gray-600">8 protocol integrations with direct links · WMNT + mETH live tracking · Protocol affinity per archetype · Evolution Path with protocol action cards</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-gray-300 font-medium">✅ Product Complete (20%)</div>
              <div className="text-gray-600">Analyze → AI insight → visualize → share (𝕏 + Farcaster) → download DNA Certificate → mint SBT · Compare wallets via /compare with X + Farcaster sharing + downloadable comparison card · Auto-analyze on paste/connect · Example pairs auto-analyze · Dual-network · Shareable URLs · robots.txt + sitemap.xml</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
