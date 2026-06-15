// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title WalletDNA - Soulbound NFT encoding a wallet's on-chain personality on Mantle
contract WalletDNA is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    /// @notice Wallet personality archetypes derived from on-chain analysis
    enum Archetype {
        DeFiDegen,      // High-frequency DeFi interactions
        DiamondHands,   // Long-term holder, low churn
        NFTCollector,   // Heavy NFT activity
        YieldFarmer,    // Liquidity provision focus
        Newcomer,       // Recent wallet, low activity
        Whale,          // High-value transactions
        Trader          // Active swap / DEX user
    }

    struct DNATraits {
        Archetype archetype;
        uint16 txCount;           // Total transactions on Mantle
        uint16 deFiScore;         // 0-1000: DeFi engagement score
        uint16 holdScore;         // 0-1000: HODLing tendency
        uint16 diversityScore;    // 0-1000: Protocol diversity
        uint16 activityScore;     // 0-1000: Recent activity
        uint32 firstSeenBlock;    // First transaction block
        uint32 analyzedAt;        // Unix timestamp of analysis
        bytes32 aiInsightHash;    // keccak256 of the AI insight text
    }

    mapping(uint256 => DNATraits) public dnaTraits;
    mapping(address => uint256) public walletToTokenId;

    address public analyzer; // Authorized off-chain analysis oracle

    event DNAMinted(address indexed wallet, uint256 indexed tokenId, Archetype archetype);
    event DNAUpdated(uint256 indexed tokenId, Archetype newArchetype);
    event AnalyzerUpdated(address indexed newAnalyzer);

    constructor() ERC721("Mantle Wallet DNA", "MDNA") Ownable(msg.sender) {}

    modifier onlyAnalyzer() {
        require(msg.sender == analyzer || msg.sender == owner(), "Not authorized analyzer");
        _;
    }

    function setAnalyzer(address _analyzer) external onlyOwner {
        analyzer = _analyzer;
        emit AnalyzerUpdated(_analyzer);
    }

    /// @notice Mint a DNA NFT for a wallet.
    /// @dev Callers: (1) wallet mints its own DNA (self-mint), or
    ///              (2) authorized analyzer/owner mints on behalf of a wallet.
    function mintDNA(
        address _wallet,
        string calldata _tokenURI,
        DNATraits calldata _traits
    ) external {
        require(
            msg.sender == _wallet || msg.sender == analyzer || msg.sender == owner(),
            "Not authorized: must be wallet owner, analyzer, or contract owner"
        );
        require(walletToTokenId[_wallet] == 0, "DNA already minted for this wallet");

        _nextTokenId++;
        uint256 tokenId = _nextTokenId;

        _safeMint(_wallet, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        dnaTraits[tokenId] = _traits;
        walletToTokenId[_wallet] = tokenId;

        emit DNAMinted(_wallet, tokenId, _traits.archetype);
    }

    /// @notice Update traits when wallet activity changes significantly
    function updateDNA(
        uint256 tokenId,
        string calldata _newTokenURI,
        DNATraits calldata _newTraits
    ) external onlyAnalyzer {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        _setTokenURI(tokenId, _newTokenURI);
        dnaTraits[tokenId] = _newTraits;

        emit DNAUpdated(tokenId, _newTraits.archetype);
    }

    /// @notice Get DNA traits for a wallet address
    function getWalletDNA(address _wallet) external view returns (DNATraits memory) {
        uint256 tokenId = walletToTokenId[_wallet];
        require(tokenId != 0, "No DNA found for this wallet");
        return dnaTraits[tokenId];
    }

    /// @notice Get archetype name as string
    function getArchetypeName(Archetype archetype) external pure returns (string memory) {
        if (archetype == Archetype.DeFiDegen) return "DeFi Degen";
        if (archetype == Archetype.DiamondHands) return "Diamond Hands";
        if (archetype == Archetype.NFTCollector) return "NFT Collector";
        if (archetype == Archetype.YieldFarmer) return "Yield Farmer";
        if (archetype == Archetype.Newcomer) return "Newcomer";
        if (archetype == Archetype.Whale) return "Whale";
        return "Trader";
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }

    // Soulbound: prevent transfers
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "Wallet DNA is soulbound");
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
