// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockRegistrator {
    mapping(address => bytes32) private accountIds;

    function register(address user, string calldata paypalID) external {
        accountIds[user] = keccak256(abi.encode(paypalID));
    }

    function isRegistered(address user) external view returns (bool) {
        return accountIds[user] != bytes32(0);
    }

    function getAccountId(address user) external view returns (bytes32) {
        return accountIds[user];
    }
}
