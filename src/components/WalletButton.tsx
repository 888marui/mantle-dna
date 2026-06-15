"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { mantleMainnet, mantleTestnet } from "@/lib/chains";

const MANTLE_CHAIN_IDS = new Set([mantleMainnet.id, mantleTestnet.id]);

export function WalletButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [noWalletMsg, setNoWalletMsg] = useState(false);

  const isWrongChain = isConnected && chainId !== undefined && !MANTLE_CHAIN_IDS.has(chainId as 5000 | 5003);

  const handleConnect = () => {
    setNoWalletMsg(false);
    const connector = connectors[0];
    if (!connector) {
      setNoWalletMsg(true);
      return;
    }
    connect(
      { connector },
      {
        onError: (e) => {
          if (
            e.message.toLowerCase().includes("not found") ||
            e.message.toLowerCase().includes("provider") ||
            e.message.toLowerCase().includes("injected")
          ) {
            setNoWalletMsg(true);
          }
        },
      }
    );
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={handleConnect}
          disabled={isPending}
          className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isPending ? "Connecting..." : "Connect Wallet"}
        </button>
        {noWalletMsg && (
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-yellow-500 hover:text-yellow-400 transition-colors whitespace-nowrap"
            onClick={() => setNoWalletMsg(false)}
          >
            ⚠ No wallet found — Install MetaMask ↗
          </a>
        )}
      </div>
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
