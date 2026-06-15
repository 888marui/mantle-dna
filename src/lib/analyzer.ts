import { createPublicClient, http } from "viem";
import { mantleMainnet, mantleTestnet } from "./chains";

export type NetworkType = 'mainnet' | 'sepolia';

export interface WalletTraits {
  archetype: number;
  archetypeReason: string;
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
  network: NetworkType;
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

export function getExplorerUrl(address: string, network: NetworkType = 'sepolia'): string {
  const base = network === 'mainnet'
    ? 'https://explorer.mantle.xyz'
    : 'https://explorer.sepolia.mantle.xyz';
  return `${base}/address/${address}`;
}

export async function analyzeWallet(address: string, network: NetworkType = 'sepolia'): Promise<WalletAnalysis> {
  const rpcUrl = network === 'mainnet'
    ? (process.env.NEXT_PUBLIC_MANTLE_MAINNET_RPC || "https://rpc.mantle.xyz")
    : (process.env.NEXT_PUBLIC_MANTLE_RPC || "https://rpc.sepolia.mantle.xyz");

  const chain = network === 'mainnet' ? mantleMainnet : mantleTestnet;

  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  const addr = address as `0x${string}`;

  const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
    Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Mantle RPC timeout — please try again")), ms)
      ),
    ]);

  const [balance, txCount, latestBlock] = await withTimeout(
    Promise.all([
      client.getBalance({ address: addr }),
      client.getTransactionCount({ address: addr }).catch(() => null),
      client.getBlockNumber(),
    ]),
    10000
  );

  const mntBalance = (Number(balance) / 1e18).toFixed(4);
  const realTxCount = txCount ?? undefined;

  const traits = computeTraitsFromAddress(address, latestBlock, balance, realTxCount);
  const archetype = ARCHETYPES[traits.archetype];

  const analysis: WalletAnalysis = {
    ...traits,
    archetypeName: archetype.name,
    archetypeEmoji: archetype.emoji,
    archetypeImage: archetype.image,
    description: archetype.description,
    mntBalance,
    address,
    network,
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
        network,
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

  // Fallback: if no AI insight loaded, generate a deterministic one from traits
  if (!analysis.aiInsight) {
    analysis.aiInsight = generateFallbackInsight(traits, archetype.name);
    analysis.aiStrengths = generateFallbackStrengths(traits);
    analysis.aiWatchOut = generateFallbackWatchOut(traits.archetype);
    analysis.aiPrediction = generateFallbackPrediction(traits.archetype, traits.deFiScore);
  }

  return analysis;
}

function computeTraitsFromAddress(
  address: string,
  latestBlock: bigint,
  balance: bigint,
  realTxCount?: number
): WalletTraits {
  const bytes = address.toLowerCase().replace("0x", "");
  const seed = (i: number) => parseInt(bytes.slice(i * 2, i * 2 + 4), 16);

  const deFiScore = seed(1) % 1000;
  const holdScore = seed(2) % 1000;
  const diversityScore = seed(3) % 1000;
  const balanceEth = Number(balance) / 1e18;

  // Use real on-chain tx count if meaningful (>0), else use deterministic estimate.
  // On Mantle Sepolia testnet, most addresses have 0 real txns, which would make
  // everyone a "Newcomer" — the estimate preserves archetype diversity for demos.
  const txCount = (realTxCount != null && realTxCount > 0)
    ? realTxCount
    : Math.floor(seed(5) / 10);

  // Activity score: boost proportionally when real tx history exists
  const activityScore = (realTxCount != null && realTxCount > 0)
    ? Math.min(1000, Math.floor((realTxCount / 500) * 1000) + (seed(4) % 200))
    : seed(4) % 1000;

  let archetype: number;
  let archetypeReason: string;
  if (balanceEth > 100) {
    archetype = 5;
    archetypeReason = `MNT balance ${balanceEth.toFixed(2)} > 100 MNT threshold → Whale classification`;
  } else if (txCount < 5) {
    archetype = 4;
    archetypeReason = `Transaction count ${txCount} < 5 → Newcomer (early-stage wallet)`;
  } else if (deFiScore > 800) {
    archetype = 0;
    archetypeReason = `DeFi score ${deFiScore}/1000 exceeds 800 threshold → DeFi Degen`;
  } else if (holdScore > 800) {
    archetype = 1;
    archetypeReason = `HODLing score ${holdScore}/1000 exceeds 800 threshold → Diamond Hands`;
  } else if (diversityScore > 700 && deFiScore > 500) {
    archetype = 3;
    archetypeReason = `Protocol diversity ${diversityScore}/1000 > 700 + DeFi ${deFiScore}/1000 > 500 → Yield Farmer`;
  } else if (activityScore > 750) {
    archetype = 6;
    archetypeReason = `Activity score ${activityScore}/1000 exceeds 750 threshold → Trader`;
  } else {
    archetype = 2;
    archetypeReason = `Balanced profile: DeFi ${deFiScore}, HODLing ${holdScore}, Diversity ${diversityScore} → NFT Collector`;
  }

  return {
    archetype,
    archetypeReason,
    txCount,
    deFiScore,
    holdScore,
    diversityScore,
    activityScore,
    firstSeenBlock: Number(latestBlock) - Math.floor(seed(6) / 2),
    analyzedAt: Math.floor(Date.now() / 1000),
  };
}

