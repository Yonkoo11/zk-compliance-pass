# Progress

## What Changed (Plain English)
- Renamed project to "zkGate"
- ZK circuit works end-to-end: compile, prove, verify all succeed
- Solidity verifier auto-generated from the circuit
- 3 smart contracts written: ComplianceGate, GatedVault, MockKycSBT
- 10/10 Foundry tests pass
- Calendar events + reminders set for deadline (Apr 15) and pitch (Apr 23)
- Project added to PROJECTS.md
- Frontend completely redesigned: centered single-card layout replacing the old split-screen
- The app now walks you through 4 clear steps instead of showing everything at once:
  1. A connect screen with a single button
  2. Your KYC credential card with a privacy note
  3. A proof generation screen where you watch 3 stages light up as the proof builds
  4. A "Compliant" badge with pulsing glow, plus deposit/withdraw for the vault
- Activity log is now collapsible (starts closed, click to expand)
- Green pulsing dot at the bottom shows you're on HashKey Testnet
- Background has subtle purple and teal gradient glow instead of flat black
- Noise texture overlay for visual depth
- All buttons are pill-shaped with glow effects
- Wallet connect with auto-switch to HashKey testnet
- KYC status reader from MockKycSBT
- In-browser ZK proof generation via noir_js + bb.js
- Contract interaction: submit proof, deposit, withdraw
- Vite builds successfully

## Current State
- Phase 0: Setup DONE
- Phase 1: Circuit DONE (nargo compile + bb prove + bb verify all pass)
- Phase 2: Contracts DONE - all 4 deployed to HashKey testnet (Chain ID 133)
- Phase 3: Frontend DEPLOYED to GitHub Pages (not yet tested end-to-end with real wallet)
- Phase 4: Polish DONE (README, meta tags, favicon, deploy workflow, critical bug fixes)

## Deployed Contract Addresses (HashKey Testnet, Chain ID 133)
- HonkVerifier: 0x5014eD2B51785e33F3E982C20a82ed20FF9Dd89c
- ComplianceGate: 0x17e5737284Fc6A7a369B6a18505B561C8c195DE3
- GatedVault: 0x3cc5520B3EE988f5dCBa1F8324A002F0a2ef993E
- MockKycSBT: 0x5a62799Aef0577C2B4234Ddaa08Dc8B4ADe7Bfc5

## On-Chain State (verified)
- MockKycSBT: deployer address seeded with KYC level 2, ensName "alice.hsk"
- ComplianceGate: merkle root set to 0x1c5e0b3f58661b92b7d2bad2b63f2c27063adf308b3b02f7d65cc3580b4c13e0
- Deployer: 0x018d8108a87E267d3d2949672DbBC1c4F74C72be

## Toolchain Versions
- nargo: 1.0.0-beta.20
- bb: 5.0.0-nightly.20260324
- forge: 1.4.4-stable
- npm packages needed: @noir-lang/noir_js@1.0.0-beta.20, @aztec/bb.js@4.1.3

## Test Values (from helper circuit)
- address_hash: 0x1234, kyc_level: 2, salt: 0x5678, nullifier_secret: 0xabcd
- leaf: 0x1dc5711b713bda9ca230971f276f181fdf4813cb2700ea0a2931fd932d8c06bf
- nullifier: 0x27bf76d59941726dc948eed8f755c9af9e2e2a3ada0168bb20ea91991bcfa692
- merkle_root: 0x1c5e0b3f58661b92b7d2bad2b63f2c27063adf308b3b02f7d65cc3580b4c13e0
- index: 0, hash_path: all zeros (depth 10)

## Build Notes
- foundry.toml: optimizer_runs=1 to keep HonkVerifier under 24KB (was 25175, now 24245)
- via_ir=false (caused stack-too-deep with the verifier)
- --legacy flag needed for HashKey testnet transactions
- Faucet requires browser + reCAPTCHA (can't automate)

## Live URL
https://yonkoo11.github.io/zk-compliance-pass/

## GitHub Repo
https://github.com/Yonkoo11/zk-compliance-pass

## Next Steps
1. END-TO-END TEST with real wallet (CRITICAL - proof generation in browser is untested)
2. Record demo video
3. Submit BUIDL on DoraHacks

## Frontend Stack
- Vite + vanilla JS, no framework
- @noir-lang/noir_js@1.0.0-beta.20 + @aztec/bb.js@4.1.3
- viem for chain interaction
- Dev server: `cd frontend && npm run dev` (port 5173)
- Build: `cd frontend && npm run build` -> dist/
- Base path: /zk-compliance-pass/ (for GitHub Pages)
- Demo uses hardcoded test values matching on-chain merkle root

## Key Files
- circuits/compliance/src/main.nr — THE circuit (depth-10 merkle + level threshold + nullifier)
- contracts/src/ComplianceGate.sol — Main contract (verify proof, mark compliant)
- contracts/src/GatedVault.sol — Demo vault (deposit requires compliance)
- contracts/src/ComplianceVerifier.sol — Auto-generated HonkVerifier (2460 lines)
- contracts/src/MockKycSBT.sol — Fallback KYC mock (same interface as real IKycSBT)
- circuits/compliance/Prover.toml — Working test inputs
- .env — Deployment private key (DO NOT READ)
