import { createPublicClient, http } from "viem";
import { mantleTestnet } from "./chains";

export interface WalletTraits {
  archetype: number;
  txCount: number;
  deFiScore: number;
  holdScore: number;
  diversityScore: number;
  activityScore: number;
  firstSeenBlock: number;
  analyzedAt: number;
}

export interface WalletAnalysis extends WalletTraits {
  archetypeName: string;
  archetypeEmoji: string;
  description: string;
  mntBalance: string;
  address: string;
  aiInsight?: string;
  aiStrengths?: string[];
  aiWatchOut?: string;
  aiPrediction?: string;
}

const ARCHETYPES = [
  {
    name: "DeFi Degen",
    emoji: "🔥",
    description: "You live and breathe DeFi. High-frequency swaps, yield chasing, and protocol hopping define your on-chain DNA.",
  },
  {
    name: "Diamond Hands",
    emoji: "💎",
    description: "You hold through the storms. Low churn, patient accumulation — your wallet is a testament to conviction.",
  },
  {
    name: "NFT Collector",
    emoji: "🎨",
    description: "Digital art and collectibles fuel your on-chain journey. Your wallet is a curated gallery.",
  },
  {
    name: "Yield Farmer",
    emoji: "🌾",
    description: "Liquidity provision and passive yield are your game. You make your assets work for you 24/7.",
  },
  {
    name: "Newcomer",
    emoji: "🌱",
    description: "Your on-chain journey is just beginning. Fresh wallet, big potential — the Mantle ecosystem awaits.",
  },
  {
    name: "Whale",
    emoji: "🐋",
    description: "High-value transactions and strategic moves define your footprint. Every action you take moves markets.",
  },
  {
    name: "Trader",
    emoji: "📊",
    description: "Active DEX user with sharp timing. You read the charts and execute with precision.",
  },
];

const MANTLE_RPC = process.env.NEXT_PUBLIC_MANTLE_RPC || "https://rpc.sepolia.mantle.xyz";

export async function analyzeWallet(address: string): Promise<WalletAnalysis> {
  const client = createPublicClient({
    chain: mantleTestnet,
    transport: http(MANTLE_RPC),
  });

  const balance = await client.getBalance({ address: address as `0x${string}` });
  const mntBalance = (Number(balance) / 1e18).toFixed(4);
  const latestBlock = await client.getBlockNumber();

  const traits = computeTraitsFromAddress(address, latestBlock, balance);
  const archetype = ARCHETYPES[traits.archetype];

  const analysis: WalletAnalysis = {
    ...traits,
    archetypeName: archetype.name,
    archetypeEmoji: archetype.emoji,
    description: archetype.description,
    mntBalance,
    address,
  };

  // Call the AI endpoint to get insights
  try {
    const baseUrl =
      typeof window !== "undefined"
        ? ""
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address,
        balance: mntBalance,
        txCount: traits.txCount,
        deFiScore: traits.deFiScore,
        holdScore: traits.holdScore,
        diversityScore: traits.diversityScore,
        activityScore: traits.activityScore,
        archetype: archetype.name,
      }),
    });

    if (response.ok) {
      const aiData = await response.json();
      if (aiData.insight) analysis.aiInsight = aiData.insight;
      if (aiData.strengths) analysis.aiStrengths = aiData.strengths;
      if (aiData.watchOut) analysis.aiWatchOut = aiData.watchOut;
      if (aiData.prediction) analysis.aiPrediction = aiData.prediction;
    }
  } catch {
    // AI enrichment failed — continue without it
  }

  return analysis;
}

function computeTraitsFromAddress(
  address: string,
  latestBlock: bigint,
  balance: bigint
): WalletTraits {
  const bytes = address.toLowerCase().replace("0x", "");
  const seed = (i: number) => parseInt(bytes.slice(i * 2, i * 2 + 4), 16);

  const deFiScore = seed(1) % 1000;
  const holdScore = seed(2) % 1000;
  const diversityScore = seed(3) % 1000;
  const activityScore = seed(4) % 1000;
  const txCount = Math.floor(seed(5) / 10);
  const balanceEth = Number(balance) / 1e18;

  let archetype: number;
  if (balanceEth > 100) archetype = 5;
  else if (txCount < 10) archetype = 4;
  else if (deFiScore > 800) archetype = 0;
  else if (holdScore > 800) archetype = 1;
  else if (diversityScore > 700 && deFiScore > 500) archetype = 3;
  else if (activityScore > 750) archetype = 6;
  else archetype = 2;

  return {
    archetype,
    txCount,
    deFiScore,
    holdScore,
    diversityScore,
    activityScore,
    firstSeenBlock: Number(latestBlock) - Math.floor(seed(6) / 2),
    analyzedAt: Math.floor(Date.now() / 1000),
  };
}
