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
  archetypeImage: string;
  description: string;
  mntBalance: string;
  address: string;
  aiInsight?: string;
  aiStrengths?: string[];
  aiWatchOut?: string;
  aiPrediction?: string;
  protocolAffinity: string[];  // Mantle protocols this wallet would likely use
}

const ARCHETYPES = [
  {
    name: "DeFi Degen",
    emoji: "🔥",
    image: "/archetypes/defi-degen.svg",
    description: "You live and breathe DeFi. High-frequency swaps, yield chasing, and protocol hopping define your on-chain DNA.",
  },
  {
    name: "Diamond Hands",
    emoji: "💎",
    image: "/archetypes/diamond-hands.svg",
    description: "You hold through the storms. Low churn, patient accumulation — your wallet is a testament to conviction.",
  },
  {
    name: "NFT Collector",
    emoji: "🎨",
    image: "/archetypes/nft-collector.svg",
    description: "Digital art and collectibles fuel your on-chain journey. Your wallet is a curated gallery.",
  },
  {
    name: "Yield Farmer",
    emoji: "🌾",
    image: "/archetypes/yield-farmer.svg",
    description: "Liquidity provision and passive yield are your game. You make your assets work for you 24/7.",
  },
  {
    name: "Newcomer",
    emoji: "🌱",
    image: "/archetypes/newcomer.svg",
    description: "Your on-chain journey is just beginning. Fresh wallet, big potential — the Mantle ecosystem awaits.",
  },
  {
    name: "Whale",
    emoji: "🐋",
    image: "/archetypes/whale.svg",
    description: "High-value transactions and strategic moves define your footprint. Every action you take moves markets.",
  },
  {
    name: "Trader",
    image: "/archetypes/trader.svg",
    emoji: "📊",
    description: "Active DEX user with sharp timing. You read the charts and execute with precision.",
  },
];

const PROTOCOL_MAP: Record<number, string[]> = {
  0: ["Agni Finance", "Merchant Moe", "Init Capital"],    // DeFi Degen
  1: ["mETH Protocol", "Lendle", "FBTC"],                 // Diamond Hands
  2: ["Mantle NFT Market", "Init Capital", "Agni Finance"], // NFT Collector
  3: ["Agni Finance", "Lendle", "mETH Protocol"],          // Yield Farmer
  4: ["Agni Finance", "Mantle Bridge", "mETH Protocol"],   // Newcomer
  5: ["Lendle", "Init Capital", "mETH Protocol"],          // Whale
  6: ["Merchant Moe", "Agni Finance", "Init Capital"],     // Trader
};

function computeProtocolAffinity(
  archetype: number,
  _deFiScore: number,
  _holdScore: number,
  diversityScore: number
): string[] {
  const protocols = [...(PROTOCOL_MAP[archetype] ?? PROTOCOL_MAP[4])];

  if (diversityScore > 600) {
    const extras = ["Mantle Bridge", "mETH Protocol", "FBTC", "Lendle", "Init Capital", "Merchant Moe"];
    const extra = extras.find((p) => !protocols.includes(p));
    if (extra) protocols.push(extra);
  }

  return protocols;
}

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
    archetypeImage: archetype.image,
    description: archetype.description,
    mntBalance,
    address,
    protocolAffinity: computeProtocolAffinity(traits.archetype, traits.deFiScore, traits.holdScore, traits.diversityScore),
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
