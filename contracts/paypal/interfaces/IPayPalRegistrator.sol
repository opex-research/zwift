// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


interface IPayPalRegistrator {

    /**
     * @notice Register a wallet address with a PayPal email.
     * @param _accountData The data containing the PayPal email to associate with the wallet.
     * @return success Indicates successful registration.
     */
    function register(
        bytes calldata _accountData
    ) external returns (bool success);

    /**
     * @notice Check if a wallet address is registered.
     * @param wallet The wallet address to check.
     * @return isReg Indicates if the wallet is registered.
     */
    function isRegistered(address wallet) external view returns (bool isReg);

    /**
     * @notice Retrieve the PayPal email associated with a wallet address.
     * @param wallet The wallet address whose PayPal email is to be retrieved.
     * @return email The associated PayPal email.
     */
    function getEmail(
        address wallet
    ) external view returns (string memory email);
}
