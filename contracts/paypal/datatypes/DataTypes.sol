// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library DataTypes {
    struct AccountData {
        string payPalEmail;
    }
    struct PaymentData {
        string onRamperPayPalEmail;
        string offRamperPayPalEmail;
        uint256 fiatSendAmount;
    }
}
