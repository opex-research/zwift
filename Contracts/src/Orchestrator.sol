// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IRegistrator {
    function registerAccount(address wallet, string calldata email) external returns (bool);
    function login(address wallet) external view returns (bool);
    function getEmail(address wallet) external view returns (string memory);
}

interface IPeerFinder {
    function addOffRampersIntent(address _address) external;
    function getAndRemoveOffRampersIntent() external returns (address);
    function reinsertOffRampIntentAfterFailedOnRamp(address _address) external;
    function peek() external view returns (address);
    function isEmpty() external view returns (bool);
    function size() external view returns (uint256);
}

interface IOffRamper {
    function newOffRampIntent(address user, uint256 amount) external payable;
    function releasePartialFundsToOnRamper(address offRamper, address onRamper, uint256 releaseAmount, uint intentIndex) external;
    function getEscrowBalance(address user) external view returns (uint256);
}

contract Orchestrator {
    IRegistrator public registratorContract;
    IOffRamper public offRamperContract;
    IPeerFinder public peerFinderContract;

    constructor(
        address _registratorAddress,
        address _offRamperAddress,
        address _peerFinderAddress
    ) {
        registratorContract = IRegistrator(_registratorAddress);
        offRamperContract = IOffRamper(_offRamperAddress);
        peerFinderContract = IPeerFinder(_peerFinderAddress);
    }




    // Orchestrator functions for interacting with the Registrator
    function registerUserAccount(address wallet, string calldata email) external returns (bool) {
        return registratorContract.registerAccount(wallet, email);
    }

    function loginUserAccount(address wallet) external view returns (bool) {
        return registratorContract.login(wallet);
    }

    function getUserEmail(address wallet) external view returns (string memory) {
        return registratorContract.getEmail(wallet);
    }




    // Orchestrator functions for managing off-ramp intents queue via PeerFinder
    function addOffRampersIntentToQueue(address _address) internal {
        peerFinderContract.addOffRampersIntent(_address);
    }

    function getAndRemoveOffRampersIntentFromQueue() external returns (address) {
        return peerFinderContract.getAndRemoveOffRampersIntent();
    }

    function reinsertOffRampIntentAfterFailedOnRamp(address _address) external {
        peerFinderContract.reinsertOffRampIntentAfterFailedOnRamp(_address);
    }

    function peekOffRamperQueue() external view returns (address) {
        return peerFinderContract.peek();
    }

    function isOffRamperQueueEmpty() external view returns (bool) {
        return peerFinderContract.isEmpty();
    }

    function numberOfOpenOffRampIntents() external view returns (uint256) {
        return peerFinderContract.size();
    }



    // Orchestrator functions for Off-Ramp intents
    // Function to orchestrate creating an off-ramp intent with ETH transfer
    function createOffRampIntentAndSendETH(address user, uint256 amount) external payable {
        require(msg.value == amount, "Incorrect ETH amount");
        (bool success, ) = address(offRamperContract).call{value: msg.value}(
            abi.encodeWithSignature("newOffRampIntent(address,uint256)", user, amount)
        );
        require(success, "Failed to send ETH or call OffRamper");
        addOffRampersIntentToQueue(user);
    }

    // Additional functions to interact with the OffRamper contract
    function releasePartialFunds(address offRamper, address onRamper, uint256 releaseAmount, uint intentIndex) external {
        offRamperContract.releasePartialFundsToOnRamper(offRamper, onRamper, releaseAmount, intentIndex);
    }

    function queryEscrowBalance(address user) external view returns (uint256) {
        return offRamperContract.getEscrowBalance(user);
    }
}
