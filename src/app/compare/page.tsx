"use client";

import { useState, useEffect, useCallback } from "react";
import { isAddress } from "viem";
import { analyzeWallet, type WalletAnalysis, type NetworkType } from "@/lib/analyzer";
import Link from "next/link";
import { WalletButton } from "@/components/WalletButton";

const ARCHETYPE_COLORS: Record<number, string> = {
  0: "#f97316", 1: "#06b6d4", 2: "#a855f7", 3: "#22c55e",
  4: "#10b981", 5: "#3b82f6", 6: "#eab308",
};

// Compatibility matrix: how well each archetype pair works together (0-100)
const COMPATIBILITY: Record<string, number> = {
  "0-0": 85, "0-1": 40, "0-2": 55, "0-3": 70, "0-4": 60, "0-5": 50, "0-6": 80,
  "1-0": 40, "1-1": 90, "1-2": 65, "1-3": 80, "1-4": 70, "1-5": 75, "1-6": 45,
  "2-0": 55, "2-1": 65, "2-2": 85, "2-3": 60, "2-4": 70, "2-5": 55, "2-6": 60,
  "3-0": 70, "3-1": 80, "3-2": 60, "3-3": 88, "3-4": 65, "3-5": 72, "3-6": 75,
  "4-0": 60, "4-1": 70, "4-2": 70, "4-3": 65, "4-4": 75, "4-5": 60, "4-6": 65,
  "5-0": 50, "5-1": 75, "5-2": 55, "5-3": 72, "5-4": 60, "5-5": 82, "5-6": 55,
  "6-0": 80, "6-1": 45, "6-2": 60, "6-3": 75, "6-4": 65, "6-5": 55, "6-6": 85,
};

const COMPAT_NOTES: Record<string, string> = {
  "0-1": "Volatile energy meets iron patience — DeFi Degen's risk appetite is checked by Diamond Hands' conviction.",
  "0-3": "Natural allies — both live and breathe yield. One chases risk, the other optimizes it sustainably.",
  "0-6": "Two sides of the same trade — DeFi Degen opens positions, Trader times the exit. Powerful combo.",
  "1-3": "Long-term holders meet yield optimizers — Diamond Hands provides the capital, Yield Farmer puts it to work.",
  "3-6": "Yield Farmer sets the strategy, Trader executes with precision. A formidable LP + timing duo.",
  "0-0": "Two DeFi Degens in the same room? Expect protocol-hopping chaos and competitive APY hunting.",
  "1-1": "Diamond Hands squared — extreme conviction, minimal selling. Together they could move markets long-term.",
  "6-6": "Two Traders watching the same chart — either a competition or a synchronized strategy.",
};

function getCompatNote(a: number, b: number): string {
  const key1 = `${a}-${b}`;
  const key2 = `${b}-${a}`;
  return COMPAT_NOTES[key1] || COMPAT_NOTES[key2] || "A unique on-chain dynamic — complementary DNA sequences that could unlock new strategies on Mantle.";
}

function getCompatScore(a: number, b: number): number {
  const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
  const symKey = `${a}-${b}`;
  return COMPATIBILITY[symKey] || COMPATIBILITY[key] || 65;
}

function getDNADistance(a: WalletAnalysis, b: WalletAnalysis): number {
  const d = Math.sqrt(
    Math.pow((a.deFiScore - b.deFiScore) / 1000, 2) +
    Math.pow((a.holdScore - b.holdScore) / 1000, 2) +
    Math.pow((a.diversityScore - b.diversityScore) / 1000, 2) +
    Math.pow((a.activityScore - b.activityScore) / 1000, 2)
  );
  return Math.round(d * 100) / 100;
}

