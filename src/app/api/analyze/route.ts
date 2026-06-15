import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      address,
      balance,
      txCount,
      deFiScore,
      holdScore,
      diversityScore,
      activityScore,
      archetype,
      network = 'sepolia',
      tokenBalances = {},
      mantleScore = 0,
    } = body;

    if (!address) {
      return NextResponse.json({ error: "Missing address" }, { status: 400 });
    }

    const networkLabel = network === 'mainnet' ? 'Mantle Mainnet' : 'Mantle Sepolia testnet';

    const tokenLines = Object.entries(tokenBalances as Record<string, string>)
      .map(([sym, amt]) => `- ${sym}: ${amt}`)
      .join("\n");
    const tokenSection = tokenLines
      ? `\nReal ERC-20 Holdings on Mantle:\n${tokenLines}\n`
      : "";

    const prompt = `You are a witty on-chain DNA analyst for Mantle Network. Analyze this wallet's on-chain genome:

Wallet: ${address}
Network: ${networkLabel}
Archetype: ${archetype} (their dominant on-chain personality)
MNT Balance: ${balance} MNT
Transaction Count: ${txCount}${tokenSection}

DNA Scores (0-1000):
- DeFi Score: ${deFiScore}/1000 — ${deFiScore > 700 ? "heavy protocol user" : deFiScore > 400 ? "moderate DeFi participant" : "minimal DeFi activity"}
- HODL Score: ${holdScore}/1000 — ${holdScore > 700 ? "diamond hands" : holdScore > 400 ? "balanced trader" : "active seller"}
- Diversity Score: ${diversityScore}/1000 — ${diversityScore > 700 ? "multi-protocol explorer" : diversityScore > 400 ? "selectively diverse" : "focused on few protocols"}
- Activity Score: ${activityScore}/1000 — ${activityScore > 700 ? "highly active on-chain" : activityScore > 400 ? "regularly active" : "occasional user"}

Mantle Ecosystem Score: ${mantleScore}/100 — ${mantleScore >= 60 ? "deeply integrated with Mantle" : mantleScore >= 30 ? "moderately active on Mantle" : "early-stage Mantle user"}

Archetype context:
- "DeFi Degen": High-frequency swaps, yield chasing, protocol hopping; loves risky high-APY plays on Agni Finance and Merchant Moe
- "Diamond Hands": Accumulates and rarely sells; long-term MNT conviction; likely staking on mETH Protocol
- "NFT Collector": Bridges NFT and DeFi; active on Mantle NFT marketplace; values digital ownership
- "Yield Farmer": Optimizes for sustainable yield; LP positions on Agni Finance; compounds rewards via Lendle
- "Newcomer": Early in Web3 journey; building on-chain habits; first steps into Mantle ecosystem
- "Whale": Large positions; market-moving potential; strategic moves on Init Capital and Lendle
- "Trader": Active DEX user on Merchant Moe; sharp timing; reads charts; executes with precision

Write a DNA profile for this ${archetype}. The tone is insightful and a bit cheeky — like a snarky but brilliant Web3 researcher who just decoded their on-chain soul. Reference actual score values and real token holdings (if present) in your analysis. Return ONLY valid JSON (no markdown, no code blocks) with exactly these fields:
{
  "insight": "2 punchy sentences that capture their Web3 personality based on their specific scores. Reference actual numbers. Be insightful and a bit cheeky.",
  "strengths": ["3 specific on-chain skills this wallet excels at based on their score pattern — e.g. 'Liquidity timing', 'Protocol risk assessment', 'MNT accumulation discipline'"],
  "watchOut": "One specific DeFi risk they face given their archetype and score pattern on Mantle — be concrete, not generic",
  "prediction": "One bold prediction about their next move in the Mantle ecosystem. Must mention a specific Mantle protocol: Agni Finance, Merchant Moe, Lendle, mETH Protocol, Init Capital, FBTC, or Mantle Bridge."
}`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse the JSON response from Claude
    let parsed;
    try {
      // Strip markdown code blocks if present
      const raw = textBlock.text
        .replace(/^```(?:json)?\n?/m, "")
        .replace(/\n?```$/m, "")
        .trim();
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Failed to parse Claude response as JSON");
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      { error: "AI analysis failed" },
      { status: 500 }
    );
  }
}
