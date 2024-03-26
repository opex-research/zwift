// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/Orchestrator.sol"; // Assumes Orchestrator and all used contracts are in the src directory
import "../src/OffRamper.sol";
import "../src/PeerFinder.sol";
import "../src/Registrator.sol";
import "../src/OnRamper.sol";

contract OrchestratorTest is Test {
    Orchestrator orchestratorContract;
    OffRamper offRamperContract;
    PeerFinder peerFinderContract;
    Registrator registratorContract;
    OnRamper onRamperContract; // Use the interface type for the OnRamper
    // Declare the missing variables here
    address onRamperUser;
    address offRamperUser;
    uint256 beforeOnRamperBalance;
    uint256 beforeOffRamperContractBalance;

    // Add the email strings if they are used in multiple functions
    string offRampersEmail = "offramper@paypal.com";
    string onRampersEmail = "onramper@paypal.com";
    string transactionSenderEmail = "onramper@paypal.com";
    string transactionReceiverEmail = "offramper@paypal.com";

    function setUp() public {
        address registratorAddress = address(new Registrator());
        address offRamperAddress = address(new OffRamper());
        address peerFinderAddress = address(new PeerFinder());
        address onRamperAddress = address(new OnRamper());

        onRamperUser = makeAddr("onRamperUser");
        offRamperUser = makeAddr("offRamperUser");

        orchestratorContract = new Orchestrator(
            registratorAddress,
            offRamperAddress,
            peerFinderAddress,
            onRamperAddress
        );
        offRamperContract = OffRamper(offRamperAddress);

        // Fund users to simulate Ether availability for transactions
        vm.deal(onRamperUser, 10 ether);
        vm.deal(offRamperUser, 10 ether);
    }

    function testCreateOffRampIntentAndSendETH() public {
        address user = address(this);
        uint256 amount = 1 ether;

        // Pre-test balance check
        uint256 beforeBalance = address(offRamperContract).balance;

        // Simulate sending ETH to the createOffRampIntentAndSendETH function
        vm.prank(user);
        orchestratorContract.createOffRampIntentAndSendETH{value: amount}(
            user,
            amount
        );

        // Post-test balance check
        uint256 afterBalance = address(offRamperContract).balance;
        assertEq(
            afterBalance,
            beforeBalance + amount,
            "OffRamperContract did not receive the correct amount of ETH"
        );

        // Record the initial balances
        beforeOnRamperBalance = onRamperUser.balance;
        beforeOffRamperContractBalance = address(offRamperContract).balance;
    }

    function testOnRampFunctionSuccess() public {
        // Pre-test balances
        beforeOnRamperBalance = onRamperUser.balance;
        vm.prank(onRamperUser);
        orchestratorContract.registerUserAccount(onRamperUser, onRampersEmail);

        vm.prank(offRamperUser);
        orchestratorContract.registerUserAccount(
            offRamperUser,
            offRampersEmail
        );
        // Simulate offRamperUser creating an off-ramp intent
        vm.prank(offRamperUser);
        orchestratorContract.createOffRampIntentAndSendETH{value: 1 ether}(
            offRamperUser,
            1 ether
        );
        beforeOffRamperContractBalance = address(offRamperContract).balance;

        uint256 transactionAmount = 1 ether;

        // Execute onRamp
        vm.prank(onRamperUser);
        orchestratorContract.onRamp(
            transactionAmount,
            offRamperUser,
            transactionSenderEmail,
            transactionReceiverEmail,
            transactionAmount
        );

        // Post-test balances and assertions
        uint256 afterOnRamperBalance = onRamperUser.balance;
        uint256 afterOffRamperContractBalance = address(offRamperContract)
            .balance;

        // Expect the onRamperUser's balance to increase by 1 ether after a successful onRamp
        assertEq(
            afterOnRamperBalance,
            beforeOnRamperBalance + 1 ether,
            "onRamperUser balance should increase by 1 ether"
        );

        // Expect the OffRamper contract's balance to decrease by 1 ether
        assertEq(
            beforeOffRamperContractBalance - 1 ether,
            afterOffRamperContractBalance,
            "offRamperContract balance should decrease by 1 ether"
        );
    }

    function failTestOnRampFunction() public {
        // Similar setup as the success test but with conditions that lead to failure
        // For simplicity, let's assume the failure is due to an incorrect transactionAmount
        // Adjust the setup to reflect a scenario that would lead to onRamp failure

        uint256 initialQueueSize = orchestratorContract
            .numberOfOpenOffRampIntents();

        // Assume `transactionAmount` is set to a value that causes the onRamp to fail
        uint256 transactionAmount = 0.5 ether; // An amount that leads to failure based on contract logic

        vm.prank(onRamperUser);
        orchestratorContract.registerUserAccount(onRamperUser, onRampersEmail);

        vm.prank(offRamperUser);
        orchestratorContract.registerUserAccount(
            offRamperUser,
            offRampersEmail
        );

        // Execute onRamp with failure scenario
        vm.prank(onRamperUser);
        orchestratorContract.onRamp(
            transactionAmount,
            offRamperUser,
            transactionSenderEmail,
            transactionReceiverEmail,
            transactionAmount
        );

        // Verify the peerFinder.size() increased by 1
        uint256 finalQueueSize = orchestratorContract
            .numberOfOpenOffRampIntents();
        assertEq(
            finalQueueSize,
            initialQueueSize + 1,
            "PeerFinder size should increase by 1 on onRamp failure"
        );

        // Verify balances remain unchanged
        assertEq(
            onRamperUser.balance,
            beforeOnRamperBalance,
            "onRamperUser balance should remain unchanged"
        );
        assertEq(
            address(offRamperContract).balance,
            beforeOffRamperContractBalance,
            "offRamperContract balance should remain unchanged"
        );
        // This check ensures that when the `onRamp` process fails, the `offRamperUser` intent is correctly reinserted back into the queue without affecting the balances of the `onRamperUser` and `offRamperContract`, which should remain as they were before the failed `onRamp` attempt.
    }
}
