# Fix Plan - ZK Compliance Pass

## Tasks

- [ ] Task 1: Write Noir circuit (main.nr) with Merkle membership + KYC level check
  - Acceptance: `nargo compile` succeeds without errors
  - Files: circuits/compliance/src/main.nr

- [ ] Task 2: Create test inputs and generate proof
  - Acceptance: `nargo execute` + `bb prove` + `bb verify` all succeed
  - Files: circuits/compliance/Prover.toml

- [ ] Task 3: Generate Solidity verifier from Noir circuit
  - Acceptance: Verifier.sol exists and `forge build` compiles it
  - Files: contracts/src/ComplianceVerifier.sol

- [ ] Task 4: Write ComplianceGate.sol contract
  - Acceptance: Contract compiles, wraps verifier, has proveCompliance + isCompliant
  - Files: contracts/src/ComplianceGate.sol

- [ ] Task 5: Write GatedVault.sol demo contract
  - Acceptance: Deposit requires compliance, withdraw works normally
  - Files: contracts/src/GatedVault.sol

- [ ] Task 6: Write MockKycSBT.sol
  - Acceptance: Implements IKycSBT interface (isHuman, getKycInfo, setKyc)
  - Files: contracts/src/MockKycSBT.sol

- [ ] Task 7: Write Foundry tests
  - Acceptance: `forge test` passes
  - Files: contracts/test/ComplianceGate.t.sol

- [ ] Task 8: Deploy to HashKey testnet
  - Acceptance: All 4 contracts deployed, addresses logged
  - Files: contracts/script/Deploy.s.sol

- [ ] Task 9: Build frontend with wallet connect + proof generation
  - Acceptance: Full flow works in browser
  - Files: frontend/

- [ ] Task 10: Deploy frontend + submit BUIDL
  - Acceptance: Live URL works, DoraHacks BUIDL submitted
  - Files: README.md

## Completed
