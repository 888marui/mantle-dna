"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { mantleMainnet, mantleTestnet } from "@/lib/chains";

const MANTLE_CHAIN_IDS = new Set([mantleMainnet.id, mantleTestnet.id]);

const WALLET_META: Record<string, { icon: string; label: string }> = {
  metaMask:   { icon: "🦊", label: "MetaMask" },
  okxWallet:  { icon: "⬛", label: "OKX Wallet" },
  injected:   { icon: "🔗", label: "Browser Wallet" },
};

function getWalletMeta(id: string) {
  return WALLET_META[id] ?? { icon: "💼", label: id };
}

export function WalletButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const [open, setOpen] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const isWrongChain = isConnected && chainId !== undefined && !MANTLE_CHAIN_IDS.has(chainId as 5000 | 5003);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (isConnected && !isWrongChain) {
    return (
      <button
        onClick={() => disconnect()}
        className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-mono transition-colors"
      >
        {address?.slice(0, 6)}...{address?.slice(-4)}
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
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen((v) => !v); setConnectError(null); }}
        disabled={isPending}
        className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
      >
        {isPending ? "Connecting..." : "Connect Wallet"}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl p-3 space-y-1.5 z-50 shadow-2xl">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider px-1 pb-1">Select Wallet</div>

          {connectors.map((connector) => {
            const { icon, label } = getWalletMeta(connector.id);
            return (
              <button
                key={connector.id}
                onClick={() => {
                  setConnectError(null);
                  connect(
                    { connector },
                    {
                      onSuccess: () => setOpen(false),
                      onError: (e) => {
                        const msg = e.message.toLowerCase();
                        if (msg.includes("not found") || msg.includes("provider") || msg.includes("no injected")) {
                          setConnectError(`${label} not found. Please install it.`);
                        } else {
                          setConnectError(e.message.slice(0, 60));
                        }
                      },
                    }
                  );
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 text-sm text-white transition-colors text-left border border-transparent hover:border-gray-700"
              >
                <span className="text-lg">{icon}</span>
                <span className="font-medium">{label}</span>
              </button>
            );
          })}

          {connectors.length === 0 && (
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-yellow-400 hover:bg-gray-800 transition-colors"
            >
              ⚠ No wallet found — Install MetaMask ↗
            </a>
          )}

          {connectError && (
            <div className="px-2 pt-1 text-[10px] text-yellow-500 leading-relaxed">
              ⚠ {connectError}
              {connectError.toLowerCase().includes("not found") && (
                <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer"
                  className="ml-1 underline hover:text-yellow-300">
                  Install ↗
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
