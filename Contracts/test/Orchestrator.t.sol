// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/Orchestrator.sol";
import "../src/OffRamper.sol";
import "../src/PeerFinder.sol";
import "../src/Registrator.sol";
import "forge-std/console.sol";
// Import or define the interfaces or mock contracts for IRegistrator and IPeerFinder as needed.

contract OrchestratorTest is Test {
    Orchestrator orchestrator;
    OffRamper offRamper;
    Registrator registratorMock;
    PeerFinder peerFinderMock;
    // Define variables for mocks of IRegistrator and IPeerFinder if needed

    function setUp() public {
        // Deploy the OffRamper contract
        offRamper = new OffRamper();
        // Deploy and set up the mocks for IRegistrator and IPeerFinder as needed.
        peerFinderMock = new PeerFinder();
        // Deploy the Orchestrator contract, passing in the addresses of the deployed contracts
        orchestrator = new Orchestrator(
            address(registratorMock), // Assume this is defined or mocked elsewhere
            address(offRamper),
            address(peerFinderMock) // Assume this is defined or mocked elsewhere
        );
    }

    function testCreateOffRampIntentAndSendETH() public {
        address user = address(this);
        uint256 amount = 1 ether;

        // Before balance of OffRamper contract
        uint256 beforeBalance = address(offRamper).balance;
        // Simulate sending 1 ETH to the createOffRampIntentAndSendETH function from the user
        vm.prank(user);
        orchestrator.createOffRampIntentAndSendETH{value: amount}(user, amount);
        console.log("off rampter did do transaction");
        // After balance of OffRamper contract
        uint256 afterBalance = address(offRamper).balance;

        // Verify the OffRamper's balance increased by the sent amount
        assertEq(afterBalance, beforeBalance + amount, "OffRamper did not receive the correct amount of ETH");

        // Additional checks can include verifying the OffRampIntent was created correctly
        // For example, you could add a public getter for userOffRampIntents in OffRamper for testing
    }
}
