"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState } from "react";
import {
  DNA_PROFILE_ADDRESS,
  DNA_PROFILE_ABI,
  CONSENT_MANAGER_ADDRESS,
  CONSENT_MANAGER_ABI,
} from "@/lib/contracts";

interface Props {
  tokenId: bigint;
  address: string;
}

export function ProfileCard({ tokenId, address }: Props) {
  const [researcherAddr, setResearcherAddr] = useState("");
  const [purpose, setPurpose] = useState("");
  const [duration, setDuration] = useState("30");

  const { data: profile } = useReadContract({
    address: DNA_PROFILE_ADDRESS,
    abi: DNA_PROFILE_ABI,
    functionName: "getProfile",
    args: [tokenId],
  });

  const { writeContract: grantConsent, data: grantHash, isPending: isGranting } = useWriteContract();
  const { isSuccess: isGranted } = useWaitForTransactionReceipt({ hash: grantHash });

  const { writeContract: deactivate, isPending: isDeactivating } = useWriteContract();

  if (!profile) return null;

  const handleGrantConsent = () => {
    if (!researcherAddr) return;
    grantConsent({
      address: CONSENT_MANAGER_ADDRESS,
      abi: CONSENT_MANAGER_ABI,
      functionName: "grantConsent",
      args: [researcherAddr as `0x${string}`, purpose || "Research", BigInt(duration)],
    });
  };

  const formatDate = (ts: bigint) =>
    new Date(Number(ts) * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Profile Info */}
      <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl">
            🧬
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">DNA Profile #{tokenId.toString()}</h2>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                profile.isActive
                  ? "bg-emerald-900 text-emerald-400 border border-emerald-700"
                  : "bg-red-900 text-red-400 border border-red-700"
              }`}
            >
              {profile.isActive ? "Active" : "Deactivated"}
            </span>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <InfoRow label="Wallet" value={`${address.slice(0, 6)}...${address.slice(-4)}`} />
          <InfoRow
            label="Data Hash"
            value={`${profile.dataHash.slice(0, 10)}...${profile.dataHash.slice(-8)}`}
          />
          <InfoRow label="IPFS CID" value={`${profile.ipfsCid.slice(0, 20)}...`} />
          <InfoRow label="Created" value={formatDate(profile.createdAt)} />
          <InfoRow label="Last Updated" value={formatDate(profile.updatedAt)} />
        </div>

        {profile.isActive && (
          <button
            onClick={() =>
              deactivate({
                address: DNA_PROFILE_ADDRESS,
                abi: DNA_PROFILE_ABI,
                functionName: "deactivateProfile",
              })
            }
            disabled={isDeactivating}
            className="w-full py-2 text-sm rounded-lg border border-red-800 text-red-400 hover:bg-red-950 transition-colors disabled:opacity-50"
          >
            {isDeactivating ? "Deactivating..." : "Deactivate Profile"}
          </button>
        )}
      </div>

      {/* Consent Management */}
      <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-5">
        <h3 className="text-lg font-bold text-white">Grant Research Access</h3>
        <p className="text-sm text-gray-400">
          Share your genomic data with approved research institutions and earn DNAT tokens.
        </p>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Researcher wallet address (0x...)"
            value={researcherAddr}
            onChange={(e) => setResearcherAddr(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-600"
          />
          <input
            type="text"
            placeholder="Research purpose (e.g., Cancer genetics study)"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-600"
          />
          <div className="flex gap-2">
            {["7", "30", "90", "365"].map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`flex-1 py-2 text-xs rounded-lg transition-colors ${
                  duration === d
                    ? "bg-emerald-700 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {d} days
              </button>
            ))}
          </div>
        </div>

        {isGranted && (
          <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-700 text-center text-emerald-400 text-sm">
            ✅ Consent granted! You earned 10 DNAT tokens.
          </div>
        )}

        <button
          onClick={handleGrantConsent}
          disabled={!researcherAddr || isGranting}
          className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGranting ? "Granting Access..." : "Grant Consent (+10 DNAT)"}
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300 font-mono text-xs">{value}</span>
    </div>
  );
}
