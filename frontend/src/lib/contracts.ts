export const DNA_PROFILE_ADDRESS = process.env.NEXT_PUBLIC_DNA_PROFILE_ADDRESS as `0x${string}`;
export const CONSENT_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_CONSENT_MANAGER_ADDRESS as `0x${string}`;
export const DNA_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_DNA_TOKEN_ADDRESS as `0x${string}`;

export const DNA_PROFILE_ABI = [
  {
    inputs: [
      { name: "_dataHash", type: "bytes32" },
      { name: "_ipfsCid", type: "string" },
      { name: "_tokenURI", type: "string" },
    ],
    name: "createProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_newDataHash", type: "bytes32" },
      { name: "_newIpfsCid", type: "string" },
    ],
    name: "updateProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "deactivateProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_owner", type: "address" }],
    name: "getTokenId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getProfile",
    outputs: [
      {
        components: [
          { name: "dataHash", type: "bytes32" },
          { name: "ipfsCid", type: "string" },
          { name: "createdAt", type: "uint256" },
          { name: "updatedAt", type: "uint256" },
          { name: "isActive", type: "bool" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalProfiles",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const CONSENT_MANAGER_ABI = [
  {
    inputs: [
      { name: "_researcher", type: "address" },
      { name: "_purpose", type: "string" },
      { name: "_durationDays", type: "uint256" },
    ],
    name: "grantConsent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_researcher", type: "address" }],
    name: "revokeConsent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_researcher", type: "address" },
    ],
    name: "hasValidConsent",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_researcher", type: "address" }],
    name: "approvedResearchers",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const DNA_TOKEN_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
