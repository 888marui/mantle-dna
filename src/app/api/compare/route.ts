import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, isAddress } from "viem";
import { mantleMainnet, mantleTestnet } from "@/lib/chains";

// Public REST API for comparing two Mantle wallets
// GET /api/compare?a={address}&b={address}&network=mainnet|sepolia
// Returns: both wallets' DNA scores, archetype, compatibility score, DNA distance

export const runtime = "nodejs";

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

const MAINNET_TOKENS = [
  { symbol: "USDT", address: "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE" as `0x${string}`, decimals: 6 },
  { symbol: "USDC", address: "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9" as `0x${string}`, decimals: 6 },
  { symbol: "mETH", address: "0xcDA86A272531e8640cD7F1a92c01839911B90bb0" as `0x${string}`, decimals: 18 },
  { symbol: "WMNT", address: "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8" as `0x${string}`, decimals: 18 },
];

const ARCHETYPE_NAMES = ["DeFi Degen", "Diamond Hands", "NFT Collector", "Yield Farmer", "Newcomer", "Whale", "Trader"];
const ARCHETYPE_EMOJIS = ["🔥", "💎", "🎨", "🌾", "🌱", "🐋", "📊"];

// Archetype compatibility (0-100)
const COMPATIBILITY: Record<string, number> = {
  "0-0": 85, "0-1": 40, "0-2": 55, "0-3": 70, "0-4": 60, "0-5": 50, "0-6": 80,
  "1-1": 90, "1-2": 65, "1-3": 80, "1-4": 70, "1-5": 75, "1-6": 45,
  "2-2": 85, "2-3": 60, "2-4": 70, "2-5": 55, "2-6": 60,
  "3-3": 88, "3-4": 65, "3-5": 72, "3-6": 75,
  "4-4": 75, "4-5": 60, "4-6": 65,
  "5-5": 82, "5-6": 55,
  "6-6": 85,
};

function getCompatibility(a: number, b: number): number {
  const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
  return COMPATIBILITY[key] ?? 65;
}

