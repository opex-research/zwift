// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/PeerFinder.sol"; // Update the path according to your project structure

contract PeerFinderTest is Test {
    PeerFinder peerFinder;

    function setUp() public {
        peerFinder = new PeerFinder();
    }

    function testAddOffRampersIntent() public {
        address testAddress = address(0x123);
        peerFinder.addOffRampersIntent(testAddress);
        assertEq(peerFinder.size(), 1);
    }

    function testGetAndRemoveOffRampersIntent() public {
        address testAddress = address(0x123);
        peerFinder.addOffRampersIntent(testAddress);
        assertEq(peerFinder.getAndRemoveOffRampersIntent(), testAddress);
        assertEq(peerFinder.size(), 0);
    }

    function testReinsertOffRampIntentAfterFailedOnRamp() public {
        address testAddress = address(0x123);
        peerFinder.addOffRampersIntent(testAddress);
        address removedAddress = peerFinder.getAndRemoveOffRampersIntent();
        peerFinder.reinsertOffRampIntentAfterFailedOnRamp(removedAddress);
        assertEq(peerFinder.peek(), testAddress);
    }

    function testFailAddOffRampersIntentWithZeroAddress() public {
        peerFinder.addOffRampersIntent(address(0));
    }

    function testFailGetAndRemoveOffRampersIntentWhenEmpty() public {
        peerFinder.getAndRemoveOffRampersIntent();
    }
}