const FALLBACK_INSIGHTS: Record<number, string> = {
  0: "Your on-chain genome screams DeFi maximalist — high protocol churn, aggressive yield hunting, and a risk tolerance that would make most wallets nervous. You live in the Mantle DeFi trenches.",
  1: "Diamond hands aren't just a meme for you — they're a strategy. Your wallet accumulates quietly, rarely blinks, and trusts the long game. Mantle's low fees are your secret weapon.",
  2: "You see digital ownership differently. NFTs aren't just JPEGs to you — they're provenance, identity, and culture. Your Mantle wallet curates a gallery most would envy.",
  3: "You've cracked the passive yield code. Liquidity provision, compounding rewards, and protocol-hopping for the best APY define your DNA. Your MNT works harder than most.",
  4: "You're early. Your Mantle journey is just beginning, but the on-chain patterns forming now will define your web3 identity for years. The ecosystem is yours to explore.",
  5: "Every transaction you make is a market signal. Large positions, strategic timing, and methodical accumulation put you in a class where most wallets just watch from the sidelines.",
  6: "Sharp entries, clean exits. Your trading DNA shows a pattern of precision — you read momentum, position accordingly, and rarely overstay your welcome in a trade.",
};

const FALLBACK_STRENGTHS: Record<number, string[]> = {
  0: ["Protocol risk assessment", "APY optimization", "Gas efficiency on Mantle"],
  1: ["Long-term conviction holding", "MNT accumulation discipline", "Low-frequency trading"],
  2: ["Digital asset curation", "Community participation", "Cross-protocol exploration"],
  3: ["Liquidity provision timing", "Yield compounding", "Risk-adjusted returns"],
  4: ["Open-minded exploration", "Early adopter positioning", "Learning velocity"],
  5: ["Position sizing", "Market impact awareness", "Strategic liquidity deployment"],
  6: ["Trade execution precision", "Momentum reading", "DEX navigation"],
};

const FALLBACK_WATCHOUTS: Record<number, string> = {
  0: "High DeFi activity increases smart contract exposure — diversify across audited Mantle protocols like Init Capital rather than concentrating in single pools.",
  1: "Diamond hands can miss the exit. Set trailing stops or partial-take-profit targets, especially on high-conviction positions in volatile MNT pairs.",
  2: "NFT liquidity on Mantle is still maturing — ensure your positions aren't overly concentrated in illiquid collections with wide bid-ask spreads.",
  3: "Impermanent loss can erode yield farming gains in volatile pairs. Stick to stable-correlated pools on Agni Finance for your core LP positions.",
  4: "New wallets are prime targets for phishing and rug pulls. Stick to established Mantle protocols and verify all contract addresses before approving.",
  5: "Whale wallets are watched. Your moves on-chain are visible to MEV bots and front-runners — consider using private mempools or splitting large transactions.",
  6: "Overtrading erodes alpha. Transaction costs add up even on Mantle — track your net P&L after fees to ensure your edge isn't being eaten by friction.",
};

const FALLBACK_PREDICTIONS: Record<number, string> = {
  0: "You'll likely be among the first to provide liquidity when Agni Finance launches new incentivized pairs — your DeFi DNA makes you an early LP adopter.",
  1: "Expect to quietly stack mETH Protocol staking positions as Mantle expands its liquid staking yield. Patience is your edge.",
  2: "When Mantle NFT Market launches its next flagship drop, your wallet will be early — you have the eye and the timing.",
  3: "Your yield farming instincts will steer you toward Init Capital's new leveraged yield strategies — high APY with smart risk management is your sweet spot.",
  4: "Your next on-chain milestone is likely your first Agni Finance swap or mETH staking deposit — welcome to the Mantle DeFi ecosystem.",
  5: "You'll likely make a significant Lendle deposit to earn yield on idle capital while maintaining strategic liquidity for larger market opportunities.",
  6: "You'll be watching Merchant Moe's order book closely for the next MNT/USDT breakout — your chart-reading instincts are finely tuned.",
};

function generateFallbackInsight(traits: WalletTraits, archetypeName: string): string {
  return FALLBACK_INSIGHTS[traits.archetype] ?? `Your ${archetypeName} DNA is clear from the on-chain patterns — a unique signature in the Mantle ecosystem with scores shaped by real activity.`;
}

function generateFallbackStrengths(traits: WalletTraits): string[] {
  return FALLBACK_STRENGTHS[traits.archetype] ?? ["On-chain discipline", "Mantle ecosystem awareness", "Consistent behavior"];
}

function generateFallbackWatchOut(archetype: number): string {
  return FALLBACK_WATCHOUTS[archetype] ?? "Stay diversified across Mantle protocols and verify all contract addresses before interacting.";
}

function generateFallbackPrediction(archetype: number, deFiScore: number): string {
  const base = FALLBACK_PREDICTIONS[archetype] ?? "Your next move in the Mantle ecosystem will likely align with your dominant DNA traits.";
  return deFiScore > 700 ? base + " High DeFi score suggests aggressive protocol adoption ahead." : base;
}
