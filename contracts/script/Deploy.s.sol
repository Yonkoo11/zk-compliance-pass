// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ComplianceVerifier.sol";
import "../src/ComplianceGate.sol";
import "../src/GatedVault.sol";
import "../src/MockKycSBT.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy the ZK verifier (auto-generated from Noir circuit)
        HonkVerifier verifier = new HonkVerifier();
        console.log("Verifier deployed at:", address(verifier));

        // 2. Deploy the compliance gate
        ComplianceGate gate = new ComplianceGate(address(verifier));
        console.log("ComplianceGate deployed at:", address(gate));

        // 3. Deploy the demo gated vault
        GatedVault vault = new GatedVault(address(gate));
        console.log("GatedVault deployed at:", address(vault));

        // 4. Deploy mock KYC SBT for testing
        MockKycSBT mockSbt = new MockKycSBT();
        console.log("MockKycSBT deployed at:", address(mockSbt));

        vm.stopBroadcast();
    }
}
