// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {DataTypes} from "../datatypes/DataTypes.sol";
interface IPayPalAccountVerifier {
  
    /**
     * @notice This function takes in accountData as calldata to optimize gas usage for large data.
     * @param _accountData The data containing the PayPal email to be verified.
     * @return bool indicating whether the account is verified.
     */
    function verifyAccount(
        DataTypes.AccountData calldata _accountData
    ) external pure returns (bool);
}
