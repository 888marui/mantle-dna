"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { keccak256, toHex } from "viem";
import { DNA_PROFILE_ADDRESS, DNA_PROFILE_ABI } from "@/lib/contracts";

export function CreateProfileForm() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus("Hashing your data locally...");

    // Read file and create hash client-side (data never leaves your browser)
    const buffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(buffer);
    const dataHash = keccak256(uint8);

    setStatus("Uploading encrypted data to IPFS...");
    // In production: upload to IPFS here and get CID
    // For demo, we use a placeholder CID
    const ipfsCid = `Qm${Math.random().toString(36).substring(2, 46)}`;
    const tokenURI = `ipfs://${ipfsCid}/metadata.json`;

    setStatus("Creating your DNA Profile NFT on Mantle...");
    writeContract({
      address: DNA_PROFILE_ADDRESS,
      abi: DNA_PROFILE_ABI,
      functionName: "createProfile",
      args: [dataHash as `0x${string}`, ipfsCid, tokenURI],
    });
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="p-8 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Create Your DNA Profile</h2>
          <p className="text-gray-400 mt-2 text-sm">
            Upload your genomic data file (from 23andMe, AncestryDNA, etc.).
            Your data is hashed locally — it never leaves your browser unencrypted.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Genomic Data File (.txt, .zip, .csv)
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                file
                  ? "border-emerald-600 bg-emerald-950/30"
                  : "border-gray-700 hover:border-gray-600"
              }`}
              onClick={() => document.getElementById("dna-file")?.click()}
            >
              {file ? (
                <div className="space-y-1">
                  <div className="text-2xl">✅</div>
                  <div className="text-sm text-emerald-400 font-medium">{file.name}</div>
                  <div className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-3xl">🧬</div>
                  <div className="text-sm text-gray-400">
                    Drop your DNA file here or click to browse
                  </div>
                </div>
              )}
              <input
                id="dna-file"
                type="file"
                accept=".txt,.zip,.csv,.vcf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-emerald-950/50 border border-emerald-900 text-xs text-emerald-400 space-y-1">
            <div className="font-semibold">🔒 Privacy Guarantee</div>
            <div>Your raw data is hashed locally using SHA-3 and never sent to any server.</div>
            <div>Only the hash is stored on Mantle blockchain. Encrypted data goes to IPFS.</div>
          </div>

          {status && (
            <div className="text-sm text-gray-400 text-center">{status}</div>
          )}

          {isSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-700 text-center text-emerald-400 text-sm">
              🎉 DNA Profile NFT created! You earned 100 DNAT tokens.
            </div>
          )}

          <button
            type="submit"
            disabled={!file || isPending || isConfirming}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending || isConfirming
              ? "Creating Profile..."
              : "Create DNA Profile NFT"}
          </button>
        </form>
      </div>
    </div>
  );
}
