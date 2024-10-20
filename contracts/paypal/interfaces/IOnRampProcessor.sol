// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IOnRampProcessor
 * @dev Interface for the OnRampProcessor used by the OffRamper contract.
 * This interface adheres to the EIP-1271 standard for signature verification.
 */
interface IOnRampProcessor {
    /**
     * @notice Verifies if a signature is valid for the given data.
     * @param hash The hash of the data to verify against.
     * @param signature The signature to verify.
     * @return magicValue The magic value 0x1626ba7e if the signature is valid, otherwise any other value.
     *
     * @dev This function conforms to the EIP-1271 standard, allowing the contract to validate signatures.
     * It should return 0x1626ba7e (ERC1271_MAGICVALUE) if the signature is valid, and 0x00000000 otherwise.
     * 
     * Example:
     * - If using ECDSA signatures, implement the verification logic within the OnRampProcessor contract.
     */
    function isValidSignature(bytes32 hash, bytes calldata signature) external view returns (bytes4 magicValue);
}
