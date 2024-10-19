// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IPayPalAccountVerifier} from "../interfaces/IPayPalAccountVerifier.sol";

/**
 * @notice This contract is used to verify PayPal accounts.
 */
contract PayPalAccountVerifier is IPayPalAccountVerifier {
    /**
     * @notice This function takes in accountData as calldata to optimize gas usage for large data.
     * @param _accountData The data containing the PayPal email to be verified.
     * @return bool indicating whether the account is verified.
     */
    function verifyAccount(
        bytes calldata _accountData
    ) external pure returns (bool) {
        // For now, we just return true without actual logic
        return true;
    }
}

// TODO: Implement the actual verification logic, check what needs to be added to account struct in order to verify the account
