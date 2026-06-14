import { createConfig, http } from "wagmi";
import { getDefaultConfig } from "connectkit";
import { mantleMainnet, mantleTestnet } from "./chains";

export { mantleMainnet, mantleTestnet };

export const config = createConfig(
  getDefaultConfig({
    chains: [mantleTestnet, mantleMainnet],
    transports: {
      [mantleTestnet.id]: http("https://rpc.sepolia.mantle.xyz"),
      [mantleMainnet.id]: http("https://rpc.mantle.xyz"),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
    appName: "Mantle DNA",
    appDescription: "AI-powered wallet DNA analysis on Mantle Network",
    appUrl: "https://mantle-dna.xyz",
  })
);
