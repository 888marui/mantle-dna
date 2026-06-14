# 🧬 Mantle DNA

**Decentralized Genomic Data Ownership Platform on Mantle Network**

## Overview

Mantle DNA is a decentralized platform that enables individuals to store, manage, and selectively share their genomic data on the Mantle blockchain. By leveraging Mantle's low-cost L2 infrastructure, we make on-chain genomic data management accessible and affordable for everyone.

## Problem

- Genetic data is stored in centralized databases controlled by corporations
- Users have no true ownership or control over their most personal data
- Sharing genomic data for research requires trusting intermediaries
- High gas fees on L1 make on-chain genomic data impractical

## Solution

Mantle DNA provides:

1. **Self-Sovereign Identity**: Your DNA profile is an NFT you truly own
2. **Privacy-Preserving Sharing**: Share encrypted data hashes, not raw sequences
3. **Consent Management**: Grant/revoke access to researchers on-chain
4. **Incentivized Research**: Earn tokens when your anonymized data contributes to approved research
5. **Low Cost**: Mantle's L2 makes transactions 10-100x cheaper than Ethereum L1

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                │
│          MetaMask / Mantle Wallet Integration        │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              Smart Contracts (Mantle)                │
│  ┌─────────────────┐  ┌──────────────────────────┐  │
│  │  DNAProfile.sol │  │  ConsentManager.sol       │  │
│  │  (ERC-721 NFT)  │  │  (Access Control)         │  │
│  └─────────────────┘  └──────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │         DNAToken.sol (ERC-20 Rewards)          │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              Off-chain Storage (IPFS)                │
│         Encrypted genomic data stored off-chain      │
│         Only hashes stored on Mantle blockchain      │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

- **Blockchain**: Mantle Network (L2)
- **Smart Contracts**: Solidity + Hardhat
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Web3**: ethers.js, wagmi, ConnectKit
- **Storage**: IPFS (via Pinata)
- **Testing**: Hardhat + Chai

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask with Mantle Network configured

### Installation

```bash
git clone https://github.com/888marui/mantle-dna.git
cd mantle-dna
npm install
```

### Configure Environment

```bash
cp .env.example .env
# Fill in your values:
# PRIVATE_KEY=your_wallet_private_key
# MANTLE_RPC_URL=https://rpc.mantle.xyz
# PINATA_API_KEY=your_pinata_key
# PINATA_SECRET_KEY=your_pinata_secret
```

### Deploy Contracts

```bash
# Deploy to Mantle Testnet (Sepolia)
npm run deploy:testnet

# Deploy to Mantle Mainnet
npm run deploy:mainnet
```

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Smart Contracts

| Contract | Description | Address (Testnet) |
|----------|-------------|-------------------|
| DNAProfile | NFT representing a user's DNA profile | `0x...` |
| ConsentManager | Manages data sharing permissions | `0x...` |
| DNAToken | ERC-20 reward token for data contributors | `0x...` |

## Mantle Network Configuration

```
Network Name: Mantle Mainnet
RPC URL: https://rpc.mantle.xyz
Chain ID: 5000
Currency Symbol: MNT
Block Explorer: https://explorer.mantle.xyz
```

```
Network Name: Mantle Sepolia Testnet
RPC URL: https://rpc.sepolia.mantle.xyz
Chain ID: 5003
Currency Symbol: MNT
Block Explorer: https://explorer.sepolia.mantle.xyz
```

## How It Works

1. **Upload**: User uploads their DNA data file (from 23andMe, AncestryDNA, etc.)
2. **Encrypt**: Data is encrypted client-side with user's private key
3. **Store**: Encrypted data is stored on IPFS, hash is stored on Mantle
4. **Mint**: A DNAProfile NFT is minted to the user's wallet
5. **Share**: User can grant/revoke access to specific researchers or institutions
6. **Earn**: When anonymized data is used in approved research, user earns DNAToken rewards

## Use Cases

- **Genetic Research**: Opt-in participation in academic studies
- **Personal Health**: Securely share genetic risks with healthcare providers
- **Ancestry**: Collaborative family tree building without data loss
- **Insurance**: Prove genetic conditions without revealing full profile

## Why Mantle?

- **Low Gas Fees**: DNA data operations cost cents, not dollars
- **EVM Compatible**: Full Solidity support, easy migration from Ethereum
- **Fast Finality**: Near-instant transaction confirmation
- **Data Availability**: Mantle DA ensures data is always accessible
- **Growing Ecosystem**: Active DeFi and NFT community

## Team

Built for the Mantle Hackathon 2025

## License

MIT
