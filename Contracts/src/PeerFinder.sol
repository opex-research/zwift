// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/structs/DoubleEndedQueue.sol";

contract AddressQueue {
    using DoubleEndedQueue for DoubleEndedQueue.Bytes32;

    DoubleEndedQueue.Bytes32 private queue;

    // Enqueue an address to the back of the queue
    function enqueue(address _address) public {
        queue.pushBack(bytes32(uint256(uint160(_address))));
    }

    // Dequeue an address from the front of the queue
    function dequeue() public returns (address) {
        require(!queue.isEmpty(), "Queue is empty");
        return address(uint160(uint256(queue.popFront())));
    }

    // Peek at the front address of the queue without removing it
    function peek() public view returns (address) {
        require(!queue.isEmpty(), "Queue is empty");
        return address(uint160(uint256(queue.front())));
    }

    // Check if the queue is empty
    function isEmpty() public view returns (bool) {
        return queue.isEmpty();
    }

    // Get the size of the queue
    function size() public view returns (uint256) {
        return queue.length();
    }
}
