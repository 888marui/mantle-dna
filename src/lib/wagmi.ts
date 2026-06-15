import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { mantleMainnet, mantleTestnet } from "./chains";

export { mantleMainnet, mantleTestnet };

export const config = createConfig({
  chains: [mantleTestnet, mantleMainnet],
  transports: {
    [mantleTestnet.id]: http("https://rpc.sepolia.mantle.xyz"),
    [mantleMainnet.id]: http("https://rpc.mantle.xyz"),
  },
  connectors: [injected()],
});
