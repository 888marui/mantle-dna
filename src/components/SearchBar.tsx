"use client";

import { useState } from "react";
import { isAddress } from "viem";

interface Props {
  onAnalyze: (address: string) => void;
  loading: boolean;
}

export function SearchBar({ onAnalyze, loading }: Props) {
  const [input, setInput] = useState("");
  const isValid = isAddress(input);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onAnalyze(input);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 max-w-2xl mx-auto">
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Enter Mantle wallet address (0x...)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
        {loading ? "Analyzing..." : "Analyze DNA"}
      </button>
    </form>
  );
}
