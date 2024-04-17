// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/PeerFinder.sol"; // Update the path according to your project structure

contract PeerFinderTest is Test {
    PeerFinder peerFinder;

    function setUp() public {
        peerFinder = new PeerFinder();
    }

    function testDequeueOffRampIntentTargetAtFront() public {
        address testAddress1 = address(0x123);
        address testAddress2 = address(0x456);
        peerFinder.addOffRampersIntent(testAddress1);
        peerFinder.addOffRampersIntent(testAddress2);

        peerFinder.dequeueOffRampIntent(testAddress1);
        assertEq(peerFinder.size(), 1, "Queue should have 1 address left");
        address[] memory noExclusions = new address[](0);
        assertEq(peerFinder.peek(noExclusions), testAddress2, "Remaining address should be at the front");
    }

    function testDequeueOffRampIntentTargetNotAtFront() public {
        address testAddress1 = address(0x123);
        address testAddress2 = address(0x456);
        address testAddress3 = address(0x789);
        peerFinder.addOffRampersIntent(testAddress1);
        peerFinder.addOffRampersIntent(testAddress2);
        peerFinder.addOffRampersIntent(testAddress3);

        peerFinder.dequeueOffRampIntent(testAddress2);
        assertEq(peerFinder.size(), 2, "Queue should have 2 addresses left");
        address[] memory noExclusions = new address[](0);
        assertEq(peerFinder.peek(noExclusions), testAddress1, "First address should still be at the front");
        peerFinder.dequeueOffRampIntent(testAddress1);
        assertEq(peerFinder.peek(noExclusions), testAddress3, "Last remaining should be the last added minus removed one");
    }

    function testDequeueOffRampIntentWithSingleElement() public {
        address testAddress = address(0x123);
        peerFinder.addOffRampersIntent(testAddress);

        peerFinder.dequeueOffRampIntent(testAddress);
        assertEq(peerFinder.size(), 0, "Queue should be empty after removal");
    }

    function testFailDequeueOffRampIntentAddressNotFound() public {
        address testAddress1 = address(0x123);
        address testAddress2 = address(0x456);
        peerFinder.addOffRampersIntent(testAddress1);

        peerFinder.dequeueOffRampIntent(testAddress2); // This should fail as testAddress2 is not in queue
    }

    function testFailDequeueOffRampIntentWhenEmpty() public {
        peerFinder.dequeueOffRampIntent(address(0x123)); // Expecting to fail since the queue is empty
    }

    function testReinsertOffRampIntentAfterFailedOnRamp() public {
        address testAddress = address(0x123);
        peerFinder.addOffRampersIntent(testAddress);
        peerFinder.dequeueOffRampIntent(testAddress);
        peerFinder.reinsertOffRampIntentAfterFailedOnRamp(testAddress);
        address[] memory noExclusions = new address[](0);
        assertEq(peerFinder.peek(noExclusions), testAddress, "The reinserted address should be at the front of the queue");
    }

    // Test peek function with exclusions
    function testPeekWithExclusions() public {
        address testAddress1 = address(0x123);
        address testAddress2 = address(0x456);
        address testAddress3 = address(0x789);
        peerFinder.addOffRampersIntent(testAddress1);
        peerFinder.addOffRampersIntent(testAddress2);
        peerFinder.addOffRampersIntent(testAddress3);

        // Exclude the first address, expect the second to be returned
        address[] memory exclusions = new address[](1);
        exclusions[0] = testAddress1;
        assertEq(peerFinder.peek(exclusions), testAddress2, "Should skip the first and return the second address");
    }
}