function WalletInput({
  label,
  value,
  onChange,
  network,
  onNetworkChange,
  loading,
  onAnalyze,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  network: NetworkType;
  onNetworkChange: (n: NetworkType) => void;
  loading: boolean;
  onAnalyze: () => void;
}) {
  const valid = isAddress(value);
  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
      <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-900 border border-gray-800 w-fit">
        {(["mainnet", "sepolia"] as NetworkType[]).map((n) => (
          <button key={n} onClick={() => onNetworkChange(n)}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
            style={{ background: network === n ? "#10b981" : "transparent", color: network === n ? "#fff" : "#6b7280" }}
          >
            {n === "mainnet" ? "🟢 Mainnet" : "🔵 Sepolia"}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="0x... wallet address"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text").trim();
              if (isAddress(pasted)) { onChange(pasted); setTimeout(onAnalyze, 80); }
            }}
            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-600 transition-colors text-sm"
          />
          {value && (
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${valid ? "bg-emerald-500" : "bg-red-500"}`} />
          )}
        </div>
        <button
          onClick={onAnalyze}
          disabled={!valid || loading}
          className="px-4 py-3 rounded-xl font-semibold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "..." : "Analyze"}
        </button>
      </div>
    </div>
  );
}

function MiniCard({ analysis }: { analysis: WalletAnalysis }) {
  const color = ARCHETYPE_COLORS[analysis.archetype] ?? "#10b981";
  const scores = [
    { label: "DeFi", value: analysis.deFiScore },
    { label: "HODL", value: analysis.holdScore },
    { label: "Diversity", value: analysis.diversityScore },
    { label: "Activity", value: analysis.activityScore },
  ];
  return (
    <div className="p-4 rounded-2xl space-y-4"
      style={{
        background: `linear-gradient(135deg, ${color}08, transparent)`,
        border: `1px solid ${color}35`,
        boxShadow: `0 0 20px ${color}12`,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl">{analysis.archetypeEmoji}</div>
        <div>
          <div className="text-xs uppercase tracking-wider" style={{ color }}>{analysis.archetypeName}</div>
          <div className="text-xs text-gray-500 font-mono mt-0.5">
            {analysis.address.slice(0, 8)}...{analysis.address.slice(-6)}
          </div>
          <div className="text-xs text-gray-600 mt-0.5">
            {analysis.network === "mainnet" ? "🟢" : "🔵"} {analysis.mntBalance} MNT · {analysis.txCount} txns
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {scores.map(({ label, value }) => (
          <div key={label} className="space-y-0.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-500">{label}</span>
              <span className="font-mono" style={{ color }}>{value}</span>
            </div>
            <div className="h-1 rounded-full bg-gray-800 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${value / 10}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Mantle Score</span>
        <span className="font-bold" style={{ color }}>{analysis.mantleScore}/100</span>
      </div>

      {analysis.aiInsight && (
        <p className="text-[11px] text-gray-400 leading-relaxed border-t border-gray-800 pt-3 italic">
          &ldquo;{analysis.aiInsight.split(".")[0]}.&rdquo;
        </p>
      )}

      <a
        href={`/wallet/${analysis.address}?network=${analysis.network}`}
        className="block text-center text-[11px] text-emerald-600 hover:text-emerald-400 transition-colors"
      >
        Full DNA Profile →
      </a>
    </div>
  );
}

function ComparisonPanel({ a, b }: { a: WalletAnalysis; b: WalletAnalysis }) {
  const compatScore = getCompatScore(a.archetype, b.archetype);
  const dnaDistance = getDNADistance(a, b);
  const note = getCompatNote(a.archetype, b.archetype);
  const colorA = ARCHETYPE_COLORS[a.archetype] ?? "#10b981";
  const colorB = ARCHETYPE_COLORS[b.archetype] ?? "#06b6d4";

  const scoreDiffs = [
    { label: "DeFi", a: a.deFiScore, b: b.deFiScore },
    { label: "HODLing", a: a.holdScore, b: b.holdScore },
    { label: "Diversity", a: a.diversityScore, b: b.diversityScore },
    { label: "Activity", a: a.activityScore, b: b.activityScore },
  ];

  const compatColor = compatScore >= 75 ? "#22c55e" : compatScore >= 55 ? "#eab308" : "#f97316";

  return (
    <div className="p-5 rounded-2xl space-y-5 bg-gray-900/60 border border-gray-800">
      <div className="text-center space-y-1">
        <div className="text-xs text-gray-500 uppercase tracking-wider">DNA Compatibility</div>
        <div className="text-5xl font-black" style={{ color: compatColor }}>{compatScore}%</div>
        <div className="text-xs" style={{ color: compatColor }}>
          {compatScore >= 75 ? "Highly Compatible" : compatScore >= 55 ? "Moderately Compatible" : "Contrasting Profiles"}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center leading-relaxed italic">&ldquo;{note}&rdquo;</p>

      <div className="space-y-1 text-center">
        <div className="text-xs text-gray-500 uppercase tracking-wider">DNA Distance</div>
        <div className="text-lg font-bold text-gray-300">{dnaDistance}</div>
        <div className="text-[10px] text-gray-600">
          {dnaDistance < 0.5 ? "Nearly identical DNA" : dnaDistance < 1.0 ? "Similar profiles" : "Distinct genomes"}
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-xs text-gray-500 uppercase tracking-wider">Score Comparison</div>
        {scoreDiffs.map(({ label, a: va, b: vb }) => {
          const maxV = Math.max(va, vb);
          const pctA = maxV > 0 ? (va / 1000) * 100 : 0;
          const pctB = maxV > 0 ? (vb / 1000) * 100 : 0;
          const winner = va > vb ? "A" : vb > va ? "B" : null;
          return (
            <div key={label} className="space-y-1">
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>{label}</span>
                {winner && (
                  <span style={{ color: winner === "A" ? colorA : colorB }}>
                    +{Math.abs(va - vb)} {winner === "A" ? "Wallet A" : "Wallet B"}
                  </span>
                )}
              </div>
              <div className="flex gap-1 items-center">
                <div className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden flex justify-end">
                  <div className="h-full rounded-full" style={{ width: `${pctA}%`, background: colorA }} />
                </div>
                <div className="w-4 text-[8px] text-gray-600 text-center">{va > vb ? ">" : va < vb ? "<" : "="}</div>
                <div className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pctB}%`, background: colorB }} />
                </div>
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span style={{ color: colorA }}>{va}</span>
                <span style={{ color: colorB }}>{vb}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="p-2 rounded-lg bg-gray-800/60">
          <div className="text-gray-500">Mantle Score</div>
          <div className="font-bold mt-0.5">
            <span style={{ color: colorA }}>{a.mantleScore}</span>
            <span className="text-gray-600 mx-1">vs</span>
            <span style={{ color: colorB }}>{b.mantleScore}</span>
          </div>
        </div>
        <div className="p-2 rounded-lg bg-gray-800/60">
          <div className="text-gray-500">Transactions</div>
          <div className="font-bold mt-0.5">
            <span style={{ color: colorA }}>{a.txCount}</span>
            <span className="text-gray-600 mx-1">vs</span>
            <span style={{ color: colorB }}>{b.txCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [addrA, setAddrA] = useState("");
  const [addrB, setAddrB] = useState("");
  const [networkA, setNetworkA] = useState<NetworkType>("mainnet");
  const [networkB, setNetworkB] = useState<NetworkType>("mainnet");
  const [analysisA, setAnalysisA] = useState<WalletAnalysis | null>(null);
  const [analysisB, setAnalysisB] = useState<WalletAnalysis | null>(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [errorA, setErrorA] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);

  const analyzeA = useCallback(async () => {
    if (!isAddress(addrA)) return;
    setLoadingA(true); setErrorA(null); setAnalysisA(null);
    try { setAnalysisA(await analyzeWallet(addrA, networkA)); }
    catch { setErrorA("Failed to analyze wallet A"); }
    finally { setLoadingA(false); }
  }, [addrA, networkA]);

  const analyzeB = useCallback(async () => {
    if (!isAddress(addrB)) return;
    setLoadingB(true); setErrorB(null); setAnalysisB(null);
    try { setAnalysisB(await analyzeWallet(addrB, networkB)); }
    catch { setErrorB("Failed to analyze wallet B"); }
    finally { setLoadingB(false); }
  }, [addrB, networkB]);

  // Auto-analyze from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const a = params.get("a");
    const b = params.get("b");
    const net = (params.get("network") ?? "mainnet") as NetworkType;

    if (a && isAddress(a)) {
      setAddrA(a);
      setNetworkA(net);
      setLoadingA(true);
      analyzeWallet(a, net)
        .then(setAnalysisA)
        .catch(() => setErrorA("Failed to analyze wallet A"))
        .finally(() => setLoadingA(false));
    }
    if (b && isAddress(b)) {
      setAddrB(b);
      setNetworkB(net);
      setLoadingB(true);
      analyzeWallet(b, net)
        .then(setAnalysisB)
        .catch(() => setErrorB("Failed to analyze wallet B"))
        .finally(() => setLoadingB(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-gray-800/60 px-6 py-4 backdrop-blur-sm sticky top-0 z-10 bg-[#0a0a0a]/90">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🧬</span>
            <span className="text-base font-bold text-white">Mantle DNA</span>
            <span className="text-gray-600 text-sm">/ Compare</span>
          </Link>
          <WalletButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">
            DNA Comparison
          </h1>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Compare two Mantle wallets side by side — discover your DNA compatibility score and on-chain differences.
          </p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <WalletInput
              label="Wallet A"
              value={addrA}
              onChange={setAddrA}
              network={networkA}
              onNetworkChange={setNetworkA}
              loading={loadingA}
              onAnalyze={analyzeA}
            />
            {errorA && <p className="text-xs text-red-400">{errorA}</p>}
          </div>
          <div className="space-y-2">
            <WalletInput
              label="Wallet B"
              value={addrB}
              onChange={setAddrB}
              network={networkB}
              onNetworkChange={setNetworkB}
              loading={loadingB}
              onAnalyze={analyzeB}
            />
            {errorB && <p className="text-xs text-red-400">{errorB}</p>}
          </div>
        </div>

        {/* Quick example pairs */}
        {!(analysisA && analysisB) && (
          <div className="text-center space-y-2">
            <div className="text-xs text-gray-600 uppercase tracking-wider">Try example pairs</div>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                {
                  label: "DeFi Degen vs Diamond Hands",
                  a: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
                  b: "0x000000000000000000000000000000000000dEaD",
                },
                {
                  label: "Whale vs Trader",
                  a: "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8",
                  b: "0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326",
                },
              ].map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => {
                    setAddrA(ex.a);
                    setAddrB(ex.b);
                    setNetworkA("mainnet");
                    setNetworkB("mainnet");
                  }}
                  className="px-3 py-1.5 rounded-full text-xs border border-gray-700 text-gray-400 hover:border-emerald-700 hover:text-emerald-400 transition-colors"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {(loadingA || loadingB || !!(analysisA || analysisB)) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Wallet A */}
            <div>
              {loadingA ? (
                <div className="flex items-center justify-center h-48 rounded-2xl border border-gray-800">
                  <div className="text-center">
                    <div className="text-3xl animate-spin mb-2">🧬</div>
                    <div className="text-xs text-emerald-400">Analyzing A...</div>
                  </div>
                </div>
              ) : analysisA ? (
                <MiniCard analysis={analysisA} />
              ) : null}
            </div>

            {/* Comparison panel */}
            <div>
              {analysisA && analysisB ? (
                <ComparisonPanel a={analysisA} b={analysisB} />
              ) : (
                <div className="flex items-center justify-center h-full min-h-48">
                  <div className="text-center text-gray-700 text-xs">
                    Analyze both wallets<br />to see comparison
                  </div>
                </div>
              )}
            </div>

            {/* Wallet B */}
            <div>
              {loadingB ? (
                <div className="flex items-center justify-center h-48 rounded-2xl border border-gray-800">
                  <div className="text-center">
                    <div className="text-3xl animate-spin mb-2">🧬</div>
                    <div className="text-xs text-emerald-400">Analyzing B...</div>
                  </div>
                </div>
              ) : analysisB ? (
                <MiniCard analysis={analysisB} />
              ) : null}
            </div>
          </div>
        )}

        {/* Share comparison link */}
        {analysisA && analysisB && (
          <div className="text-center">
            <button
              onClick={() => {
                const url = `${window.location.origin}/compare?a=${addrA}&b=${addrB}`;
                navigator.clipboard.writeText(url).catch(() => {});
                alert("Comparison link copied!");
              }}
              className="text-xs text-emerald-600 hover:text-emerald-400 transition-colors underline underline-offset-2"
            >
              Copy shareable comparison link
            </button>
          </div>
        )}

        <div className="text-center">
          <Link href="/" className="text-xs text-gray-600 hover:text-emerald-400 transition-colors">
            ← Back to DNA Analyzer
          </Link>
        </div>
      </div>
    </main>
  );
}
