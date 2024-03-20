// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OffRamper {
    mapping(address => uint256) private escrowBalances; // Direct representation of the funds that users have committed to the contract, awaiting onramps.

    event OffRampIntentCreated(
        address indexed offRamperAddress,
        uint256 amount
    );
    event FundsReleased(
        address indexed offRamper,
        address indexed onRamper,
        uint256 releaseAmount
    );
    event EscrowRefunded(address indexed user, uint256 amount);

    // Function to create a new off-ramp intent and add funds to a user's escrow
    function newOffRampIntent(
        address offRamperAddress,
        uint256 amount
    ) external payable {
        require(
            msg.value == amount,
            "Sent value does not match the specified amount"
        );
        escrowBalances[offRamperAddress] += amount;
        emit OffRampIntentCreated(offRamperAddress, amount);
    }

    // Function to release funds from a user's escrow to an on-ramper
    function releasePartialFundsToOnRamper(
        address offRamperAddress,
        address onRamperAddress,
        uint256 releaseAmount
    ) external {
        require(
            escrowBalances[offRamperAddress] >= releaseAmount,
            "Release amount exceeds escrow balance"
        );

        escrowBalances[offRamperAddress] -= releaseAmount;
        payable(onRamperAddress).transfer(releaseAmount);
        emit FundsReleased(offRamperAddress, onRamperAddress, releaseAmount);
    }

    // Utility function to view a user's escrow balance
    function getEscrowBalance(address user) public view returns (uint256) {
        return escrowBalances[user];
    }

    // Optional: Function to refund the remaining escrow balance to a user
    function refundEscrowBalance(address user) external {
        uint256 refundAmount = escrowBalances[user];
        require(refundAmount > 0, "No funds to refund");

        escrowBalances[user] = 0;
        payable(user).transfer(refundAmount);
        emit EscrowRefunded(user, refundAmount);
    }
}