async function analyzeAddress(address: `0x${string}`, network: "mainnet" | "sepolia") {
  const rpcUrl = network === "mainnet"
    ? (process.env.NEXT_PUBLIC_MANTLE_MAINNET_RPC || "https://rpc.mantle.xyz")
    : (process.env.NEXT_PUBLIC_MANTLE_RPC || "https://rpc.sepolia.mantle.xyz");

  const chain = network === "mainnet" ? mantleMainnet : mantleTestnet;
  const client = createPublicClient({ chain, transport: http(rpcUrl) });

  const [balance, txCount] = await Promise.all([
    client.getBalance({ address }),
    client.getTransactionCount({ address }).catch(() => null),
  ]);

  const tokenBalances: Record<string, string> = {};
  if (network === "mainnet") {
    const results = await Promise.allSettled(
      MAINNET_TOKENS.map((t) =>
        client.readContract({ address: t.address, abi: ERC20_ABI, functionName: "balanceOf", args: [address] })
      )
    );
    MAINNET_TOKENS.forEach((t, i) => {
      const r = results[i];
      if (r.status === "fulfilled") {
        const amt = Number(r.value as bigint) / 10 ** t.decimals;
        if (amt > 0.0001) tokenBalances[t.symbol] = amt >= 1 ? amt.toFixed(2) : amt.toFixed(4);
      }
    });
  }

  const mntBalance = Number(balance) / 1e18;
  const realTxCount = txCount ?? 0;

  const bytes = address.toLowerCase().replace("0x", "");
  const seed = (i: number) => parseInt(bytes.slice(i * 2, i * 2 + 4), 16);
  const clamp = (v: number) => Math.min(1000, Math.max(0, Math.round(v)));

  let deFiScore = seed(1) % 1000;
  let holdScore = seed(2) % 1000;
  let diversityScore = seed(3) % 1000;

  const mEthBalance = parseFloat(tokenBalances.mETH || "0");
  const wmntBalance = parseFloat(tokenBalances.WMNT || "0");
  const stableBalance = parseFloat(tokenBalances.USDT || "0") + parseFloat(tokenBalances.USDC || "0");
  const tokenCount = Object.keys(tokenBalances).length;

  if (mEthBalance > 0) {
    holdScore = clamp(holdScore + Math.min(200, Math.floor(mEthBalance * 10)));
    deFiScore = clamp(deFiScore + Math.min(100, Math.floor(mEthBalance * 5)));
  }
  if (wmntBalance > 0) {
    deFiScore = clamp(deFiScore + Math.min(150, Math.floor(wmntBalance * 5)));
    diversityScore = clamp(diversityScore + Math.min(100, Math.floor(wmntBalance * 3)));
  }
  if (stableBalance > 0) deFiScore = clamp(deFiScore + Math.min(100, Math.floor(stableBalance / 20)));
  if (tokenCount >= 2) diversityScore = clamp(diversityScore + tokenCount * 80);

  const txCount_ = realTxCount > 0 ? realTxCount : Math.floor(seed(5) / 10);
  const activityScore = realTxCount > 0
    ? Math.min(1000, Math.floor((realTxCount / 500) * 1000) + (seed(4) % 200))
    : seed(4) % 1000;

  let archetype: number;
  if (mntBalance > 100) archetype = 5;
  else if (txCount_ < 5) archetype = 4;
  else if (deFiScore > 800) archetype = 0;
  else if (holdScore > 800) archetype = 1;
  else if (diversityScore > 700 && deFiScore > 500) archetype = 3;
  else if (activityScore > 750) archetype = 6;
  else archetype = 2;

  let mantleScore = 0;
  if (mntBalance > 0.001) mantleScore += 20;
  if (mntBalance > 1) mantleScore += 10;
  if (mEthBalance > 0) mantleScore += 20;
  if (stableBalance > 0) mantleScore += 15;
  if (wmntBalance > 0) mantleScore += 10;
  if (txCount_ > 5) mantleScore += 10;
  if (txCount_ > 20) mantleScore += 10;
  if (tokenCount >= 2) mantleScore += 5;
  mantleScore = Math.min(100, mantleScore);

  return {
    address,
    network,
    mntBalance: mntBalance.toFixed(4),
    txCount: txCount_,
    tokenBalances: tokenCount > 0 ? tokenBalances : undefined,
    archetype,
    archetypeName: ARCHETYPE_NAMES[archetype],
    archetypeEmoji: ARCHETYPE_EMOJIS[archetype],
    scores: { deFiScore, holdScore, diversityScore, activityScore },
    mantleScore,
    dnaStrength: Math.round((deFiScore + holdScore + diversityScore + activityScore) / 40),
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const addrA = searchParams.get("a");
  const addrB = searchParams.get("b");
  const network = (searchParams.get("network") ?? "mainnet") as "mainnet" | "sepolia";

  if (!addrA || !addrB) {
    return NextResponse.json({ error: "Both ?a= and ?b= address params are required" }, { status: 400 });
  }
  if (!isAddress(addrA) || !isAddress(addrB)) {
    return NextResponse.json({ error: "Invalid Ethereum address" }, { status: 400 });
  }
  if (network !== "mainnet" && network !== "sepolia") {
    return NextResponse.json({ error: "network must be 'mainnet' or 'sepolia'" }, { status: 400 });
  }

  try {
    const [walletA, walletB] = await Promise.all([
      analyzeAddress(addrA as `0x${string}`, network),
      analyzeAddress(addrB as `0x${string}`, network),
    ]);

    const compatibility = getCompatibility(walletA.archetype, walletB.archetype);

    const dnaDistance = Math.round(
      Math.sqrt(
        Math.pow((walletA.scores.deFiScore - walletB.scores.deFiScore) / 1000, 2) +
        Math.pow((walletA.scores.holdScore - walletB.scores.holdScore) / 1000, 2) +
        Math.pow((walletA.scores.diversityScore - walletB.scores.diversityScore) / 1000, 2) +
        Math.pow((walletA.scores.activityScore - walletB.scores.activityScore) / 1000, 2)
      ) * 100
    ) / 100;

    const scoreDiffs = {
      deFiScore: walletA.scores.deFiScore - walletB.scores.deFiScore,
      holdScore: walletA.scores.holdScore - walletB.scores.holdScore,
      diversityScore: walletA.scores.diversityScore - walletB.scores.diversityScore,
      activityScore: walletA.scores.activityScore - walletB.scores.activityScore,
    };

    return NextResponse.json({
      walletA,
      walletB,
      comparison: {
        compatibility,
        dnaDistance,
        scoreDiffs,
        archetypeMatch: walletA.archetype === walletB.archetype,
        dominantTraitA: Object.entries(walletA.scores).sort((a, b) => b[1] - a[1])[0][0],
        dominantTraitB: Object.entries(walletB.scores).sort((a, b) => b[1] - a[1])[0][0],
      },
      analyzedAt: new Date().toISOString(),
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Comparison failed", detail: msg }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
