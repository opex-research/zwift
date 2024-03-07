// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IRegistrator {
    function registerAccount(address wallet, string calldata email) external returns (bool);
    function login(address wallet) external view returns (bool);
    function getEmail(address wallet) external view returns (string memory);
}

interface IOffRamper {
    function newOffRampIntent(address wallet, uint16 amount) external returns (bool);
    function decreaseOffRampIntentAfterTransaction(address wallet, uint16 amount) external returns (bool);
    function getOpenOffRampIntent(address wallet) external view returns (uint16);
}


contract Orchestrator {
    
    IRegistrator public registrator;
    IOffRamper public offRamper;

    constructor(address _registratorAddress, address _offRamperAddress) {
        registrator = IRegistrator(_registratorAddress);
        offRamper = IOffRamper(_offRamperAddress); // Initialize offRamper
    }

    //------------------- Functions for IRegistrator -------------------
    // Function to register a wallet address with an email through the registrator
    function registerUserAccount(address wallet, string calldata email) external returns (bool){
        return registrator.registerAccount(wallet, email);
    }

    // Function to perform login check through the registrator
    function loginUserAccount(address wallet) external view returns (bool) {
        return registrator.login(wallet);
    }

    // Function to retrieve email for a wallet address through the registrator
    function getUserEmail(address wallet) external view returns (string memory) {
        return registrator.getEmail(wallet);
    }



    //------------------ Functions for IOffRamper ----------------------
    // Function to store an OffRamp Intent with a certain amount through the offRamper
    function newOffRampIntent(address wallet, uint16 amount) external returns (bool) {
        return offRamper.newOffRampIntent(wallet, amount);
    }

    // Function to decrease OffRampIntent after a successful OnRamp transaction through the offRamper
    function decreaseOffRampIntentAfterTransaction(address wallet, uint16 amount) external returns (bool) {
        return offRamper.decreaseOffRampIntentAfterTransaction(wallet, amount);
    }

    // Function to retrieve open OffRampIntent associated with a wallet through the offRamper
    function getOpenOffRampIntent(address wallet) external view returns (uint16) {
        return offRamper.getOpenOffRampIntent(wallet);
    }
}
