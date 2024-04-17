// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PeerFinderv2 {
    struct OffRampIntent {
        uint amount;
        uint timestamp;
        address addr;
        bytes32 entryHash; 
    }

    mapping(uint => OffRampIntent) public offRampIntents;
    uint[] private timestamps;

    // Function to add an OffRampIntent
    function addOffRampIntent(uint _amount, address _addr) public {
        uint currentTimestamp = block.timestamp;
        bytes32 hash = keccak256(abi.encodePacked(_amount, currentTimestamp, _addr));
        offRampIntents[currentTimestamp] = OffRampIntent(_amount, currentTimestamp, _addr, hash);
        timestamps.push(currentTimestamp);
    }

    function deleteOffRampIntent(bytes32 hash) public {
        uint index = timestamps.length; // Initialize with an invalid index
        for (uint i = 0; i < timestamps.length; i++) {
            if (offRampIntents[timestamps[i]].entryHash == hash) {
                index = i;
                break;
            }
        }

        require(index < timestamps.length, "Hash not found");

        // Delete the entry from the mapping
        delete offRampIntents[timestamps[index]];

        // Remove the index from the timestamps array by shifting
        for (uint i = index; i < timestamps.length - 1; i++) {
            timestamps[i] = timestamps[i + 1];
        }
        timestamps.pop(); // Remove the last element
    }


    function getNewestEntry(bytes32[] memory intentsAlreadyUsed) public view returns (OffRampIntent memory) {
        require(timestamps.length > 0, "No entries found.");
        uint latestTimestamp = timestamps[0];

        // Initialize as the earliest timestamp
        for (uint i = 1; i < timestamps.length; i++) {
            if (!isHashUsed(offRampIntents[timestamps[i]].entryHash, intentsAlreadyUsed) && timestamps[i] > latestTimestamp) {
                latestTimestamp = timestamps[i];
            }
        }

        return offRampIntents[latestTimestamp];
    }

    // Helper function to check if hash is used
    function isHashUsed(bytes32 hash, bytes32[] memory usedHashes) private pure returns (bool) {
        for (uint i = 0; i < usedHashes.length; i++) {
            if (usedHashes[i] == hash) {
                return true;
            }
        }
        return false;
    }
}
