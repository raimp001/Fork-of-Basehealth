// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract InsuranceClaims {
    enum ClaimStatus { Pending, Approved, Rejected }

    struct Claim {
        string claimId;
        address patient;
        uint256 amount;
        string description;
        ClaimStatus status;
        uint256 timestamp;
        string rejectionReason;
    }

    mapping(string => Claim) public claims;
    mapping(address => string[]) public patientClaims;
    
    address public owner;
    mapping(address => bool) public authorizedProviders;

    event ClaimSubmitted(address indexed patient, string claimId, uint256 amount);
    event ClaimStatusChanged(string claimId, ClaimStatus status, string reason);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedProviders[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addAuthorizedProvider(address provider) external onlyOwner {
        authorizedProviders[provider] = true;
    }

    function removeAuthorizedProvider(address provider) external onlyOwner {
        authorizedProviders[provider] = false;
    }

    function submitClaim(
        string calldata claimId,
        uint256 amount,
        string calldata description
    ) external returns (bool) {
        require(bytes(claimId).length > 0, "Claim ID cannot be empty");
        require(amount > 0, "Amount must be greater than 0");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(claims[claimId].patient == address(0), "Claim ID already exists");

        claims[claimId] = Claim({
            claimId: claimId,
            patient: msg.sender,
            amount: amount,
            description: description,
            status: ClaimStatus.Pending,
            timestamp: block.timestamp,
            rejectionReason: ""
        });

        patientClaims[msg.sender].push(claimId);

        emit ClaimSubmitted(msg.sender, claimId, amount);
        return true;
    }

    function getClaimStatus(string calldata claimId) external view returns (ClaimStatus) {
        require(claims[claimId].patient != address(0), "Claim does not exist");
        return claims[claimId].status;
    }

    function approveClaim(string calldata claimId) external onlyAuthorized returns (bool) {
        require(claims[claimId].patient != address(0), "Claim does not exist");
        require(claims[claimId].status == ClaimStatus.Pending, "Claim is not pending");

        claims[claimId].status = ClaimStatus.Approved;
        emit ClaimStatusChanged(claimId, ClaimStatus.Approved, "");
        return true;
    }

    function rejectClaim(string calldata claimId, string calldata reason) external onlyAuthorized returns (bool) {
        require(claims[claimId].patient != address(0), "Claim does not exist");
        require(claims[claimId].status == ClaimStatus.Pending, "Claim is not pending");

        claims[claimId].status = ClaimStatus.Rejected;
        claims[claimId].rejectionReason = reason;
        emit ClaimStatusChanged(claimId, ClaimStatus.Rejected, reason);
        return true;
    }

    function getClaimsByPatient(address patient) external view returns (string[] memory) {
        return patientClaims[patient];
    }

    function getClaimDetails(string calldata claimId) external view returns (
        address patient,
        uint256 amount,
        string memory description,
        ClaimStatus status,
        uint256 timestamp,
        string memory rejectionReason
    ) {
        require(claims[claimId].patient != address(0), "Claim does not exist");
        Claim memory claim = claims[claimId];
        return (
            claim.patient,
            claim.amount,
            claim.description,
            claim.status,
            claim.timestamp,
            claim.rejectionReason
        );
    }
} 