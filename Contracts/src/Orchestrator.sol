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

interface IPeerFinder {
    function addOffRampersIntent(address _address) external;
    function getAndRemoveOffRampersIntent() external returns (address);
    function reinsertOffRampIntentAfterFailedOnRamp(address _address) external;
    function peek() external view returns (address);
    function isEmpty() external view returns (bool);
    function size() external view returns (uint256);
}



contract Orchestrator {
    
    IRegistrator public registrator;
    IOffRamper public offRamper;
    IPeerFinder public peerFinder;

    constructor(address _registratorAddress, address _offRamperAddress, address _peerFinderAddress) {
        registrator = IRegistrator(_registratorAddress);
        offRamper = IOffRamper(_offRamperAddress); 
        peerFinder = IPeerFinder(_peerFinderAddress);
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



    //------------------ Functions for IPeerFinder ----------------------
    function addOffRampersIntentToQueue(address _address) internal {
        peerFinder.addOffRampersIntent(_address);
    }

    function getAndRemoveOffRampersIntentFromQueue() external returns (address) {
        return peerFinder.getAndRemoveOffRampersIntent();
    }

    function reinsertOffRampIntentAfterFailedOnRamp(address _address) external {
        peerFinder.reinsertOffRampIntentAfterFailedOnRamp(_address);
    }

    function peekOffRamperQueue() external view returns (address) {
        return peerFinder.peek();
    }

    function isOffRamperQueueEmpty() external view returns (bool) {
        return peerFinder.isEmpty();
    }

    function numberOfOpenOffRampIntents() external view returns (uint256) {
        return peerFinder.size();
    }



    //------------------ Functions for IOffRamper ----------------------
    // Function to store an OffRamp Intent with a certain amount through the offRamper
    function newOffRampIntent(address wallet, uint16 amount) external returns (bool) {
        // Require that the new off-ramp intent is successful
        require(offRamper.newOffRampIntent(wallet, amount), "OffRampIntent failed");
        // Since the off-ramp intent was successful, add the wallet to the off-rampers intent queue
        addOffRampersIntentToQueue(wallet);
        // Return true to indicate success
        return true;
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
