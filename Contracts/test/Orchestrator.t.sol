// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/Orchestrator.sol";
import "../src/OffRamper.sol";
import "../src/PeerFinder.sol";
import "../src/Registrator.sol";
import "../src/OnRamper.sol";

contract OrchestratorTest is Test {
    Orchestrator orchestratorContract;
    OffRamper offRamperContract;
    PeerFinder peerFinderContract;
    Registrator registratorContract;
    OnRamper onRamperContract;

    function setUp() public {
        address registratorAddress = address(new Registrator());
        address offRamperAddress = address(new OffRamper());
        address peerFinderAddress = address(new PeerFinder());
        address onRamperAddress = address(new OnRamper());

        orchestratorContract = new Orchestrator(
            registratorAddress,
            offRamperAddress,
            peerFinderAddress,
            onRamperAddress
        );
        offRamperContract = OffRamper(offRamperAddress);
    }

    function testCreateOffRampIntentAndSendETH() public {
        address user = makeAddr("testUser");
        string memory email = "test@email.com";
        vm.deal(user, 10 ether);
        uint256 amount = 0.00035 ether;
        uint256 beforeBalanceContract = address(offRamperContract).balance;
        uint256 beforeBalanceUser = user.balance;
        vm.prank(user);
        orchestratorContract.registerUserAccount(user, email);

        vm.prank(user);
        orchestratorContract.createOffRampIntentAndSendETH{value: amount}(
            user,
            amount
        );

        uint256 afterBalanceContract = address(offRamperContract).balance;
        uint256 afterBalanceUser = user.balance;
        assertEq(
            beforeBalanceUser - amount,
            afterBalanceUser,
            "User shoul have decreased its balance by 0.00035"
        );
        assertEq(
            beforeBalanceContract + amount,
            afterBalanceContract,
            "OffRamperContract did not receive the correct amount of ETH"
        );
    }

    function testOnRampFunctionSuccess() public {
        address onRamperUser = makeAddr("onRamperUser");
        address offRamperUser = makeAddr("offRamperUser");
        string memory onRampersEmail = "onramper@paypal.com";
        string memory offRampersEmail = "offramper@paypal.com";
        uint256 amount = 0.00035 ether;
        vm.deal(onRamperUser, 10 ether);
        vm.deal(offRamperUser, 10 ether);

        vm.prank(onRamperUser);
        orchestratorContract.registerUserAccount(onRamperUser, onRampersEmail);
        vm.prank(offRamperUser);
        orchestratorContract.registerUserAccount(
            offRamperUser,
            offRampersEmail
        );

        vm.prank(offRamperUser);
        orchestratorContract.createOffRampIntentAndSendETH{value: amount}(
            offRamperUser,
            amount
        );

        uint256 beforeOnRamperBalance = onRamperUser.balance;
        uint256 beforeOffRamperContractBalance = address(offRamperContract)
            .balance;

        
        address[] memory noExclusions = new address[](0);

        vm.prank(onRamperUser);
        (address targetUser, string memory targetEmail) = orchestratorContract
            .getLongestQueuingOffRampIntentAddress(noExclusions);
        
        vm.prank(onRamperUser);
        console.log("before onramp");
        orchestratorContract.onRamp(
            amount,
            targetUser,
            onRampersEmail,
            targetEmail,
            amount
        );

        uint256 afterOnRamperBalance = onRamperUser.balance;
        uint256 afterOffRamperContractBalance = address(offRamperContract)
            .balance;

        assertEq(
            afterOnRamperBalance,
            beforeOnRamperBalance + amount,
            "onRamperUser balance should increase by 1 ether"
        );
        assertEq(
            afterOffRamperContractBalance,
            beforeOffRamperContractBalance - amount,
            "offRamperContract balance should decrease by 1 ether"
        );
    }

    function failTestOnRampFunction() public {
        address onRamperUser = makeAddr("onRamperUser");
        address offRamperUser = makeAddr("offRamperUser");
        string memory onRampersEmail = "onramper@paypal.com";
        string memory offRampersEmail = "offramper@paypal.com";

        vm.deal(onRamperUser, 10 ether);
        vm.deal(offRamperUser, 10 ether);

        vm.prank(onRamperUser);
        orchestratorContract.registerUserAccount(onRamperUser, onRampersEmail);
        vm.prank(offRamperUser);
        orchestratorContract.registerUserAccount(
            offRamperUser,
            offRampersEmail
        );

        uint256 transactionAmount = 0.00035 ether;
        uint256 falseAmount = 1 ether;
        vm.prank(onRamperUser);
        orchestratorContract.onRamp(
            transactionAmount,
            offRamperUser,
            onRampersEmail,
            offRampersEmail,
            falseAmount
        );

        uint256 finalQueueSize = orchestratorContract
            .numberOfOpenOffRampIntents();

        assertEq(
            finalQueueSize,
            1,
            "PeerFinder size should increase by 1 on onRamp failure"
        );
    }

    function testOnRampFunctionMultipleOffRampIntentsWithExclusion() public {
        address onRamperUser = makeAddr("onRamperUser");
        address offRamperUser = makeAddr("offRamperUser");
        address additionalOffRamperUser = makeAddr("additionalOffRamperUser");
        string memory onRampersEmail = "onramper@paypal.com";
        string memory offRampersEmail = "offramper@paypal.com";
        string
            memory additionalOffRampersEmail = "additionalOfframper@paypal.com";
        uint256 amount = 0.00035 ether;
        vm.deal(onRamperUser, 10 ether);
        vm.deal(offRamperUser, 10 ether);
        vm.deal(additionalOffRamperUser, 10 ether);
        uint256 beforeOnRamperBalance = onRamperUser.balance;
        vm.prank(offRamperUser);
        orchestratorContract.registerUserAccount(
            offRamperUser,
            offRampersEmail
        );
        vm.prank(additionalOffRamperUser);
        orchestratorContract.registerUserAccount(
            additionalOffRamperUser,
            additionalOffRampersEmail
        );
        vm.prank(onRamperUser);
        orchestratorContract.registerUserAccount(onRamperUser, onRampersEmail);

        vm.prank(offRamperUser);
        orchestratorContract.createOffRampIntentAndSendETH{value: amount}(
            offRamperUser,
            amount
        );
        vm.prank(additionalOffRamperUser);
        orchestratorContract.createOffRampIntentAndSendETH{value: amount}(
            additionalOffRamperUser,
            amount
        );

        uint256 beforeOffRamperContractBalance = address(offRamperContract)
            .balance;

        address[] memory exclusions = new address[](1);
        exclusions[0] = offRamperUser;

        

        vm.prank(onRamperUser);
        (address targetUser, string memory targetEmail) = orchestratorContract
            .getLongestQueuingOffRampIntentAddress(exclusions);

        uint256 beforeQueueSize = orchestratorContract.numberOfOpenOffRampIntents();

        vm.prank(onRamperUser);
        orchestratorContract.onRamp(
            amount,
            targetUser,
            onRampersEmail,
            targetEmail,
            amount
        );

        uint256 afterQueueSize = orchestratorContract.numberOfOpenOffRampIntents();
        uint256 afterOnRamperBalance = onRamperUser.balance;
        uint256 afterOffRamperContractBalance = address(offRamperContract)
            .balance;

        assertEq(
            afterOnRamperBalance,
            beforeOnRamperBalance + amount,
            "onRamperUser balance should increase by 0.00035 ether"
        );
        assertEq(
            afterOffRamperContractBalance,
            beforeOffRamperContractBalance - amount,
            "offRamperContract balance should decrease by 1 ether"
        );
        assertEq(
            beforeQueueSize,
            afterQueueSize + 1,
            "OffRamp queue should have decreased by 1 after onRamp"
        );
    }
}
