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
    } = body;

    if (!address) {
      return NextResponse.json({ error: "Missing address" }, { status: 400 });
    }

    const prompt = `You are a Web3 personality analyst. Based on this Mantle wallet's on-chain data:

Address: ${address}
Balance: ${balance} MNT
Transaction Count: ${txCount}
DeFi Score: ${deFiScore}/1000
HODL Score: ${holdScore}/1000
Diversity Score: ${diversityScore}/1000
Activity Score: ${activityScore}/1000
Archetype: ${archetype}

Write a short DNA analysis. Return ONLY valid JSON (no markdown, no code blocks) with exactly these fields:
{
  "insight": "2 sentences about their Web3 personality based on the data",
  "strengths": ["trait 1", "trait 2", "trait 3"],
  "watchOut": "one specific risk to watch for this wallet type",
  "prediction": "one sentence about their DeFi future on Mantle"
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
