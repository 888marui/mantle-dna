# 🧬 Mantle DNA

**Discover your on-chain identity. Evolve it. Mint it forever.**

Mantle DNA analyzes any Mantle wallet address and generates a unique personality profile — backed by real ERC-20 token data and Claude AI — then shows your DNA Evolution Path and mints your identity as a Soulbound NFT on Mantle Network.

🔗 **Live Demo:** https://mantle-dna.xyz

---

## What It Does

Paste any Mantle wallet address and instantly receive:

- **DNA Archetype** — one of 7 on-chain personality types determined by real wallet behavior
- **Mantle Ecosystem Score (0-100)** — composite engagement metric from live MNT balance, mETH/WMNT/stablecoin holdings, tx count, and token diversity
- **DNA Scores (0-1000 each)** — DeFi Engagement, HODLing, Protocol Diversity, Activity — adjusted by real ERC-20 data on mainnet
- **AI Insight** — Claude Haiku generates personalized analysis, strengths, risk watch-out, and Mantle ecosystem prediction
- **DNA Evolution Path** — shows your next archetype to unlock with score progress bars and clickable Mantle protocol action cards
- **Visual Genome** — animated double helix with A-T/C-G base pair labels, 4-axis radar chart, ATCG sequence, and base composition breakdown
- **Soulbound NFT** — mint your DNA as a non-transferable ERC-721 on Mantle; AI insight hash stored permanently on-chain
- **Social Sharing** — share on 𝕏 or ⬡ Farcaster; download a 1200×630 DNA Certificate PNG

### 7 DNA Archetypes

| Archetype | Trigger Condition |
|---|---|
| 🔥 DeFi Degen | deFiScore > 800 |
| 💎 Diamond Hands | holdScore > 800 |
| 🌾 Yield Farmer | diversity > 700 AND defi > 500 |
| 📊 Trader | activityScore > 750 |
| 🐋 Whale | MNT balance > 100 |
| 🌱 Newcomer | txCount < 5 |
| 🎨 NFT Collector | balanced profile (default) |

---

## Technical Architecture

### On-Chain Data Layer

```
Mantle RPC (mainnet + sepolia)
├── eth_getBalance          → MNT balance
├── eth_getTransactionCount → real tx nonce
├── eth_blockNumber         → latest block
└── ERC-20 readContract (mainnet only)
    ├── USDT  0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE
    ├── USDC  0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9
    ├── mETH  0xcDA86A272531e8640cD7F1a92c01839911B90bb0
    └── WMNT  0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8
```

Token holdings directly adjust DNA scores:
- **mETH** → +HODLing score (up to +200), +DeFi score (up to +100)
- **WMNT** → +DeFi score (up to +150), +Diversity score (up to +100)
- **Stablecoins** → +DeFi score (up to +100)
- **Multi-token** → +Diversity score (+80 per additional token)

### AI Integration

```
Claude Haiku (claude-haiku-4-5-20251001)
Input:  address + network + token holdings + 4 DNA scores
Output: { insight, strengths[3], watchOut, prediction }
```

The AI insight text is `keccak256`-hashed and stored permanently in the `DNATraits` struct on-chain, creating a verifiable link between Claude's output and the NFT.

Deterministic fallbacks ensure insights always display even without an API key.

### DNA Evolution Path

For each archetype, a deterministic evolution target is computed:
- **Newcomer → Trader**: shows tx count and activity score progress
- **Trader → Diamond Hands**: shows HODLing score progress toward 800
- **Diamond Hands → Yield Farmer**: shows DeFi + Diversity progress
- **Yield Farmer → DeFi Degen**: shows DeFi score progress toward 800
- etc.

Each evolution shows 2 clickable Mantle protocol action cards (Agni Finance, mETH Protocol, Init Capital, Lendle, Merchant Moe, Mantle Bridge).

### Mantle Ecosystem Score (0-100)

Computed from real on-chain signals:
```
+20  MNT balance > 0.001
+10  MNT balance > 1
+20  mETH holdings > 0
+15  Stablecoin holdings > 0
+10  WMNT holdings > 0
+10  txCount > 5
+10  txCount > 20
+5   2+ tokens held
```

Achievement badges are awarded for: MNT Holder, mETH Staker, Stable User, DeFi Active, On-chain Veteran.

---

## Full Stack Architecture

```
┌──────────────────────────────────────────────────────┐
│                 Frontend (Next.js 14)                 │
│  Landing → SearchBar → DNACard + DNAVisualizer       │
│  ShareButton (𝕏 + Farcaster + Certificate)           │
│  Wallet page (/wallet/[address]?network=mainnet)     │
└──────────┬───────────────────────────────────────────┘
           │
┌──────────▼───────────────────────────────────────────┐
│             analyzer.ts (core engine)                 │
│  1. Parallel: getBalance + getTransactionCount +     │
│     getBlockNumber + 4× ERC-20 readContract          │
│  2. computeTraitsFromAddress (+ token adjustments)   │
│  3. computeMantleScore (0-100)                       │
│  4. POST /api/analyze → Claude Haiku                 │
│  5. Fallback insights if AI unavailable              │
└──────────┬──────────────┬────────────────────────────┘
           │              │
┌──────────▼──────┐  ┌────▼─────────────────────────┐
│  Mantle RPC     │  │  Anthropic API               │
│  Mainnet+Sepolia│  │  claude-haiku-4-5-20251001   │
└─────────────────┘  └──────────────────────────────┘
           │
┌──────────▼───────────────────────────────────────────┐
│         WalletDNA.sol (Mantle Sepolia)                │
│  ERC-721 Soulbound: transfers permanently blocked    │
│  DNATraits: archetype + 4 scores + aiInsightHash    │
└──────────────────────────────────────────────────────┘
```

