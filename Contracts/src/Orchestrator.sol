// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IRegistrator {
    function registerAccount(address wallet, string calldata email) external returns (bool);
    function login(address wallet) external view returns (bool);
    function getEmail(address wallet) external view returns (string memory);
}


contract Orchestrator {
    
    IRegistrator public registrator;


    constructor(address _registratorAddress) {
        registrator = IRegistrator(_registratorAddress);
    }

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
}
