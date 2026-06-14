const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Mantle DNA Platform", function () {
  let dnaToken, dnaProfile, consentManager;
  let owner, user1, user2, researcher;

  const SAMPLE_DATA_HASH = ethers.keccak256(ethers.toUtf8Bytes("sample_encrypted_dna_data"));
  const SAMPLE_IPFS_CID = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
  const SAMPLE_TOKEN_URI = "ipfs://QmMetadataHash";

  beforeEach(async function () {
    [owner, user1, user2, researcher] = await ethers.getSigners();

    // Deploy contracts
    const DNAToken = await ethers.getContractFactory("DNAToken");
    dnaToken = await DNAToken.deploy();

    const DNAProfile = await ethers.getContractFactory("DNAProfile");
    dnaProfile = await DNAProfile.deploy(await dnaToken.getAddress());

    const ConsentManager = await ethers.getContractFactory("ConsentManager");
    consentManager = await ConsentManager.deploy(
      await dnaProfile.getAddress(),
      await dnaToken.getAddress()
    );

    // Set DNAProfile as minter
    await dnaToken.setMinter(await dnaProfile.getAddress());
  });

  describe("DNAToken", function () {
    it("should have correct name and symbol", async function () {
      expect(await dnaToken.name()).to.equal("DNA Token");
      expect(await dnaToken.symbol()).to.equal("DNAT");
    });

    it("should mint initial supply to owner", async function () {
      const balance = await dnaToken.balanceOf(owner.address);
      expect(balance).to.equal(ethers.parseEther("1000000"));
    });

    it("should allow minter to mint tokens", async function () {
      await dnaToken.connect(owner).mint(user1.address, ethers.parseEther("100"));
      expect(await dnaToken.balanceOf(user1.address)).to.equal(ethers.parseEther("100"));
    });
  });

  describe("DNAProfile", function () {
    it("should create a profile and mint NFT", async function () {
      await dnaProfile.connect(user1).createProfile(
        SAMPLE_DATA_HASH,
        SAMPLE_IPFS_CID,
        SAMPLE_TOKEN_URI
      );

      const tokenId = await dnaProfile.getTokenId(user1.address);
      expect(tokenId).to.equal(1);

      const profile = await dnaProfile.getProfile(tokenId);
      expect(profile.dataHash).to.equal(SAMPLE_DATA_HASH);
      expect(profile.ipfsCid).to.equal(SAMPLE_IPFS_CID);
      expect(profile.isActive).to.be.true;
    });

    it("should reward user with DNAT tokens on profile creation", async function () {
      // Give DNAProfile enough tokens to reward
      await dnaToken.connect(owner).mint(await dnaProfile.getAddress(), ethers.parseEther("1000"));

      const balanceBefore = await dnaToken.balanceOf(user1.address);
      await dnaProfile.connect(user1).createProfile(
        SAMPLE_DATA_HASH,
        SAMPLE_IPFS_CID,
        SAMPLE_TOKEN_URI
      );
      const balanceAfter = await dnaToken.balanceOf(user1.address);

      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("100"));
    });

    it("should not allow duplicate profiles", async function () {
      await dnaProfile.connect(user1).createProfile(
        SAMPLE_DATA_HASH,
        SAMPLE_IPFS_CID,
        SAMPLE_TOKEN_URI
      );

      await expect(
        dnaProfile.connect(user1).createProfile(
          SAMPLE_DATA_HASH,
          SAMPLE_IPFS_CID,
          SAMPLE_TOKEN_URI
        )
      ).to.be.revertedWith("Profile already exists");
    });

    it("should be soulbound (non-transferable)", async function () {
      await dnaProfile.connect(user1).createProfile(
        SAMPLE_DATA_HASH,
        SAMPLE_IPFS_CID,
        SAMPLE_TOKEN_URI
      );

      const tokenId = await dnaProfile.getTokenId(user1.address);

      await expect(
        dnaProfile.connect(user1).transferFrom(user1.address, user2.address, tokenId)
      ).to.be.revertedWith("DNA Profile is soulbound");
    });

    it("should allow updating profile data", async function () {
      await dnaProfile.connect(user1).createProfile(
        SAMPLE_DATA_HASH,
        SAMPLE_IPFS_CID,
        SAMPLE_TOKEN_URI
      );

      const newHash = ethers.keccak256(ethers.toUtf8Bytes("updated_dna_data"));
      const newCid = "QmNewCID";

      await dnaProfile.connect(user1).updateProfile(newHash, newCid);

      const tokenId = await dnaProfile.getTokenId(user1.address);
      const profile = await dnaProfile.getProfile(tokenId);
      expect(profile.dataHash).to.equal(newHash);
      expect(profile.ipfsCid).to.equal(newCid);
    });

    it("should allow deactivating profile", async function () {
      await dnaProfile.connect(user1).createProfile(
        SAMPLE_DATA_HASH,
        SAMPLE_IPFS_CID,
        SAMPLE_TOKEN_URI
      );

      await dnaProfile.connect(user1).deactivateProfile();

      const tokenId = await dnaProfile.getTokenId(user1.address);
      const profile = await dnaProfile.getProfile(tokenId);
      expect(profile.isActive).to.be.false;
    });
  });

  describe("ConsentManager", function () {
    beforeEach(async function () {
      // Setup: user1 creates profile, researcher is approved
      await dnaProfile.connect(user1).createProfile(
        SAMPLE_DATA_HASH,
        SAMPLE_IPFS_CID,
        SAMPLE_TOKEN_URI
      );
      await consentManager.connect(owner).approveResearcher(researcher.address, "Tokyo University");
    });

    it("should allow granting consent to a researcher", async function () {
      await consentManager.connect(user1).grantConsent(researcher.address, "Cancer research", 30);

      const isValid = await consentManager.hasValidConsent(user1.address, researcher.address);
      expect(isValid).to.be.true;
    });

    it("should allow revoking consent", async function () {
      await consentManager.connect(user1).grantConsent(researcher.address, "Cancer research", 30);
      await consentManager.connect(user1).revokeConsent(researcher.address);

      const isValid = await consentManager.hasValidConsent(user1.address, researcher.address);
      expect(isValid).to.be.false;
    });

    it("should reject data access without consent", async function () {
      await expect(
        consentManager.connect(researcher).getDataCID(user1.address)
      ).to.be.revertedWith("No valid consent");
    });

    it("should return data CID with valid consent", async function () {
      await consentManager.connect(user1).grantConsent(researcher.address, "Genetics study", 30);

      const cid = await consentManager.connect(researcher).getDataCID(user1.address);
      expect(cid).to.equal(SAMPLE_IPFS_CID);
    });

    it("should not allow unapproved researcher to access data", async function () {
      await expect(
        consentManager.connect(user2).getDataCID(user1.address)
      ).to.be.revertedWith("Not an approved researcher");
    });
  });
});
