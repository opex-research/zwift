// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Registrator {
    // Mapping from wallet address to PayPal email
    mapping(address => string) private walletToEmail;

    // Event to emit when a new email is registered
    event AccountRegistered(address indexed wallet, string email);

    // Function to register a wallet address with an email
    function registerAccount(address wallet, string calldata email) external {
        // Check if the wallet address is already in the mapping
        require(bytes(walletToEmail[wallet]).length == 0, "Already registered");

        // Write new wallet/email pair into the mapping
        walletToEmail[wallet] = email;
        
        emit AccountRegistered(wallet, email);
    }

    // Function for user login
    function login(address wallet) external view returns (bool) {
        // Check if wallet address is already in the mapping with an email
        require(bytes(walletToEmail[wallet]).length > 0, "You need to register first");

        // If yes, return success
        return true;
    }


    // Function to retrieve the email associated with a wallet address (optional helper function)
    function getEmail(address wallet) external view returns (string memory) {
        require(bytes(walletToEmail[wallet]).length > 0, "Wallet not registered.");
        return walletToEmail[wallet];
    }
}
