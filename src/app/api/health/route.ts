import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "Mantle DNA API",
      version: "1.0.0",
      endpoints: {
        "GET /api/wallet/{address}": "Analyze a wallet — returns DNA scores, archetype, Mantle Ecosystem Score",
        "GET /api/compare": "Compare two wallets — ?a={address}&b={address}&network=mainnet|sepolia",
        "POST /api/batch": "Batch analyze up to 10 wallets — body: { addresses: string[], network? }",
        "GET /api/og": "Dynamic OG image — 1200×630 DNA Certificate PNG",
        "GET /api/health": "This endpoint",
      },
      networks: ["mainnet (Mantle chainId 5000)", "sepolia (Mantle chainId 5003)"],
      docs: "https://mantle-dna.xyz/about",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=30",
      },
    }
  );
}
