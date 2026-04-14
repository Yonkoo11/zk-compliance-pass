// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ComplianceGate.sol";
import "../src/GatedVault.sol";
import "../src/MockKycSBT.sol";

// Mock verifier that always returns true for testing
contract MockVerifier {
    function verify(bytes calldata, bytes32[] calldata) external pure returns (bool) {
        return true;
    }
}

// Mock verifier that always returns false
contract FailVerifier {
    function verify(bytes calldata, bytes32[] calldata) external pure returns (bool) {
        return false;
    }
}

contract ComplianceGateTest is Test {
    ComplianceGate gate;
    GatedVault vault;
    MockKycSBT mockSbt;
    MockVerifier mockVerifier;

    address operator = address(this);
    address user1 = address(0x1);
    address user2 = address(0x2);

    bytes32 testRoot = bytes32(uint256(123));
    bytes32 testNullifier = bytes32(uint256(456));

    function setUp() public {
        mockVerifier = new MockVerifier();
        gate = new ComplianceGate(address(mockVerifier));
        vault = new GatedVault(address(gate));
        mockSbt = new MockKycSBT();

        // Set merkle root
        gate.updateMerkleRoot(testRoot);
    }

    function test_updateMerkleRoot() public {
        bytes32 newRoot = bytes32(uint256(789));
        gate.updateMerkleRoot(newRoot);
        assertEq(gate.merkleRoot(), newRoot);
    }

    function test_onlyOperatorCanUpdateRoot() public {
        vm.prank(user1);
        vm.expectRevert("Not operator");
        gate.updateMerkleRoot(bytes32(uint256(789)));
    }

    function test_proveCompliance() public {
        vm.prank(user1);
        gate.proveCompliance(hex"00", 1, testNullifier);
        assertTrue(gate.isCompliant(user1));
    }

    function test_nullifierReplay() public {
        vm.prank(user1);
        gate.proveCompliance(hex"00", 1, testNullifier);

        vm.prank(user2);
        vm.expectRevert("Nullifier already used");
        gate.proveCompliance(hex"00", 1, testNullifier);
    }

    function test_failedProof() public {
        FailVerifier failVerifier = new FailVerifier();
        ComplianceGate failGate = new ComplianceGate(address(failVerifier));
        failGate.updateMerkleRoot(testRoot);

        vm.prank(user1);
        vm.expectRevert("Invalid proof");
        failGate.proveCompliance(hex"00", 1, testNullifier);
    }

    function test_gatedVaultDeposit() public {
        // Prove compliance first
        vm.prank(user1);
        gate.proveCompliance(hex"00", 1, testNullifier);

        // Deposit should work
        vm.deal(user1, 1 ether);
        vm.prank(user1);
        vault.deposit{value: 0.5 ether}();
        assertEq(vault.balances(user1), 0.5 ether);
    }

    function test_gatedVaultRejectsNonCompliant() public {
        vm.deal(user2, 1 ether);
        vm.prank(user2);
        vm.expectRevert("KYC compliance required");
        vault.deposit{value: 0.5 ether}();
    }

    function test_gatedVaultWithdraw() public {
        vm.prank(user1);
        gate.proveCompliance(hex"00", 1, testNullifier);

        vm.deal(user1, 1 ether);
        vm.prank(user1);
        vault.deposit{value: 0.5 ether}();

        vm.prank(user1);
        vault.withdraw(0.3 ether);
        assertEq(vault.balances(user1), 0.2 ether);
    }

    function test_mockKycSbt() public {
        mockSbt.setKyc(user1, "alice.hsk", 2);

        (bool isValid, uint8 level) = mockSbt.isHuman(user1);
        assertTrue(isValid);
        assertEq(level, 2);

        (string memory ensName, uint8 kycLevel, uint8 status,) = mockSbt.getKycInfo(user1);
        assertEq(ensName, "alice.hsk");
        assertEq(kycLevel, 2);
        assertEq(status, 1);
    }

    function test_merkleRootMustBeSet() public {
        ComplianceGate freshGate = new ComplianceGate(address(mockVerifier));
        vm.prank(user1);
        vm.expectRevert("Merkle root not set");
        freshGate.proveCompliance(hex"00", 1, testNullifier);
    }
}
