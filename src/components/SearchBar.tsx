"use client";

import { useState } from "react";
import { isAddress } from "viem";
import { type NetworkType } from "@/lib/analyzer";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

interface Props {
  onAnalyze: (address: string, network: NetworkType) => void;
  loading: boolean;
}

export function SearchBar({ onAnalyze, loading }: Props) {
  const [input, setInput] = useState("");
  const [network, setNetwork] = useState<NetworkType>('mainnet');
  const { lang } = useLanguage();
  const isValid = isAddress(input);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onAnalyze(input, network);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setInput("");
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").trim();
    if (isAddress(pasted)) {
      // Defer to next tick so React state updates first
      setTimeout(() => onAnalyze(pasted, network), 50);
    }
  };

  return (
    <div className="flex flex-col gap-3 max-w-2xl mx-auto">
      {/* Network toggle */}
      <div className="flex items-center justify-center gap-1 p-1 rounded-xl bg-gray-900 border border-gray-800 w-fit mx-auto">
        {(['mainnet', 'sepolia'] as NetworkType[]).map((net) => (
          <button
            key={net}
            type="button"
            onClick={() => setNetwork(net)}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: network === net ? '#10b981' : 'transparent',
              color: network === net ? '#fff' : '#6b7280',
            }}
          >
            {net === 'mainnet' ? '🟢 Mantle Mainnet' : '🔵 Mantle Sepolia'}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={t(lang, "search_placeholder")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            autoFocus
            className="w-full px-5 py-4 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-600 transition-colors text-sm"
          />
          {input && (
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${isValid ? "bg-emerald-500" : "bg-red-500"}`} />
          )}
        </div>
        <button
          type="submit"
          disabled={!isValid || loading}
          className="px-6 py-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
        >
          {loading ? `${t(lang, "loading_1").split("...")[0]}...` : t(lang, "search_button")}
        </button>
      </form>
    </div>
  );
}
