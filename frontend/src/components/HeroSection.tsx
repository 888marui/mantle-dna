"use client";

import { ConnectKitButton } from "connectkit";

export function HeroSection() {
  return (
    <div className="text-center space-y-10 py-16">
      {/* DNA Animation */}
      <div className="text-8xl animate-pulse">🧬</div>

      <div className="space-y-4">
        <h1 className="text-5xl font-bold text-white">
          Own Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
            Genetic Data
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Store, manage, and share your genomic data on Mantle Network.
          Your DNA, your rules — powered by blockchain and zero-knowledge proofs.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <ConnectKitButton label="Connect Wallet to Get Started" />
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        {features.map((f) => (
          <div
            key={f.title}
            className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 text-left space-y-3 hover:border-emerald-800 transition-colors"
          >
            <div className="text-3xl">{f.icon}</div>
            <h3 className="text-lg font-semibold text-white">{f.title}</h3>
            <p className="text-sm text-gray-400">{f.description}</p>
          </div>
        ))}
      </div>

      {/* Mantle Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-700 text-sm text-gray-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Powered by Mantle Network — Low fees, Fast finality
      </div>
    </div>
  );
}

const features = [
  {
    icon: "🔐",
    title: "Self-Sovereign Identity",
    description:
      "Your DNA profile is a soulbound NFT. Only you control access to your most personal data.",
  },
  {
    icon: "🤝",
    title: "Consent-First Sharing",
    description:
      "Grant or revoke access to approved researchers with a single transaction. Full audit trail on-chain.",
  },
  {
    icon: "💰",
    title: "Earn DNAT Rewards",
    description:
      "Get rewarded in DNA Tokens when your anonymized data contributes to approved scientific research.",
  },
];
