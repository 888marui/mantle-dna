import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";

// Public batch analysis endpoint
// POST /api/batch
// Body: { addresses: string[], network?: "mainnet" | "sepolia" }
// Returns: array of DNA analysis results (up to 10 wallets)
// Rate-limited by address count, uses parallel RPC calls internally

export const runtime = "nodejs";

const ARCHETYPE_NAMES = ["DeFi Degen", "Diamond Hands", "NFT Collector", "Yield Farmer", "Newcomer", "Whale", "Trader"];
const ARCHETYPE_EMOJIS = ["🔥", "💎", "🎨", "🌾", "🌱", "🐋", "📊"];

async function analyzeSingle(address: string, network: "mainnet" | "sepolia") {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${appUrl}/api/wallet/${address}?network=${network}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Analysis failed for ${address}`);
  return res.json();
}

export async function POST(req: NextRequest) {
  let body: { addresses?: unknown; network?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { addresses, network = "mainnet" } = body;

  if (!Array.isArray(addresses)) {
    return NextResponse.json({ error: "addresses must be an array" }, { status: 400 });
  }
  if (addresses.length === 0 || addresses.length > 10) {
    return NextResponse.json({ error: "addresses must contain 1-10 items" }, { status: 400 });
  }
  if (network !== "mainnet" && network !== "sepolia") {
    return NextResponse.json({ error: "network must be 'mainnet' or 'sepolia'" }, { status: 400 });
  }

  const invalidAddrs = (addresses as string[]).filter((a) => !isAddress(a));
  if (invalidAddrs.length > 0) {
    return NextResponse.json({ error: "Invalid addresses", invalid: invalidAddrs }, { status: 400 });
  }

  const results = await Promise.allSettled(
    (addresses as string[]).map((addr) => analyzeSingle(addr, network as "mainnet" | "sepolia"))
  );

  const output = results.map((r, i) => {
    if (r.status === "fulfilled") {
      return { address: addresses[i], status: "ok", data: r.value };
    }
    return {
      address: addresses[i],
      status: "error",
      error: r.reason instanceof Error ? r.reason.message : "Analysis failed",
    };
  });

  // Sort by mantleScore descending for leaderboard-style output
  const sorted = [...output].sort((a, b) => {
    const scoreA = a.status === "ok" ? (a.data?.mantleScore ?? 0) : -1;
    const scoreB = b.status === "ok" ? (b.data?.mantleScore ?? 0) : -1;
    return scoreB - scoreA;
  });

  const summary = {
    total: addresses.length,
    successful: output.filter((r) => r.status === "ok").length,
    failed: output.filter((r) => r.status === "error").length,
    archetypeDistribution: ARCHETYPE_NAMES.reduce((acc, name, i) => {
      acc[name] = output.filter((r) => r.status === "ok" && r.data?.archetype === i).length;
      return acc;
    }, {} as Record<string, number>),
    topArchetype: (() => {
      const counts = output
        .filter((r) => r.status === "ok")
        .reduce((acc: Record<number, number>, r) => {
          const idx = r.data?.archetype ?? -1;
          if (idx >= 0) acc[idx] = (acc[idx] || 0) + 1;
          return acc;
        }, {});
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      return top
        ? { archetype: Number(top[0]), name: ARCHETYPE_NAMES[Number(top[0])], emoji: ARCHETYPE_EMOJIS[Number(top[0])], count: top[1] }
        : null;
    })(),
  };

  return NextResponse.json(
    { results: sorted, summary, network, analyzedAt: new Date().toISOString() },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
      },
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
