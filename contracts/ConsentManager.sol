// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./DNAProfile.sol";
import "./DNAToken.sol";

/// @title ConsentManager - Manages data sharing consent for genomic profiles
contract ConsentManager is Ownable {
    DNAProfile public dnaProfile;
    DNAToken public dnaToken;

    /// @notice Reward for sharing data with a research institution
    uint256 public constant SHARING_REWARD = 10 * 10 ** 18;

    enum ConsentStatus { None, Granted, Revoked }

    struct ConsentRecord {
        ConsentStatus status;
        uint256 grantedAt;
        uint256 revokedAt;
        string purpose;         // Reason for data sharing
        uint256 expiresAt;      // 0 = no expiration
    }

    // profileOwner => requester => ConsentRecord
    mapping(address => mapping(address => ConsentRecord)) public consents;

    // Approved research institutions
    mapping(address => bool) public approvedResearchers;
    mapping(address => string) public researcherNames;

    event ConsentGranted(address indexed owner, address indexed researcher, string purpose, uint256 expiresAt);
    event ConsentRevoked(address indexed owner, address indexed researcher);
    event ResearcherApproved(address indexed researcher, string name);
    event ResearcherRemoved(address indexed researcher);
    event DataAccessed(address indexed owner, address indexed researcher, uint256 timestamp);

    constructor(address _dnaProfile, address _dnaToken) Ownable(msg.sender) {
        dnaProfile = DNAProfile(_dnaProfile);
        dnaToken = DNAToken(_dnaToken);
    }

    modifier onlyApprovedResearcher() {
        require(approvedResearchers[msg.sender], "Not an approved researcher");
        _;
    }

    modifier hasProfile(address _user) {
        require(dnaProfile.getTokenId(_user) != 0, "User has no DNA profile");
        _;
    }

    /// @notice Grant consent to a researcher to access your genomic data
    function grantConsent(
        address _researcher,
        string calldata _purpose,
        uint256 _durationDays
    ) external hasProfile(msg.sender) {
        require(approvedResearchers[_researcher], "Researcher not approved");
        require(_researcher != msg.sender, "Cannot grant consent to yourself");

        uint256 expiresAt = _durationDays > 0
            ? block.timestamp + (_durationDays * 1 days)
            : 0;

        consents[msg.sender][_researcher] = ConsentRecord({
            status: ConsentStatus.Granted,
            grantedAt: block.timestamp,
            revokedAt: 0,
            purpose: _purpose,
            expiresAt: expiresAt
        });

        // Reward user for contributing to research
        dnaToken.mint(msg.sender, SHARING_REWARD);

        emit ConsentGranted(msg.sender, _researcher, _purpose, expiresAt);
    }

    /// @notice Revoke previously granted consent
    function revokeConsent(address _researcher) external hasProfile(msg.sender) {
        require(
            consents[msg.sender][_researcher].status == ConsentStatus.Granted,
            "No active consent to revoke"
        );

        consents[msg.sender][_researcher].status = ConsentStatus.Revoked;
        consents[msg.sender][_researcher].revokedAt = block.timestamp;

        emit ConsentRevoked(msg.sender, _researcher);
    }

    /// @notice Check if a researcher has valid consent to access a user's data
    function hasValidConsent(address _owner, address _researcher) public view returns (bool) {
        ConsentRecord memory record = consents[_owner][_researcher];

        if (record.status != ConsentStatus.Granted) return false;
        if (record.expiresAt != 0 && block.timestamp > record.expiresAt) return false;

        return true;
    }

    /// @notice Researcher logs a data access event (for audit trail)
    function recordDataAccess(address _owner) external onlyApprovedResearcher {
        require(hasValidConsent(_owner, msg.sender), "No valid consent");

        emit DataAccessed(_owner, msg.sender, block.timestamp);
    }

    /// @notice Get IPFS CID of user's data (only for authorized researchers)
    function getDataCID(address _owner) external view onlyApprovedResearcher returns (string memory) {
        require(hasValidConsent(_owner, msg.sender), "No valid consent");

        uint256 tokenId = dnaProfile.getTokenId(_owner);
        DNAProfile.Profile memory profile = dnaProfile.getProfile(tokenId);
        require(profile.isActive, "Profile is not active");

        return profile.ipfsCid;
    }

    // --- Admin functions ---

    function approveResearcher(address _researcher, string calldata _name) external onlyOwner {
        approvedResearchers[_researcher] = true;
        researcherNames[_researcher] = _name;
        emit ResearcherApproved(_researcher, _name);
    }

    function removeResearcher(address _researcher) external onlyOwner {
        approvedResearchers[_researcher] = false;
        emit ResearcherRemoved(_researcher);
    }

    /// @notice Get consent details
    function getConsent(address _owner, address _researcher) external view returns (ConsentRecord memory) {
        return consents[_owner][_researcher];
    }
}
