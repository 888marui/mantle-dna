"use client";

import { type WalletAnalysis } from "@/lib/analyzer";

interface Props {
  analysis: WalletAnalysis;
}

export function ShareButton({ analysis }: Props) {
  const text = `🧬 My Mantle DNA: I'm a ${analysis.archetypeName} ${analysis.archetypeEmoji}\n\nDeFi: ${analysis.deFiScore}/1000 | HODL: ${analysis.holdScore}/1000\n\n${analysis.aiInsight || analysis.description}\n\nDiscover your on-chain DNA 👇\nmantle-dna.xyz\n#MantleDNA #Mantle #Web3`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black hover:bg-gray-900 text-white text-sm font-medium border border-gray-700 transition-colors w-full justify-center"
    >
      Share on 𝕏
    </a>
  );
}
