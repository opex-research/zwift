// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IPayPalAccountRegistry
 * @dev Interface for the PayPal Account Registry used by the OffRamper contract.
 */
interface IPayPalAccountRegistry {
    /**
     * @notice Register your wallet address with your PayPal email.
     * @param email The PayPal email to associate with your wallet.
     * @return success Indicates successful registration.
     *
     * Requirements:
     * - The caller must not have already registered.
     */
    function register(string calldata email) external returns (bool success);

    /**
     * @notice Check if a wallet address is registered.
     * @param wallet The wallet address to check.
     * @return isReg Indicates if the wallet is registered.
     */
    function isRegistered(address wallet) external view returns (bool isReg);

    /**
     * @notice Retrieve the unique account ID associated with a wallet.
     * @param wallet The wallet address whose account ID is to be retrieved.
     * @return accountId The unique account ID (keccak256 hash of the PayPal email).
     *
     * Requirements:
     * - The wallet must be registered.
     */
    function getAccountId(address wallet) external view returns (bytes32 accountId);

    /**
     * @notice Retrieve the PayPal email associated with a wallet address.
     * @param wallet The wallet address whose PayPal email is to be retrieved.
     * @return email The associated PayPal email.
     *
     * Requirements:
     * - The wallet must be registered.
     */
    function getEmail(address wallet) external view returns (string memory email);
}
