// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPayPalAccountVerifier {
    struct AccountData {
        string payPalEmail;
    }

   
    /**
     * @notice This function takes in accountData as calldata to optimize gas usage for large data.
     * @param _accountData The data containing the PayPal email to be verified.
     * @return bool indicating whether the account is verified.
     */
    function verifyAccount(
        bytes calldata _accountData
    ) external pure returns (bool);
}
