# Progress

## What Changed (Plain English)
- ZK circuit works end-to-end: compile, prove, verify all succeed
- Solidity verifier auto-generated from the circuit
- 3 smart contracts written: ComplianceGate, GatedVault, MockKycSBT
- 10/10 Foundry tests pass
- Calendar events + reminders set for deadline (Apr 15) and pitch (Apr 23)
- Project added to PROJECTS.md

## Current State
- Phase 0: Setup DONE
- Phase 1: Circuit DONE (nargo compile + bb prove + bb verify all pass)
- Phase 2: Contracts written + tested. NOT YET DEPLOYED (need testnet HSK from faucet)
- Phase 3: Frontend NOT STARTED
- Phase 4: Polish NOT STARTED

## Toolchain Versions
- nargo: 1.0.0-beta.20
- bb: 5.0.0-nightly.20260324
- forge: 1.4.4-stable
- Target npm: @noir-lang/noir_js@1.0.0-beta.20, @aztec/bb.js@4.1.3

## Deployment Wallet
- Address: 0x018d8108a87E267d3d2949672DbBC1c4F74C72be
- Needs: testnet HSK from https://hashkeychain.net/faucet (requires reCAPTCHA)

## Test Values (from helper circuit)
- leaf: 0x1dc5711b713bda9ca230971f276f181fdf4813cb2700ea0a2931fd932d8c06bf
- nullifier: 0x27bf76d59941726dc948eed8f755c9af9e2e2a3ada0168bb20ea91991bcfa692
- merkle_root: 0x1c5e0b3f58661b92b7d2bad2b63f2c27063adf308b3b02f7d65cc3580b4c13e0

## Next Steps
1. USER: Get testnet HSK from faucet for 0x018d8108a87E267d3d2949672DbBC1c4F74C72be
2. Deploy contracts to HashKey testnet
3. Build frontend (Vite + vanilla JS + noir_js for browser proving)
4. End-to-end test
5. Polish + submit BUIDL

## Key Files
- circuits/compliance/src/main.nr — THE circuit
- contracts/src/ComplianceGate.sol — Main contract
- contracts/src/GatedVault.sol — Demo vault
- contracts/src/ComplianceVerifier.sol — Auto-generated verifier (2460 lines)
- contracts/src/MockKycSBT.sol — Fallback KYC mock
