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
    event AddressRemoved(address indexed removedAddress);

    // Enqueue an address to the back of the queue
    function addOffRampersIntent(address _address) public {
        require(_address != address(0), "Invalid address");
        offRamperQueue.pushBack(bytes32(uint256(uint160(_address))));
        emit OffRampersIntentAdded(_address);
    }

    // Function to remove first element, and if that is not the element we look for we handle edge case of elements behind it
    function dequeueOffRampIntent(address targetAddress) public {
        require(!offRamperQueue.empty(), "Queue is empty");

        // Peek at the front of the queue
        address frontAddress = address(
            uint160(uint256(offRamperQueue.front()))
        );
        if (frontAddress == targetAddress) {
            // If the front of the queue is the target, pop and finish
            offRamperQueue.popFront();
            emit AddressRemoved(targetAddress);
            return;
        }

        // If the target is not at the front (edge case), proceed with the search
        uint256 length = offRamperQueue.length();
        bool found = false;

        // Temporary storage to hold elements while searching
        bytes32[] memory tempStorage = new bytes32[](length); // Adjust size as the first element is already checked
        uint256 count = 0;
        tempStorage[0] = offRamperQueue.popFront(); // Remove the first element which we already checked and is not the target

        for (uint256 i = 1; i < length; ++i) {
            bytes32 currentElement = offRamperQueue.popFront();
            if (address(uint160(uint256(currentElement))) == targetAddress) {
                found = true;
                emit AddressRemoved(targetAddress);
                break; // Exit the loop once the target is found
            }
            tempStorage[count++] = currentElement;
        }

        // Reinsert elements into the queue in their original order by pushing them back to the front in reverse order
        for (int j = int(count); j >= 0; --j) {
            offRamperQueue.pushFront(tempStorage[uint256(j)]);
        }

        require(found, "Address not found in the queue");
    }

    /*
    // Dequeue an address from the front of the queue
    function getAndRemoveOffRampersIntent() public returns (address) {
        require(!isEmpty(), "Queue is empty");
        address offRamperAddress = address(
            uint160(uint256(offRamperQueue.popFront()))
        );
        emit GotOffRampersIntent(offRamperAddress);
        return offRamperAddress;
    }
*/

    // Reinsert offRamp intent to front of queue if onRamp did not work
    function reinsertOffRampIntentAfterFailedOnRamp(address _address) public {
        require(_address != address(0), "Invalid address");
        offRamperQueue.pushFront(bytes32(uint256(uint160(_address))));
        emit OffRampersIntentReinserted(_address);
    }

    function peek(
        address[] memory excludedAddresses
    ) public view returns (address) {
        require(!offRamperQueue.empty(), "Queue is empty");

        uint256 length = offRamperQueue.length();
        for (uint256 i = 0; i < length; ++i) {
            address currentAddress = address(
                uint160(uint256(offRamperQueue.at(i)))
            );
            if (!isExcluded(currentAddress, excludedAddresses)) {
                return currentAddress;
            }
        }
        revert("No valid address found");
    }

    // Helper function to check if an address is in the excluded list
    function isExcluded(
        address _address,
        address[] memory excludedAddresses
    ) internal pure returns (bool) {
        for (uint256 i = 0; i < excludedAddresses.length; i++) {
            if (_address == excludedAddresses[i]) {
                return true;
            }
        }
        return false;
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
