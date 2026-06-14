# 🧬 Mantle DNA

**Discover your on-chain identity. Mint it forever.**

Mantle DNA analyzes any Mantle wallet address and generates a unique personality profile — powered by Claude AI — then mints it as a Soulbound NFT on Mantle Network.

🔗 **Live Demo:** https://mantle-dna-git-claude-kind-t-8894e8-888marui-gmailcoms-projects.vercel.app

---

## What It Does

Paste any Mantle wallet address and instantly receive:

- **Archetype** — one of 7 on-chain personality types derived from wallet behavior
- **DNA Scores** — DeFi, HODLing, Diversity, and Activity scores (0–1000 each)
- **AI Insight** — Claude AI generates a personalized analysis of your Web3 personality
- **Soulbound NFT** — mint your DNA as a non-transferable ERC-721 token on Mantle Sepolia

### 7 Archetypes

| Archetype | Description |
|---|---|
| 🔥 DeFi Degen | High-frequency swaps, yield chasing, protocol hopping |
| 💎 Diamond Hands | Long-term holder, low churn, conviction buyer |
| 🎨 NFT Collector | Digital art and collectibles focused |
| 🌾 Yield Farmer | Liquidity provision and passive yield strategies |
| 🌱 Newcomer | Fresh wallet, beginning the Mantle journey |
| 🐋 Whale | High-value transactions, strategic market mover |
| 📊 Trader | Active DEX user, sharp execution timing |

---

## AI × On-Chain Integration

Mantle DNA uses **Claude Haiku** (via the Anthropic API) to generate personalized wallet insights from on-chain data:

```
Wallet on-chain data → Claude AI → JSON insight
{
  "insight": "2-sentence personality analysis",
  "strengths": ["trait 1", "trait 2", "trait 3"],
  "watchOut": "specific risk for this archetype",
  "prediction": "DeFi future prediction on Mantle"
}
```

The AI insight text is hashed (`keccak256`) and stored **permanently on-chain** in the `DNATraits` struct, creating a verifiable link between the AI output and the NFT.

---

## Architecture

```
┌──────────────────────────────────────────────┐
│            Frontend (Next.js 14)              │
│  SearchBar → analyzeWallet() → DNACard       │
│  + DNAVisualizer (SVG double helix)           │
└──────────┬───────────────────────────────────┘
           │
┌──────────▼───────────────────────────────────┐
│       analyzer.ts (wallet analysis)           │
│  1. Fetch balance + block from Mantle RPC     │
│  2. Derive DNA traits from address bytes      │
│  3. POST /api/analyze → Claude Haiku AI       │
└──────────┬─────────────┬────────────────────-┘
           │             │
┌──────────▼──────┐  ┌───▼─────────────────────┐
│  Mantle RPC     │  │  Anthropic API           │
│  (viem client)  │  │  claude-haiku-4-5        │
└─────────────────┘  └──────────────────────────┘
           │
┌──────────▼───────────────────────────────────┐
│       WalletDNA.sol (Mantle Sepolia)          │
│  ERC-721 Soulbound — stores DNA on-chain     │
│  aiInsightHash links AI output to NFT        │
└──────────────────────────────────────────────┘
```

---

## Smart Contract

**Network:** Mantle Sepolia Testnet (Chain ID: 5003)

**Contract:** `blockchain/contracts/WalletDNA.sol` — ERC-721 Soulbound NFT

Key features:
- **Soulbound**: transfers are permanently blocked (`_beforeTokenTransfer` reverts on non-mint)
- **DNATraits** struct stored on-chain: archetype, 4 scores, tx count, AI insight hash
- **One NFT per wallet**: each address can only mint once
- **Authorized minting**: only the `analyzer` oracle address can call `mintDNA`

```solidity
struct DNATraits {
    Archetype archetype;    // 7 personality types (enum)
    uint16 txCount;         // Transaction count on Mantle
    uint16 deFiScore;       // 0-1000: DeFi engagement
    uint16 holdScore;       // 0-1000: HODLing tendency
    uint16 diversityScore;  // 0-1000: Protocol diversity
    uint16 activityScore;   // 0-1000: Recent activity
    uint32 firstSeenBlock;  // First activity block
    uint32 analyzedAt;      // Unix timestamp of analysis
    bytes32 aiInsightHash;  // keccak256 of Claude AI insight text
}
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Web3 | wagmi v2, viem, injected wallet connector |
| AI | Claude Haiku (`claude-haiku-4-5-20251001`) via Anthropic SDK |
| Contract | Solidity 0.8.20, OpenZeppelin ERC-721, Hardhat |
| Network | Mantle Sepolia Testnet (RPC: `https://rpc.sepolia.mantle.xyz`) |
| Deployment | Vercel (frontend) |

---

## Running Locally

### Prerequisites
- Node.js 20+
- MetaMask with Mantle Sepolia network added
- Anthropic API key

### Frontend

```bash
git clone https://github.com/888marui/mantle-dna
cd mantle-dna
npm install

# Create .env.local with:
# ANTHROPIC_API_KEY=your_key_here

npm run dev
```

Open http://localhost:3000

### Smart Contract

```bash
cd blockchain
npm install

# Create .env with:
# PRIVATE_KEY=your_wallet_private_key
# MANTLE_TESTNET_RPC=https://rpc.sepolia.mantle.xyz

npx hardhat test
npx hardhat run scripts/deploy.js --network mantle_testnet
```

### Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Claude AI API key — required for AI insights |
| `NEXT_PUBLIC_MANTLE_RPC` | Mantle RPC URL (defaults to Sepolia testnet) |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed WalletDNA contract address |

---

## Project Structure

```
mantle-dna/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main app page
│   │   ├── api/analyze/route.ts  # Claude AI API endpoint
│   │   └── providers.tsx         # wagmi + React Query providers
│   ├── components/
│   │   ├── DNACard.tsx           # Archetype result card with AI insights
│   │   ├── DNAVisualizer.tsx     # SVG animated double helix
│   │   ├── SearchBar.tsx         # Wallet address input with validation
│   │   ├── WalletButton.tsx      # MetaMask connect button
│   │   └── ShareButton.tsx       # Share result on X
│   └── lib/
│       ├── analyzer.ts           # Wallet analysis + AI integration
│       ├── chains.ts             # Mantle chain definitions (viem)
│       ├── contracts.ts          # WalletDNA ABI
│       └── wagmi.ts              # wagmi config
├── blockchain/
│   ├── contracts/WalletDNA.sol   # Soulbound ERC-721 contract
│   ├── scripts/deploy.js         # Hardhat deployment script
│   └── test/WalletDNA.test.js    # Contract test suite
└── public/
    └── archetypes/               # Archetype character art (PNG)
```

---

## Mantle Network

```
Testnet: Mantle Sepolia Testnet
RPC:     https://rpc.sepolia.mantle.xyz
ChainID: 5003
Explorer: https://explorer.sepolia.mantle.xyz

Mainnet: Mantle
RPC:     https://rpc.mantle.xyz
ChainID: 5000
Explorer: https://explorer.mantle.xyz
```

---

## Hackathon

**Mantle Network Turing Test Hackathon 2026**

Built for:
- **Grand Champion** — AI × on-chain integration as an identity primitive
- **Best UI/UX** — Dark DNA aesthetic with helix visualizer and AI-powered cards
- **20 Project Deployment Award** — Contract on Mantle Sepolia + Claude AI on-chain function + public frontend

---

## License

MIT
