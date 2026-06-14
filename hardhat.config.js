require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";
const MANTLE_RPC_URL = process.env.MANTLE_RPC_URL || "https://rpc.mantle.xyz";
const MANTLE_TESTNET_RPC_URL = process.env.MANTLE_TESTNET_RPC_URL || "https://rpc.sepolia.mantle.xyz";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    mantle: {
      url: MANTLE_RPC_URL,
      chainId: 5000,
      accounts: [PRIVATE_KEY],
    },
    mantleTestnet: {
      url: MANTLE_TESTNET_RPC_URL,
      chainId: 5003,
      accounts: [PRIVATE_KEY],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
