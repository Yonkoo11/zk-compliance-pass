// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IVerifier} from "./ComplianceVerifier.sol";

contract ComplianceGate {
    IVerifier public immutable verifier;
    address public operator;

    bytes32 public merkleRoot;
    mapping(bytes32 => bool) public usedNullifiers;
    mapping(address => bool) public isCompliant;

    event ComplianceProven(address indexed wallet, bytes32 nullifier, uint8 threshold);
    event MerkleRootUpdated(bytes32 oldRoot, bytes32 newRoot);

    constructor(address _verifier) {
        verifier = IVerifier(_verifier);
        operator = msg.sender;
    }

    function updateMerkleRoot(bytes32 _newRoot) external {
        require(msg.sender == operator, "Not operator");
        emit MerkleRootUpdated(merkleRoot, _newRoot);
        merkleRoot = _newRoot;
    }

    function proveCompliance(
        bytes calldata proof,
        uint8 threshold,
        bytes32 nullifierHash
    ) external {
        require(merkleRoot != bytes32(0), "Merkle root not set");
        require(!usedNullifiers[nullifierHash], "Nullifier already used");

        // Public inputs order must match circuit: merkle_root, threshold, nullifier_hash
        bytes32[] memory publicInputs = new bytes32[](3);
        publicInputs[0] = merkleRoot;
        publicInputs[1] = bytes32(uint256(threshold));
        publicInputs[2] = nullifierHash;

        require(verifier.verify(proof, publicInputs), "Invalid proof");

        usedNullifiers[nullifierHash] = true;
        isCompliant[msg.sender] = true;

        emit ComplianceProven(msg.sender, nullifierHash, threshold);
    }

    function checkCompliance(address wallet) external view returns (bool) {
        return isCompliant[wallet];
    }
}
