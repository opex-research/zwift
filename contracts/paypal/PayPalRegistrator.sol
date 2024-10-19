// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Ownable } from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

import {IPayPalAccountVerifier} from "./interfaces/IPayPalAccountVerifier.sol";


contract PayPalRegistrator {
    // Mapping from wallet address to PayPal email
    mapping(address => string) private walletToEmail;

    // Event emitted when a new account is registered
    event AccountRegistered(address indexed wallet, string email);

    bool public isInitialized;
    IPayPalAccountVerifier public payPalAccountVerifier;
    /* ============ External Functions ============ */

    /**
     * @notice Initialize Registrator with the addresses of the AccountVerifier. Needed to set the addresses of the AccountVerifier contract, which may not be known at the time of deployment.
     *
     * @param _accountVerifier          Account Verification contract for PayPal, verify PayPal email accounts
     */
    function initialize(
        IPayPalAccountVerifier _payPalAccountVerifier
    ) external onlyOwner {
        require(!isInitialized, "Already initialized");
        require(
            address(_payPalAccountVerifier) != address(0),
            "Account Verifier cannot be zero"
        );

        payPalAccountVerifier = _payPalAccountVerifier;

        isInitialized = true;
    }

    /**
     * @notice Register your wallet address with your PayPal email.
     * @param email The PayPal email to associate with your wallet.
     * @return success Indicates successful registration.
     *
     * Requirements:
     * - The caller must not have already registered.
     */
    function register(
        bytes calldata _accountData
    ) external returns (bool success) {
        address wallet = msg.sender;
        require(bytes(walletToEmail[wallet]).length == 0, "Already registered");
        bool isVerifiedPayPalAccount = payPalAccountVerifier.verifyAccount(
            _accountData
        );

        require(
            isVerifiedPayPalAccount == true,
            "Your paypal account verification went wrong"
        );

        // Associate the wallet with the provided PayPal email
        walletToEmail[wallet] = _accountData.payPalEmail;

        emit AccountRegistered(wallet, _accountData.payPalEmail;);

        return true;
    }

    /**
     * @notice Check if a wallet address is registered.
     * @param wallet The wallet address to check.
     * @return isReg Indicates if the wallet is registered.
     */
    function isRegistered(address wallet) external view returns (bool isReg) {
        return bytes(walletToEmail[wallet]).length > 0;
    }

    /**
     * @notice Retrieve the PayPal email associated with a wallet address.
     * @param wallet The wallet address whose PayPal email is to be retrieved.
     * @return email The associated PayPal email.
     *
     * Requirements:
     * - The wallet must be registered.
     */
    function getEmail(
        address wallet
    ) external view returns (string memory email) {
        require(
            bytes(walletToEmail[wallet]).length > 0,
            "Wallet not registered."
        );
        return walletToEmail[wallet];
    }
}

//TODO: Check initializing. Do we have to set requirestatements to make sure the AccountVerifierContract is also deployed
//TODO: Check proxy method, how do we want to proxy the contracts and possible changes of calldata
//TODO: Do we want to call this contract through the Ramp contract and make ramp contract like old Orchestrator? Currently Registrator is called on its own