"use client";

import { useState } from "react";
import { type WalletAnalysis } from "@/lib/analyzer";

interface Props {
  analysis: WalletAnalysis;
}

export function ShareButton({ analysis }: Props) {
  const [copied, setCopied] = useState(false);

  const appUrl = typeof window !== "undefined"
    ? window.location.origin
    : "https://mantle-dna.xyz";

  // Include archetype + scores in URL so the OG image reflects actual analysis results
  const ogParams = new URLSearchParams({
    archetype: String(analysis.archetype),
    defi: String(analysis.deFiScore),
    hodl: String(analysis.holdScore),
    diversity: String(analysis.diversityScore),
    activity: String(analysis.activityScore),
    network: analysis.network,
    mantleScore: String(analysis.mantleScore),
  });
  const walletUrl = `${appUrl}/wallet/${analysis.address}?${ogParams.toString()}`;

  const mantleTier = analysis.mantleScore >= 80 ? "💜 Platinum" : analysis.mantleScore >= 60 ? "🏆 Gold" : analysis.mantleScore >= 30 ? "🥈 Silver" : "🥉 Bronze";
  const shareText = `🧬 My Mantle DNA: I'm a ${analysis.archetypeName} ${analysis.archetypeEmoji}\n\nDeFi: ${analysis.deFiScore}/1000 | HODL: ${analysis.holdScore}/1000 | Mantle Score: ${analysis.mantleScore}/100 ${mantleTier}\n\n${analysis.aiInsight || analysis.description}\n\nDiscover your on-chain DNA 👇\n${walletUrl}\n#MantleDNA #Mantle #Web3`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(walletUrl)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select input
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-black hover:bg-gray-900 text-white text-sm font-medium border border-gray-700 transition-colors"
        >
          <span>Share on 𝕏</span>
        </a>
        <a
          href={farcasterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg hover:opacity-80 text-white text-sm font-medium transition-colors"
          style={{ background: "#7c3aed", border: "1px solid #6d28d9" }}
        >
          <span>⬡ Farcaster</span>
        </a>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium border border-gray-700 transition-colors whitespace-nowrap"
        >
          {copied ? "✓ Copied" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}
