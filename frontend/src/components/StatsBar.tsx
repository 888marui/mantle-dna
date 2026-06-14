"use client";

import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { DNA_PROFILE_ADDRESS, DNA_PROFILE_ABI, DNA_TOKEN_ADDRESS, DNA_TOKEN_ABI } from "@/lib/contracts";
import { formatEther } from "viem";

export function StatsBar() {
  const { address } = useAccount();

  const { data: totalProfiles } = useReadContract({
    address: DNA_PROFILE_ADDRESS,
    abi: DNA_PROFILE_ABI,
    functionName: "totalProfiles",
  });

  const { data: dnatBalance } = useReadContract({
    address: DNA_TOKEN_ADDRESS,
    abi: DNA_TOKEN_ABI,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: !!address },
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Total Profiles"
        value={totalProfiles?.toString() ?? "0"}
        icon="👥"
      />
      <StatCard
        label="Your DNAT Balance"
        value={dnatBalance ? `${Number(formatEther(dnatBalance)).toFixed(1)}` : "0"}
        icon="🪙"
        suffix="DNAT"
      />
      <StatCard label="Network" value="Mantle" icon="⛓️" suffix="Testnet" />
      <StatCard label="Avg. Tx Cost" value="< $0.01" icon="⚡" />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  suffix,
}: {
  label: string;
  value: string;
  icon: string;
  suffix?: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-lg font-semibold text-white">
        {value} {suffix && <span className="text-sm text-gray-400">{suffix}</span>}
      </div>
    </div>
  );
}
