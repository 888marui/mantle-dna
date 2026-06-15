"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { mantleMainnet, mantleTestnet } from "@/lib/chains";

const MANTLE_CHAIN_IDS = new Set([mantleMainnet.id, mantleTestnet.id]);

export function WalletButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isWrongChain = isConnected && chainId !== undefined && !MANTLE_CHAIN_IDS.has(chainId as 5000 | 5003);

  if (!isConnected) {
    return (
      <button
        onClick={() => connect({ connector: connectors[0] })}
        disabled={isPending}
        className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
      >
        {isPending ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  if (isWrongChain) {
    return (
      <button
        onClick={() => switchChain({ chainId: mantleMainnet.id })}
        className="px-4 py-2 rounded-lg bg-yellow-700 hover:bg-yellow-600 text-white text-sm font-medium transition-colors"
      >
        Switch to Mantle
      </button>
    );
  }

  return (
    <button
      onClick={() => disconnect()}
      className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-mono transition-colors"
    >
      {address?.slice(0, 6)}...{address?.slice(-4)}
    </button>
  );
}
