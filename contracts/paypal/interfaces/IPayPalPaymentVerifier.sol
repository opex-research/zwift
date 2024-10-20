// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {DataTypes} from "../datatypes/DataTypes.sol";
interface IPayPalPaymentVerifier {
    
    /**
     * @notice This function verifies a PayPal payment
     * @param sender The address of the sender.
     * @param _paymentData The data containing the PayPal email of the on-ramp and off-ramp parties, and the fiat amount sent.
     * @param conversionRate The conversion rate used for the transaction.
     * @param offRampAmount The amount to be off-ramped.
     * @return bool indicating whether the payment is verified.
     */
    function verifyPayment(
        address sender,
        DataTypes.PaymentData calldata _paymentData,
        uint256 conversionRate,
        uint256 offRampAmount
    ) external view returns (bool);
}
