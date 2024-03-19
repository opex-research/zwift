// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/OffRamper.sol";

contract OffRamperTest is Test {
    OffRamper offRamper;
    address offRamperAddress = address(1);
    address onRamperAddress = address(2);

    function setUp() public {
        offRamper = new OffRamper();
        vm.deal(offRamperAddress, 10 ether); // Providing test ether to the offRamperAddress for testing
    }

    function testNewOffRampIntent() public {
        vm.startPrank(offRamperAddress);
        offRamper.newOffRampIntent{value: 1 ether}(offRamperAddress, 1 ether);
        assertEq(offRamper.getEscrowBalance(offRamperAddress), 1 ether);
        vm.stopPrank();
    }

    function testReleasePartialFundsToOnRamper() public {
        // First, create an off-ramp intent
        vm.startPrank(offRamperAddress);
        offRamper.newOffRampIntent{value: 1 ether}(offRamperAddress, 1 ether);
        vm.stopPrank();
        
        // Attempt to release partial funds
        offRamper.releasePartialFundsToOnRamper(offRamperAddress, onRamperAddress, 0.5 ether, 0);
        assertEq(offRamper.getEscrowBalance(offRamperAddress), 0.5 ether);
        assertEq(address(onRamperAddress).balance, 0.5 ether);
    }

    function testFailReleasePartialFundsExceedingIntent() public {
        vm.startPrank(offRamperAddress);
        offRamper.newOffRampIntent{value: 1 ether}(offRamperAddress, 1 ether);
        vm.stopPrank();
        
        // This should fail as it attempts to release more funds than available in the intent
        offRamper.releasePartialFundsToOnRamper(offRamperAddress, onRamperAddress, 2 ether, 0);
    }
}
