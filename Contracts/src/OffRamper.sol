// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OffRamper {
    struct OffRampIntent {
        uint256 amount;
        bool isFulfilled;
    }

    mapping(address => uint256) private escrowBalances; //direct representation of the funds that users have committed to the contract, awaiting onramps
    mapping(address => OffRampIntent[]) private userOffRampIntents; //represents the single intents of one user, important for future if user makes multiple off ramp intents

    event OffRampIntentCreated(address indexed user, uint256 amount);
    event FundsPartiallyReleased(address indexed offRamper, address indexed onRamper, uint256 releaseAmount);
    event EscrowRefunded(address indexed user, uint256 amount);

    // Function to add a new OffRamp Intent for a user
    function newOffRampIntent(address user, uint256 amount) external payable {
        amount = 1000000000000000000; // This represents 1 ETH in wei, we use this for testing purposes
        require(msg.value == amount, "Sent value does not match the intent amount");
        escrowBalances[user] += amount;
        userOffRampIntents[user].push(OffRampIntent(amount, false));
        emit OffRampIntentCreated(user, amount);
    }

    // Function to release partial funds from a user's escrow to an on-ramper
    function releasePartialFundsToOnRamper(address offRamper, address onRamper, uint256 releaseAmount, uint intentIndex) external {
        require(escrowBalances[offRamper] >= releaseAmount, "Release amount exceeds escrow balance");
        require(userOffRampIntents[offRamper][intentIndex].amount >= releaseAmount, "Release amount exceeds intent amount");
        require(!userOffRampIntents[offRamper][intentIndex].isFulfilled, "Intent already fulfilled");

        escrowBalances[offRamper] -= releaseAmount;
        userOffRampIntents[offRamper][intentIndex].amount -= releaseAmount;
        if(userOffRampIntents[offRamper][intentIndex].amount == 0) {
            userOffRampIntents[offRamper][intentIndex].isFulfilled = true;
        }

        payable(onRamper).transfer(releaseAmount);
        emit FundsPartiallyReleased(offRamper, onRamper, releaseAmount);
    }

    // Function to refund the remaining escrow balance to a user
    //We do not use it as of now
    function refundEscrowBalance(address user) external {
        uint256 refundAmount = escrowBalances[user];
        require(refundAmount > 0, "No funds to refund");

        escrowBalances[user] = 0;
        payable(user).transfer(refundAmount);

        emit EscrowRefunded(user, refundAmount);
    }

    // Utility function to view a user's escrow balance
    function getEscrowBalance(address user) public view returns (uint256) {
        return escrowBalances[user];
    }

    // Utility function to view a user's off-ramp intents
    function getUserOffRampIntents(address user) public view returns (OffRampIntent[] memory) {
        return userOffRampIntents[user];
    }
}
