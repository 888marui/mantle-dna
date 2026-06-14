const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MNT");

  // 1. Deploy DNAToken
  console.log("\n1. Deploying DNAToken...");
  const DNAToken = await ethers.getContractFactory("DNAToken");
  const dnaToken = await DNAToken.deploy();
  await dnaToken.waitForDeployment();
  const dnaTokenAddress = await dnaToken.getAddress();
  console.log("DNAToken deployed to:", dnaTokenAddress);

  // 2. Deploy DNAProfile
  console.log("\n2. Deploying DNAProfile...");
  const DNAProfile = await ethers.getContractFactory("DNAProfile");
  const dnaProfile = await DNAProfile.deploy(dnaTokenAddress);
  await dnaProfile.waitForDeployment();
  const dnaProfileAddress = await dnaProfile.getAddress();
  console.log("DNAProfile deployed to:", dnaProfileAddress);

  // 3. Deploy ConsentManager
  console.log("\n3. Deploying ConsentManager...");
  const ConsentManager = await ethers.getContractFactory("ConsentManager");
  const consentManager = await ConsentManager.deploy(dnaProfileAddress, dnaTokenAddress);
  await consentManager.waitForDeployment();
  const consentManagerAddress = await consentManager.getAddress();
  console.log("ConsentManager deployed to:", consentManagerAddress);

  // 4. Set minters
  console.log("\n4. Setting minters...");
  const setMinterForProfile = await dnaToken.setMinter(dnaProfileAddress);
  await setMinterForProfile.wait();
  console.log("DNAProfile set as minter for DNAToken");

  // Note: ConsentManager also needs to mint; using owner for now in demo
  // In production, set up a multi-minter pattern

  console.log("\n--- Deployment Summary ---");
  console.log("DNAToken:        ", dnaTokenAddress);
  console.log("DNAProfile:      ", dnaProfileAddress);
  console.log("ConsentManager:  ", consentManagerAddress);
  console.log("\nAdd these to your .env:");
  console.log(`NEXT_PUBLIC_DNA_TOKEN_ADDRESS=${dnaTokenAddress}`);
  console.log(`NEXT_PUBLIC_DNA_PROFILE_ADDRESS=${dnaProfileAddress}`);
  console.log(`NEXT_PUBLIC_CONSENT_MANAGER_ADDRESS=${consentManagerAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
