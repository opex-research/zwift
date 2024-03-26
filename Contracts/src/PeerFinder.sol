// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../lib/openzeppelin-contracts/contracts/utils/structs/EnumerableSet.sol";
import "../lib/openzeppelin-contracts/contracts/utils/structs/DoubleEndedQueue.sol";

contract PeerFinder {
    using DoubleEndedQueue for DoubleEndedQueue.Bytes32Deque;

    DoubleEndedQueue.Bytes32Deque private offRamperQueue;

    // Events
    event OffRampersIntentAdded(address indexed offRamper);
    event GotOffRampersIntent(address indexed offRamper);
    event OffRampersIntentReinserted(address indexed offRamper);

    // Enqueue an address to the back of the queue
    function addOffRampersIntent(address _address) public {
        require(_address != address(0), "Invalid address");
        offRamperQueue.pushBack(bytes32(uint256(uint160(_address))));
        emit OffRampersIntentAdded(_address);
    }

    // Dequeue an address from the front of the queue
    function getAndRemoveOffRampersIntent() public returns (address) {
        require(!isEmpty(), "Queue is empty");
        address offRamperAddress = address(
            uint160(uint256(offRamperQueue.popFront()))
        );
        emit OffRampersIntentRemoved(offRamperAddress);
        return offRamperAddress;
    }

    // Reinsert offRamp intent to front of queue if onRamp did not work
    function reinsertOffRampIntentAfterFailedOnRamp(address _address) public {
        require(_address != address(0), "Invalid address");
        offRamperQueue.pushFront(bytes32(uint256(uint160(_address))));
        emit OffRampersIntentReinserted(_address);
    }

    // Peek at the front address of the queue without removing it
    function peek() public view returns (address) {
        require(!offRamperQueue.empty(), "Queue is empty");
        address peekedAddress = address(
            uint160(uint256(offRamperQueue.front()))
        );
        return peekedAddress;
    }

    // Check if the queue is empty
    function isEmpty() public view returns (bool) {
        return offRamperQueue.empty();
    }

    // Get the size of the queue
    function size() public view returns (uint256) {
        uint256 queueSize = offRamperQueue.length();
        return queueSize;
    }
}
