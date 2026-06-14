"use client";

import { ConnectKitButton } from "connectkit";
import { useAccount, useReadContract } from "wagmi";
import { DNA_PROFILE_ADDRESS, DNA_PROFILE_ABI } from "@/lib/contracts";
import { ProfileCard } from "@/components/ProfileCard";
import { CreateProfileForm } from "@/components/CreateProfileForm";
import { StatsBar } from "@/components/StatsBar";
import { HeroSection } from "@/components/HeroSection";

export default function Home() {
  const { address, isConnected } = useAccount();

  const { data: tokenId } = useReadContract({
    address: DNA_PROFILE_ADDRESS,
    abi: DNA_PROFILE_ABI,
    functionName: "getTokenId",
    args: [address!],
    query: { enabled: !!address },
  });

  const hasProfile = tokenId !== undefined && tokenId > 0n;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-sm font-bold">
              🧬
            </div>
            <span className="text-xl font-bold text-white">Mantle DNA</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-900 text-emerald-400 border border-emerald-700">
              Hackathon Demo
            </span>
          </div>
          <ConnectKitButton />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {!isConnected ? (
          <HeroSection />
        ) : (
          <div className="space-y-8">
            <StatsBar />
            {hasProfile ? (
              <ProfileCard tokenId={tokenId!} address={address!} />
            ) : (
              <CreateProfileForm />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
