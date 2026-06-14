const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WalletDNA", function () {
  let walletDNA;
  let owner, analyzer, user1, user2;

  const sampleTraits = {
    archetype: 0, // DeFiDegen
    txCount: 500,
    deFiScore: 850,
    holdScore: 300,
    diversityScore: 720,
    activityScore: 900,
    firstSeenBlock: 1000000,
    analyzedAt: Math.floor(Date.now() / 1000),
  };

  const SAMPLE_TOKEN_URI = "ipfs://QmWalletDNAMetadata";

  beforeEach(async function () {
    [owner, analyzer, user1, user2] = await ethers.getSigners();

    const WalletDNA = await ethers.getContractFactory("WalletDNA");
    walletDNA = await WalletDNA.deploy();

    await walletDNA.setAnalyzer(analyzer.address);
  });

  describe("Deployment", function () {
    it("should have correct name and symbol", async function () {
      expect(await walletDNA.name()).to.equal("Mantle Wallet DNA");
      expect(await walletDNA.symbol()).to.equal("MDNA");
    });

    it("should set correct analyzer", async function () {
      expect(await walletDNA.analyzer()).to.equal(analyzer.address);
    });
  });

  describe("Minting DNA", function () {
    it("should mint DNA NFT to wallet", async function () {
      await walletDNA.connect(analyzer).mintDNA(user1.address, SAMPLE_TOKEN_URI, sampleTraits);

      const tokenId = await walletDNA.walletToTokenId(user1.address);
      expect(tokenId).to.equal(1n);
      expect(await walletDNA.ownerOf(1n)).to.equal(user1.address);
    });

    it("should store correct DNA traits", async function () {
      await walletDNA.connect(analyzer).mintDNA(user1.address, SAMPLE_TOKEN_URI, sampleTraits);

      const traits = await walletDNA.getWalletDNA(user1.address);
      expect(traits.archetype).to.equal(sampleTraits.archetype);
      expect(traits.txCount).to.equal(sampleTraits.txCount);
      expect(traits.deFiScore).to.equal(sampleTraits.deFiScore);
      expect(traits.holdScore).to.equal(sampleTraits.holdScore);
    });

    it("should not allow non-analyzer to mint", async function () {
      await expect(
        walletDNA.connect(user1).mintDNA(user2.address, SAMPLE_TOKEN_URI, sampleTraits)
      ).to.be.revertedWith("Not authorized analyzer");
    });

    it("should not allow minting twice for same wallet", async function () {
      await walletDNA.connect(analyzer).mintDNA(user1.address, SAMPLE_TOKEN_URI, sampleTraits);

      await expect(
        walletDNA.connect(analyzer).mintDNA(user1.address, SAMPLE_TOKEN_URI, sampleTraits)
      ).to.be.revertedWith("DNA already minted for this wallet");
    });

    it("should emit DNAMinted event", async function () {
      await expect(
        walletDNA.connect(analyzer).mintDNA(user1.address, SAMPLE_TOKEN_URI, sampleTraits)
      )
        .to.emit(walletDNA, "DNAMinted")
        .withArgs(user1.address, 1n, sampleTraits.archetype);
    });
  });

  describe("Soulbound", function () {
    it("should prevent transfer of DNA NFT", async function () {
      await walletDNA.connect(analyzer).mintDNA(user1.address, SAMPLE_TOKEN_URI, sampleTraits);

      await expect(
        walletDNA.connect(user1).transferFrom(user1.address, user2.address, 1n)
      ).to.be.revertedWith("Wallet DNA is soulbound");
    });
  });

  describe("Updating DNA", function () {
    it("should allow analyzer to update traits", async function () {
      await walletDNA.connect(analyzer).mintDNA(user1.address, SAMPLE_TOKEN_URI, sampleTraits);

      const updatedTraits = { ...sampleTraits, archetype: 1, txCount: 800 }; // DiamondHands
      await walletDNA.connect(analyzer).updateDNA(1n, "ipfs://QmNewMetadata", updatedTraits);

      const traits = await walletDNA.getWalletDNA(user1.address);
      expect(traits.archetype).to.equal(1);
      expect(traits.txCount).to.equal(800);
    });
  });

  describe("Archetype names", function () {
    const archetypes = [
      [0, "DeFi Degen"],
      [1, "Diamond Hands"],
      [2, "NFT Collector"],
      [3, "Yield Farmer"],
      [4, "Newcomer"],
      [5, "Whale"],
      [6, "Trader"],
    ];

    archetypes.forEach(([id, name]) => {
      it(`should return name for archetype ${id}`, async function () {
        expect(await walletDNA.getArchetypeName(id)).to.equal(name);
      });
    });
  });

  describe("Total minted", function () {
    it("should track total minted count", async function () {
      expect(await walletDNA.totalMinted()).to.equal(0n);

      await walletDNA.connect(analyzer).mintDNA(user1.address, SAMPLE_TOKEN_URI, sampleTraits);
      expect(await walletDNA.totalMinted()).to.equal(1n);

      await walletDNA.connect(analyzer).mintDNA(user2.address, SAMPLE_TOKEN_URI, sampleTraits);
      expect(await walletDNA.totalMinted()).to.equal(2n);
    });
  });
});
