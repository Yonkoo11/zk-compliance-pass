# zkGate

**Prove KYC compliance without revealing your identity.**

zkGate uses zero-knowledge proofs to let users verify they meet KYC requirements on HashKey Chain without exposing personal data. Your KYC wallet and trading wallet stay completely separate on-chain.

**Live Demo:** [yonkoo11.github.io/zk-compliance-pass](https://yonkoo11.github.io/zk-compliance-pass/)

**Track:** ZKID - HashKey Chain Horizon Hackathon

---

## The Problem

DeFi protocols on HashKey Chain need KYC compliance. But reading the KYC SBT directly leaks the user's ENS name, exact KYC level, and wallet address. Users can't participate in regulated DeFi without giving up their privacy.

## How zkGate Solves It

```
Wallet A (KYC'd)                    Wallet B (trading)
     |                                    |
     v                                    |
 Read KYC SBT                             |
     |                                    |
     v                                    |
 Build Merkle Tree                        |
     |                                    |
     v                                    |
 Generate ZK Proof  ----proof bytes---->  |
 (in browser)                             |
                                          v
                                   ComplianceGate
                                   (verify proof,
                                    mark compliant)
                                          |
                                          v
                                     GatedVault
                                   (deposit/withdraw,
                                    requires compliance)
```

**What the blockchain sees:** Wallet B submitted a valid proof. That's it. Zero reference to Wallet A. The Merkle tree hides which leaf was used. The ZK proof hides the exact KYC level. The verifier gets a binary answer: compliant or not.

## Architecture

| Layer | Component | Tech |
|-------|-----------|------|
| Circuit | KYC compliance proof | Noir 1.0.0-beta.20 |
| Proving | In-browser WASM prover | Barretenberg (bb.js 4.1.3) |
| Contracts | Verifier + ComplianceGate + GatedVault | Solidity 0.8.27 / Foundry |
| Frontend | Wallet + proof UI | Vite + vanilla JS + viem |
| Chain | HashKey Chain Testnet | Chain ID 133 |

### ZK Circuit

The Noir circuit proves three things without revealing any private data:

1. **Merkle membership** - The user's KYC leaf exists in the approved set (depth-10 tree, 1024 leaves)
2. **Level threshold** - The user's KYC level meets the minimum requirement
3. **Nullifier** - A unique hash preventing proof replay

Public inputs: `merkle_root`, `threshold`, `nullifier_hash`
Private inputs: `address_hash`, `kyc_level`, `salt`, `index`, `hash_path`, `nullifier_secret`

### Smart Contracts

All deployed on HashKey Chain Testnet (Chain ID 133):

| Contract | Address | Purpose |
|----------|---------|---------|
| HonkVerifier | `0x5014eD2B51785e33F3E982C20a82ed20FF9Dd89c` | Auto-generated ZK verifier (2460 lines) |
| ComplianceGate | `0x17e5737284Fc6A7a369B6a18505B561C8c195DE3` | Verifies proofs, marks wallets compliant |
| GatedVault | `0x3cc5520B3EE988f5dCBa1F8324A002F0a2ef993E` | Demo DeFi vault (deposit requires compliance) |
| MockKycSBT | `0x5a62799Aef0577C2B4234Ddaa08Dc8B4ADe7Bfc5` | Test KYC data (same interface as real SBT) |

## How to Run Locally

```bash
# Clone
git clone https://github.com/Yonkoo11/zk-compliance-pass.git
cd zk-compliance-pass

# Frontend
cd frontend
npm install
npm run dev
# Open http://localhost:5173/zk-compliance-pass/

# Contracts (requires Foundry)
cd contracts
forge test

# Circuit (requires Noir + Barretenberg)
cd circuits/compliance
nargo compile
bb prove -b ./target/compliance.json -w ./target/compliance.gz -o ./target
bb verify -k ./target/vk -p ./target/proof
```

## Toolchain

- **Noir** 1.0.0-beta.20 (ZK circuit language)
- **Barretenberg** 5.0.0-nightly.20260324 (proving backend)
- **Foundry** 1.4.4-stable (Solidity framework)
- **Vite** 6.x (frontend bundler)
- **viem** 2.x (chain interaction)

## Project Structure

```
circuits/compliance/     Noir ZK circuit
contracts/src/           Solidity smart contracts
contracts/test/          Foundry tests (10/10 passing)
frontend/src/            Browser app (wallet, KYC, proof, vault)
```

## License

MIT
