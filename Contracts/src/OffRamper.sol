// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OffRamper {
    // Mapping from wallet address to OffRampIntent amount
    mapping(address => uint16) private walletAssociatedOffRamp;

    // Function to store an OffRamp Intent with a certain amount
    function newOffRampIntent(address wallet, uint16 amount) external returns (bool) {
        // Check if user already has an open offramp intent
        require(walletAssociatedOffRamp[wallet] == 0, "Already an open OffRamp Intent");

        // Write new wallet/amount pair into the mapping
        walletAssociatedOffRamp[wallet] = amount; 
        return true;
    }

    // Function to decrease OffRampIntent after a successful OnRamp transaction
    function decreaseOffRampIntentAfterTransaction(address wallet, uint16 amount) external returns (bool) {
        // Check if wallet address has an open offRampIntent
        require(walletAssociatedOffRamp[wallet] > 0, "There was an error, user has no open offRampIntent");

        // Ensure the decrease amount does not exceed the current intent
        require(walletAssociatedOffRamp[wallet] >= amount, "Decrease amount exceeds the current intent");

        // Stored OffRampIntent is decreased by the amount of the successful transaction
        walletAssociatedOffRamp[wallet] -= amount;
        return true;
    }

    // Function to retrieve open OffRampIntent associated with a wallet
    function getOpenOffRampIntent(address wallet) external view returns (uint16) {
        return walletAssociatedOffRamp[wallet];
    }
}
