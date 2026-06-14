// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DNAToken.sol";

/// @title DNAProfile - NFT representing a user's genomic data profile on Mantle
contract DNAProfile is ERC721, ERC721URIStorage, Ownable {
    DNAToken public rewardToken;

    uint256 private _nextTokenId;

    /// @notice Reward amount in DNAT for registering a DNA profile
    uint256 public constant REGISTRATION_REWARD = 100 * 10 ** 18;

    struct Profile {
        bytes32 dataHash;       // keccak256 hash of encrypted genomic data
        string ipfsCid;         // IPFS CID of encrypted data
        uint256 createdAt;
        uint256 updatedAt;
        bool isActive;
    }

    mapping(uint256 => Profile) public profiles;
    mapping(address => uint256) public ownerToTokenId;

    event ProfileCreated(address indexed owner, uint256 indexed tokenId, bytes32 dataHash);
    event ProfileUpdated(uint256 indexed tokenId, bytes32 newDataHash);
    event ProfileDeactivated(uint256 indexed tokenId);

    constructor(address _rewardToken) ERC721("Mantle DNA Profile", "MDNA") Ownable(msg.sender) {
        rewardToken = DNAToken(_rewardToken);
    }

    /// @notice Mint a DNA profile NFT (one per address)
    function createProfile(bytes32 _dataHash, string calldata _ipfsCid, string calldata _tokenURI) external {
        require(ownerToTokenId[msg.sender] == 0, "Profile already exists");

        _nextTokenId++;
        uint256 tokenId = _nextTokenId;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        profiles[tokenId] = Profile({
            dataHash: _dataHash,
            ipfsCid: _ipfsCid,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            isActive: true
        });

        ownerToTokenId[msg.sender] = tokenId;

        // Reward the user for contributing their data
        if (rewardToken.balanceOf(address(rewardToken.owner())) >= REGISTRATION_REWARD) {
            rewardToken.mint(msg.sender, REGISTRATION_REWARD);
        }

        emit ProfileCreated(msg.sender, tokenId, _dataHash);
    }

    /// @notice Update the genomic data hash (e.g., after adding more data)
    function updateProfile(bytes32 _newDataHash, string calldata _newIpfsCid) external {
        uint256 tokenId = ownerToTokenId[msg.sender];
        require(tokenId != 0, "No profile found");
        require(profiles[tokenId].isActive, "Profile is deactivated");

        profiles[tokenId].dataHash = _newDataHash;
        profiles[tokenId].ipfsCid = _newIpfsCid;
        profiles[tokenId].updatedAt = block.timestamp;

        emit ProfileUpdated(tokenId, _newDataHash);
    }

    /// @notice Deactivate profile (soft delete)
    function deactivateProfile() external {
        uint256 tokenId = ownerToTokenId[msg.sender];
        require(tokenId != 0, "No profile found");
        require(profiles[tokenId].isActive, "Already deactivated");

        profiles[tokenId].isActive = false;

        emit ProfileDeactivated(tokenId);
    }

    /// @notice Get profile details by token ID
    function getProfile(uint256 tokenId) external view returns (Profile memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return profiles[tokenId];
    }

    /// @notice Get token ID for an address
    function getTokenId(address _owner) external view returns (uint256) {
        return ownerToTokenId[_owner];
    }

    /// @notice Total number of profiles created
    function totalProfiles() external view returns (uint256) {
        return _nextTokenId;
    }

    // Prevent transfers to maintain data sovereignty (soulbound option)
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);
        // Allow minting and burning, block transfers
        require(from == address(0) || to == address(0), "DNA Profile is soulbound");
        return super._update(to, tokenId, auth);
    }

    // Required overrides
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
