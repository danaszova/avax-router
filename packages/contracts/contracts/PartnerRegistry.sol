// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PartnerRegistry
 * @author AVAX Router Team
 * @notice On-chain registry for partner IDs and their wallet addresses
 * @dev Allows the contract owner to register partner IDs that map to wallet addresses
 */
contract PartnerRegistry is Ownable {
    // Mapping from partner ID (string) to wallet address
    mapping(string => address) public partnerAddresses;
    
    // Mapping from wallet address to partner ID (for reverse lookup)
    mapping(address => string) public addressToPartnerId;
    
    // Array of all registered partner IDs (for enumeration)
    string[] public partnerIds;
    
    // Events
    event PartnerRegistered(string indexed partnerId, address indexed wallet);
    event PartnerUpdated(string indexed partnerId, address indexed oldWallet, address indexed newWallet);
    event PartnerRemoved(string indexed partnerId, address indexed wallet);
    
    /**
     * @notice Constructor
     */
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Register a new partner ID with a wallet address
     * @param partnerId Unique identifier for the partner (e.g., "my-app", "partner-123")
     * @param wallet Wallet address to receive fees
     */
    function registerPartner(string calldata partnerId, address wallet) external onlyOwner {
        require(bytes(partnerId).length > 0, "Partner ID cannot be empty");
        require(wallet != address(0), "Invalid wallet address");
        require(partnerAddresses[partnerId] == address(0), "Partner ID already registered");
        
        partnerAddresses[partnerId] = wallet;
        addressToPartnerId[wallet] = partnerId;
        partnerIds.push(partnerId);
        
        emit PartnerRegistered(partnerId, wallet);
    }
    
    /**
     * @notice Update an existing partner's wallet address
     * @param partnerId Partner ID to update
     * @param newWallet New wallet address
     */
    function updatePartnerWallet(string calldata partnerId, address newWallet) external onlyOwner {
        require(bytes(partnerId).length > 0, "Partner ID cannot be empty");
        require(newWallet != address(0), "Invalid wallet address");
        require(partnerAddresses[partnerId] != address(0), "Partner ID not registered");
        
        address oldWallet = partnerAddresses[partnerId];
        partnerAddresses[partnerId] = newWallet;
        
        // Update reverse mapping
        delete addressToPartnerId[oldWallet];
        addressToPartnerId[newWallet] = partnerId;
        
        emit PartnerUpdated(partnerId, oldWallet, newWallet);
    }
    
    /**
     * @notice Remove a partner ID from the registry
     * @param partnerId Partner ID to remove
     */
    function removePartner(string calldata partnerId) external onlyOwner {
        require(partnerAddresses[partnerId] != address(0), "Partner ID not registered");
        
        address wallet = partnerAddresses[partnerId];
        delete partnerAddresses[partnerId];
        delete addressToPartnerId[wallet];
        
        // Remove from array
        for (uint256 i = 0; i < partnerIds.length; i++) {
            if (keccak256(bytes(partnerIds[i])) == keccak256(bytes(partnerId))) {
                partnerIds[i] = partnerIds[partnerIds.length - 1];
                partnerIds.pop();
                break;
            }
        }
        
        emit PartnerRemoved(partnerId, wallet);
    }
    
    /**
     * @notice Get the wallet address for a partner ID
     * @param partnerId Partner ID to look up
     * @return Wallet address (address(0) if not found)
     */
    function getPartnerAddress(string calldata partnerId) external view returns (address) {
        return partnerAddresses[partnerId];
    }
    
    /**
     * @notice Check if a partner ID is registered
     * @param partnerId Partner ID to check
     * @return True if registered, false otherwise
     */
    function isPartnerRegistered(string calldata partnerId) external view returns (bool) {
        return partnerAddresses[partnerId] != address(0);
    }
    
    /**
     * @notice Get the partner ID for a wallet address
     * @param wallet Wallet address to look up
     * @return Partner ID (empty string if not found)
     */
    function getPartnerId(address wallet) external view returns (string memory) {
        return addressToPartnerId[wallet];
    }
    
    /**
     * @notice Get total number of registered partners
     * @return Number of partners
     */
    function getPartnerCount() external view returns (uint256) {
        return partnerIds.length;
    }
    
    /**
     * @notice Get all registered partner IDs
     * @return Array of partner IDs
     */
    function getAllPartnerIds() external view returns (string[] memory) {
        return partnerIds;
    }
}