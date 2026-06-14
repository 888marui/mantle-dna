const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying Mantle DNA contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MNT");

  console.log("\n1. Deploying WalletDNA...");
  const WalletDNA = await ethers.getContractFactory("WalletDNA");
  const walletDNA = await WalletDNA.deploy();
  await walletDNA.waitForDeployment();
  const walletDNAAddress = await walletDNA.getAddress();
  console.log("WalletDNA deployed to:", walletDNAAddress);

  // Set deployer as initial analyzer (replace with oracle address in production)
  console.log("\n2. Setting analyzer to deployer (update to oracle in production)...");
  await (await walletDNA.setAnalyzer(deployer.address)).wait();
  console.log("Analyzer set to:", deployer.address);

  console.log("\n--- Deployment Summary ---");
  console.log("WalletDNA:  ", walletDNAAddress);
  console.log("\nAdd to .env:");
  console.log(`NEXT_PUBLIC_WALLET_DNA_ADDRESS=${walletDNAAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
