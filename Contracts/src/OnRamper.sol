// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title OnRamper
 * @dev Contract to handle onRamp operations, including verifying signatures for security.
 */
contract OnRamper {
    address public backendAddress; // Backend address used for verifying signatures

    constructor(address _backendAddress) {
        backendAddress = _backendAddress;
    }

    // Function to verify PayPal Transaction with signature and timestamp
    function verifyPayPalTransaction(
        uint256 amount,
        address onRamper,
        address offRamper,
        string calldata onRampersEmail,
        string calldata offRampersEmail,
        string calldata transactionSenderEmail,
        string calldata transactionReceiverEmail,
        uint256 transactionAmount,
        uint256 timestamp,          // new parameter for timestamp
        bytes calldata signature    // new parameter for signature
    ) external view returns (bool) {
        // Recreate the message to verify the signature
        string memory message = string(
            abi.encodePacked(
                amount,
                onRamper,
                offRamper,
                onRampersEmail,
                offRampersEmail,
                transactionSenderEmail,
                transactionReceiverEmail,
                transactionAmount,
                uint2str(timestamp)
            )
        );

        // Hash the message
        bytes32 messageHash = keccak256(bytes(message));

        // Add Ethereum prefix to the message hash
        bytes32 ethSignedMessageHash = prefixed(messageHash);

        // Recover signer address from the signature
        address recoveredSigner = recoverSigner(ethSignedMessageHash, signature);

        // Verify the recovered signer and perform additional checks
        bool success = (recoveredSigner == backendAddress) &&
            (keccak256(abi.encodePacked(onRampersEmail)) ==
                keccak256(abi.encodePacked(transactionSenderEmail))) &&
            (keccak256(abi.encodePacked(offRampersEmail)) ==
                keccak256(abi.encodePacked(transactionReceiverEmail))) &&
            amount == transactionAmount;

        return success;
    }

    /**
     * @dev Adds the Ethereum-specific prefix to the message hash.
     * @param hash The original message hash.
     * @return prefixedHash The hash with the Ethereum-specific prefix applied.
     */
    function prefixed(bytes32 hash) internal pure returns (bytes32 prefixedHash) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    /**
     * @dev Recovers the signer address from the signed message hash and signature.
     * @param ethSignedMessageHash The Ethereum signed message hash.
     * @param signature The signature bytes.
     * @return signer The address that signed the message.
     */
    function recoverSigner(bytes32 ethSignedMessageHash, bytes memory signature)
        internal
        pure
        returns (address signer)
    {
        // Check the signature length
        require(signature.length == 65, "Invalid signature length");

        // Divide the signature into r, s, and v variables
        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            // First 32 bytes after the length prefix
            r := mload(add(signature, 32))
            // Second 32 bytes
            s := mload(add(signature, 64))
            // Final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(signature, 96)))
        }

        // Version of signature should be 27 or 28, but 0 and 1 are also possible
        if (v < 27) {
            v += 27;
        }

        // If the version is correct, recover the signer address
        require(v == 27 || v == 28, "Invalid signature version");

        signer = ecrecover(ethSignedMessageHash, v, r, s);
        require(signer != address(0), "Invalid signer address");

        return signer;
    }

    /**
     * @dev Converts a uint256 to a string.
     * @param _i The uint256 to convert.
     * @return _uintAsString The string representation of the uint256.
     */
    function uint2str(uint256 _i) internal pure returns (string memory _uintAsString) {
        // Handle zero case
        if (_i == 0) {
            return "0";
        }

        uint256 temp = _i;
        uint256 digits;

        // Count the number of digits
        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory buffer = new bytes(digits);
        uint256 index = digits - 1;

        // Convert each digit to a character
        while (_i != 0) {
            buffer[index--] = bytes1(uint8(48 + _i % 10));
            _i /= 10;
        }

        return string(buffer);
    }
}
