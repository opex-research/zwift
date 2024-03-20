// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "forge-std/console.sol";
contract OffRamper {
    struct OffRampIntent {
        uint256 amount;
        bool isFulfilled;
    }

    mapping(address => uint256) private escrowBalances; //direct representation of the funds that users have committed to the contract, awaiting onramps
    mapping(address => OffRampIntent[]) private userOffRampIntents; //represents the single intents of one user, important for future if user makes multiple off ramp intents

    event OffRampIntentCreated(address indexed offRamperAddess, uint256 amount);
    event FundsPartiallyReleased(
        address indexed offRamper,
        address indexed onRamper,
        uint256 releaseAmount
    );
    event EscrowRefunded(address indexed user, uint256 amount);

    // Function to add a new OffRamp Intent for a user
    function newOffRampIntent(
        address offRamperAddress,
        uint256 amount
    ) external payable {
        require(
            msg.value == amount,
            "Sent value does not match the intent amount"
        );

        escrowBalances[offRamperAddress] += amount;
        userOffRampIntents[offRamperAddress].push(OffRampIntent(amount, false));
        emit OffRampIntentCreated(offRamperAddress, amount);
    }

    // Function to release partial funds from a user's escrow to an on-ramper
    function releasePartialFundsToOnRamper(
        address offRamperAddress,
        address onRamperAddress,
        uint256 releaseAmount,
        uint intentIndex
    ) external {
        require(
            escrowBalances[offRamperAddress] >= releaseAmount,
            "Release amount exceeds escrow balance"
        );
        require(
            userOffRampIntents[offRamperAddress][intentIndex].amount >=
                releaseAmount,
            "Release amount exceeds intent amount"
        );
        require(
            !userOffRampIntents[offRamperAddress][intentIndex].isFulfilled,
            "Intent already fulfilled"
        );

        escrowBalances[offRamperAddress] -= releaseAmount;
        userOffRampIntents[offRamperAddress][intentIndex]
            .amount -= releaseAmount;
        if (userOffRampIntents[offRamperAddress][intentIndex].amount == 0) {
            userOffRampIntents[offRamperAddress][intentIndex]
                .isFulfilled = true;
        }

        payable(onRamperAddress).transfer(releaseAmount);
        emit FundsPartiallyReleased(
            offRamperAddress,
            onRamperAddress,
            releaseAmount
        );
    }

    // Utility function to view a user's escrow balance
    function getEscrowBalance(address user) public view returns (uint256) {
        return escrowBalances[user];
    }

    /*
    // Utility function to view a user's off-ramp intents
    function getUserOffRampIntents(address user) public view returns (OffRampIntent[] memory) {
        return userOffRampIntents[user];
    }




    
     // Function to refund the remaining escrow balance to a user
    //We do not use it as of now
    function refundEscrowBalance(address user) external {
        uint256 refundAmount = escrowBalances[user];
        require(refundAmount > 0, "No funds to refund");

        escrowBalances[user] = 0;
        payable(user).transfer(refundAmount);

        emit EscrowRefunded(user, refundAmount);
    }*/
}