---

## Smart Contract

**Network:** Mantle Sepolia Testnet (Chain ID: 5003)

**File:** `blockchain/contracts/WalletDNA.sol`

```solidity
struct DNATraits {
    Archetype archetype;    // 7 personality types
    uint16 txCount;
    uint16 deFiScore;       // 0-1000
    uint16 holdScore;       // 0-1000
    uint16 diversityScore;  // 0-1000
    uint16 activityScore;   // 0-1000
    uint32 firstSeenBlock;
    uint32 analyzedAt;
    bytes32 aiInsightHash;  // keccak256(claude_insight_text)
}
```

Key properties:
- **Soulbound**: `_beforeTokenTransfer` reverts on non-mint, forever
- **One NFT per wallet**: duplicate mint reverts
- **Self-mint + oracle-mint**: wallet can mint its own, or authorized oracle can batch mint
- **On-chain verification**: anyone can verify the AI insight by hashing and comparing to `aiInsightHash`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Web3 | wagmi v2, viem (`readContract`, `writeContract`), injected connector |
| AI | Claude Haiku (`claude-haiku-4-5-20251001`) via Anthropic SDK |
| OG Images | `next/og` ImageResponse (edge runtime) — `/api/og` (wallet certificate) + `/api/og-compare` (side-by-side comparison), per-wallet `opengraph-image.tsx` |
| Contract | Solidity 0.8.20, OpenZeppelin ERC-721, Hardhat |
| Networks | Mantle Mainnet (5000) + Sepolia Testnet (5003) |
| Deployment | Vercel (frontend), Hardhat (contract) |

---

## Mantle Ecosystem Integrations

8 protocols referenced in DNA Evolution Path + Protocol Affinity:

| Protocol | Role in DNA |
|---|---|
| [Agni Finance](https://agni.finance) | DeFi Degen + Yield Farmer LP actions |
| [Merchant Moe](https://merchantmoe.com) | Trader DEX activity |
| [Init Capital](https://init.capital) | Leveraged yield for DeFi Degen + Whale |
| [mETH Protocol](https://meth.mantle.xyz) | HODLing + mETH staking (live balance tracked) |
| [Lendle](https://lendle.xyz) | Diamond Hands + Whale passive yield |
| [FBTC](https://fbtc.io) | Diamond Hands BTC exposure |
| [Mantle Bridge](https://bridge.mantle.xyz) | Newcomer onboarding first step |
| [Mantle NFT Market](https://mantle.xyz/ecosystem) | NFT Collector |

---

## Running Locally

```bash
git clone https://github.com/888marui/mantle-dna
cd mantle-dna
npm install

# .env.local
ANTHROPIC_API_KEY=your_key_here
# Optional (defaults provided):
NEXT_PUBLIC_MANTLE_MAINNET_RPC=https://rpc.mantle.xyz
NEXT_PUBLIC_MANTLE_RPC=https://rpc.sepolia.mantle.xyz
NEXT_PUBLIC_WALLET_DNA_ADDRESS=0x0000000000000000000000000000000000000000

npm run dev
```

### Deploy Smart Contract

```bash
cd blockchain
npm install

# .env
PRIVATE_KEY=your_wallet_private_key
MANTLE_TESTNET_RPC=https://rpc.sepolia.mantle.xyz

npx hardhat test
npx hardhat run scripts/deploy.js --network mantle_testnet
# → Set NEXT_PUBLIC_WALLET_DNA_ADDRESS in Vercel to the deployed address
```

---

## Public REST API

All endpoints are CORS-enabled with full OPTIONS preflight support.

```
GET  /api/wallet/{address}?network=mainnet|sepolia   → DNA analysis JSON (+ archetypeReason)
GET  /api/compare?a={addr}&b={addr}&network=...      → side-by-side DNA comparison
POST /api/batch                                      → batch up to 10 wallets, sorted by Mantle Score
GET  /api/health                                     → endpoint directory
GET  /api/og?address=...                             → 1200×630 wallet DNA certificate PNG
GET  /api/og-compare?a=...&b=...&compat=...          → 1200×630 comparison card PNG
```

---

## Built for Mantle Turing Test Hackathon 2026

- ⚡ **Technical Depth** — 4× live ERC-20 balances, Claude Haiku AI, keccak256 on-chain AI hash, 5× public REST APIs + 2× edge OG image routes, per-wallet `opengraph-image.tsx`, in-memory analysis cache, archetypeReason field, sitemap + robots.txt
- 💡 **Innovation** — DNA metaphor + ATCG visualization + Evolution Path + Bronze/Silver/Gold/Platinum tier system + DNA Comparison with compatibility score + DNA distance + downloadable comparison card
- 🔗 **Mantle Ecosystem** — 8 protocol integrations, live WMNT/mETH/stablecoin tracking, Mantle Ecosystem Score (0-100), protocol affinity per archetype, Evolution Path with protocol action cards
- ✅ **Product Complete** — analyze → AI insight → visualize → share (𝕏 + Farcaster) → download DNA Certificate → mint SBT · Compare wallets with auto-analyze example pairs · Dual-network · Shareable URLs
