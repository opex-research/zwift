// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/Registrator.sol"; // Adjust the path to your Registrator contract

contract RegistratorTest is Test {
    Registrator registrator;
    address testWallet = address(0x123);

    function setUp() public {
        registrator = new Registrator();
    }

    function testRegisterAccount() public {
        string memory testEmail = "test@example.com";
        
        // Set up expectations for the event emission
        //vm.expectEmit(true, true, false, true);
        // Parameters are: expectIndex, expectData, ..., corresponding to the event signature.
        // Here, it's set to expect all parts of the event to match.

        // Execute the action that should emit the event
        registrator.registerAccount(testWallet, testEmail);

        
        // Check the email is correctly registered
        assertEq(registrator.getEmail(testWallet), testEmail);
    }

    function testFailRegisterAccountTwice() public {
        string memory testEmail = "test@example.com";
        registrator.registerAccount(testWallet, testEmail);
        
        // This should fail, as we're trying to register the same wallet again
        registrator.registerAccount(testWallet, "newemail@example.com");
    }

    function testLoginWithRegisteredAccount() public {
        string memory testEmail = "test@example.com";
        registrator.registerAccount(testWallet, testEmail);

        // Should return true as the account is registered
        assertTrue(registrator.login(testWallet));
    }

    function testFailLoginWithUnregisteredAccount() public {
        // This should fail as the wallet is not registered
        registrator.login(testWallet);
    }
}
