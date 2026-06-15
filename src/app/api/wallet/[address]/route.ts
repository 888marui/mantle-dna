import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, isAddress } from "viem";
import { mantleMainnet, mantleTestnet } from "@/lib/chains";

// Public REST API for Mantle DNA wallet analysis
// GET /api/wallet/{address}?network=mainnet|sepolia
// Returns: DNA traits, scores, archetype, and Mantle Ecosystem Score

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

export async function GET(req: NextRequest, { params }: { params: { address: string } }) {
  const { address } = params;
  const network = req.nextUrl.searchParams.get("network") ?? "mainnet";

  if (!isAddress(address)) {
    return NextResponse.json({ error: "Invalid Ethereum address" }, { status: 400 });
  }
  if (network !== "mainnet" && network !== "sepolia") {
    return NextResponse.json({ error: "network must be 'mainnet' or 'sepolia'" }, { status: 400 });
  }

  try {
    const rpcUrl = network === "mainnet"
      ? (process.env.NEXT_PUBLIC_MANTLE_MAINNET_RPC || "https://rpc.mantle.xyz")
      : (process.env.NEXT_PUBLIC_MANTLE_RPC || "https://rpc.sepolia.mantle.xyz");

    const chain = network === "mainnet" ? mantleMainnet : mantleTestnet;
    const client = createPublicClient({ chain, transport: http(rpcUrl) });
    const addr = address as `0x${string}`;

    const [balance, txCount, latestBlock] = await Promise.all([
      client.getBalance({ address: addr }),
      client.getTransactionCount({ address: addr }).catch(() => null),
      client.getBlockNumber(),
    ]);

    // Fetch ERC-20 balances on mainnet
    const tokenBalances: Record<string, string> = {};
    if (network === "mainnet") {
      const results = await Promise.allSettled(
        MAINNET_TOKENS.map((t) =>
          client.readContract({ address: t.address, abi: ERC20_ABI, functionName: "balanceOf", args: [addr] })
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

    // Compute DNA scores (same algorithm as analyzer.ts)
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

    // Mantle Ecosystem Score
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

    return NextResponse.json({
      address,
      network,
      mntBalance: mntBalance.toFixed(4),
      txCount: txCount_,
      tokenBalances: Object.keys(tokenBalances).length > 0 ? tokenBalances : undefined,
      archetype,
      archetypeName: ARCHETYPE_NAMES[archetype],
      archetypeEmoji: ARCHETYPE_EMOJIS[archetype],
      scores: {
        deFiScore,
        holdScore,
        diversityScore,
        activityScore,
      },
      mantleScore,
      dnaStrength: Math.round((deFiScore + holdScore + diversityScore + activityScore) / 40),
      analyzedAt: new Date().toISOString(),
      blockNumber: Number(latestBlock),
      explorerUrl: network === "mainnet"
        ? `https://explorer.mantle.xyz/address/${address}`
        : `https://explorer.sepolia.mantle.xyz/address/${address}`,
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Analysis failed", detail: msg }, { status: 500 });
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
