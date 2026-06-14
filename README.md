# 🧬 Mantle DNA

**AI-powered wallet DNA analysis on Mantle Network**

> Enter any Mantle wallet address → get an instant on-chain personality profile → mint it as a Soulbound NFT

## What is Mantle DNA?

Every wallet on Mantle has a unique on-chain fingerprint — a pattern of transactions, DeFi interactions, holdings, and behaviors that define its identity. Mantle DNA reveals that fingerprint.

We analyze wallet history across Mantle and distill it into a **DNA Profile**: a visual genome map with 4 trait scores and 1 of 7 personality archetypes, permanently recorded as a non-transferable (Soulbound) NFT.

## Archetypes

| Archetype | Emoji | Traits |
|---|---|---|
| DeFi Degen | 🔥 | High-frequency DeFi, protocol hopping |
| Diamond Hands | 💎 | Long-term holder, low churn |
| NFT Collector | 🎨 | Active NFT buying/selling |
| Yield Farmer | 🌾 | Liquidity provision, passive yield |
| Newcomer | 🌱 | Recent wallet, building history |
| Whale | 🐋 | High-value strategic transactions |
| Trader | 📊 | Active DEX user, timing-focused |

## Architecture

```
┌──────────────────────────────────────────────┐
│            Frontend (Next.js 14)              │
│  SearchBar → WalletAnalysis → DNAVisualizer   │
│  Mint Soulbound NFT via ConnectKit/wagmi      │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│          Analyzer (Next.js + viem)            │
│  Fetch balance + block data from Mantle RPC   │
│  Derive DNA traits from on-chain activity     │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│         WalletDNA.sol (Mantle Network)        │
│  ERC-721 Soulbound NFT — stores DNA traits   │
│  7 archetypes, 4 trait scores, tx metadata   │
└──────────────────────────────────────────────┘
```

## Tech Stack

- **Blockchain**: Mantle Network (L2 on Ethereum)
- **Smart Contract**: Solidity + Hardhat — ERC-721 Soulbound NFT
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Web3**: wagmi v2 + ConnectKit + viem
- **Analysis**: On-chain data via Mantle RPC

## Getting Started

### Prerequisites
- Node.js 18+
- MetaMask configured for Mantle Network

### Contracts

```bash
npm install
cp .env.example .env  # add PRIVATE_KEY
npm run deploy:testnet
```

### Frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local  # add contract addresses
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Mantle Network Config

```
Testnet: Mantle Sepolia
RPC:     https://rpc.sepolia.mantle.xyz
ChainID: 5003
Explorer: https://explorer.sepolia.mantle.xyz

Mainnet: Mantle
RPC:     https://rpc.mantle.xyz
ChainID: 5000
Explorer: https://explorer.mantle.xyz
```

## Why Mantle?

- **Low gas**: Minting a DNA NFT costs fractions of a cent
- **EVM compatible**: Full Solidity + ethers.js support
- **Fast finality**: Sub-second transaction confirmation
- **Growing ecosystem**: Rich on-chain data to analyze

## Team

Built for the Mantle Hackathon 2025

## License

MIT
