// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/OffRamper.sol"; // Adjust the path to your OffRamper contract

contract OffRamperTest is Test {
    OffRamper offRamper;

    function setUp() public {
        offRamper = new OffRamper();
    }

    function testNewOffRampIntent() public {
        uint16 amount = 100;
        address wallet = address(0x1);

        bool success = offRamper.newOffRampIntent(wallet, amount);
        assertTrue(success, "OffRamp intent should be successfully created");

        uint16 returnedAmount = offRamper.getOpenOffRampIntent(wallet);
        assertEq(returnedAmount, amount, "Stored amount should match the input amount");
    }

    function testDecreaseOffRampIntent() public {
        uint16 initialAmount = 100;
        uint16 decreaseAmount = 50;
        address wallet = address(0x2);

        offRamper.newOffRampIntent(wallet, initialAmount);
        offRamper.decreaseOffRampIntentAfterTransaction(wallet, decreaseAmount);

        uint16 remainingAmount = offRamper.getOpenOffRampIntent(wallet);
        assertEq(remainingAmount, initialAmount - decreaseAmount, "Remaining amount should be correctly decreased");
    }

    function testFailDecreaseOffRampIntentWithoutIntent() public {
        address wallet = address(0x3);
        uint16 decreaseAmount = 50;
        // This should fail as there's no intent for this wallet yet
        offRamper.decreaseOffRampIntentAfterTransaction(wallet, decreaseAmount);
    }
}
