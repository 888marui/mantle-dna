export const WALLET_DNA_ADDRESS = (process.env.NEXT_PUBLIC_WALLET_DNA_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const WALLET_DNA_ABI = [
  {
    inputs: [
      { name: "_wallet", type: "address" },
      { name: "_tokenURI", type: "string" },
      {
        components: [
          { name: "archetype", type: "uint8" },
          { name: "txCount", type: "uint16" },
          { name: "deFiScore", type: "uint16" },
          { name: "holdScore", type: "uint16" },
          { name: "diversityScore", type: "uint16" },
          { name: "activityScore", type: "uint16" },
          { name: "firstSeenBlock", type: "uint32" },
          { name: "analyzedAt", type: "uint32" },
        ],
        name: "_traits",
        type: "tuple",
      },
    ],
    name: "mintDNA",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_wallet", type: "address" }],
    name: "getWalletDNA",
    outputs: [
      {
        components: [
          { name: "archetype", type: "uint8" },
          { name: "txCount", type: "uint16" },
          { name: "deFiScore", type: "uint16" },
          { name: "holdScore", type: "uint16" },
          { name: "diversityScore", type: "uint16" },
          { name: "activityScore", type: "uint16" },
          { name: "firstSeenBlock", type: "uint32" },
          { name: "analyzedAt", type: "uint32" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_wallet", type: "address" }],
    name: "walletToTokenId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalMinted",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "archetype", type: "uint8" }],
    name: "getArchetypeName",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "pure",
    type: "function",
  },
] as const;
