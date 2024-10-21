// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library DataTypes {
    /**
     * @notice Represents the data required for an account verification.
     * @param payPalEmail The PayPal email associated with the account.
     */
    struct AccountData {
        string payPalEmail;
    }
    /**
     * @notice Represents the data required for a payment verification
     * @param onRamperPayPalEmail The PayPal email of the on-ramp party.
     * @param offRamperPayPalEmail The PayPal email of the off-ramp party.
     * @param fiatSendAmount The amount of fiat currency sent.
     */
    struct PaymentData {
        string onRamperPayPalEmail;
        string offRamperPayPalEmail;
        uint256 fiatSendAmount;
    }
}
