# DoraHacks BUIDL Submission: zkGate

## Form Fields

### BUIDL Name
zkGate

### BUIDL Logo
`video/zkgate-logo.png` (480x480, already generated)

### Vision
DeFi protocols on HashKey Chain require KYC, but reading the on-chain KYC SBT exposes the user's identity and compliance level to anyone watching. There is currently no way to prove "I passed KYC" without revealing who you are. zkGate lets users generate a zero-knowledge proof of KYC compliance that verifies on-chain, so protocols can gate access without ever learning the user's address or identity.

### Category
Crypto / Web3

### Is this BUIDL an AI Agent?
No

### GitHub
https://github.com/Yonkoo11/zk-compliance-pass

### Project Website
https://yonkoo11.github.io/zk-compliance-pass/

### Demo Video
(YouTube link TBD - upload video/zkgate-demo.mp4)

### Social Links
https://github.com/Yonkoo11

---

## Long Description (paste into BUIDL page body)

# zkGate: Private KYC Compliance for HashKey Chain

## What It Does

zkGate is a zero-knowledge compliance layer for HashKey Chain. Users prove their KYC level meets a protocol's threshold without revealing their wallet address, identity, or exact compliance level. A DeFi vault can require "KYC level >= 2" and verify that on-chain, while the user stays anonymous. The proof is 16KB, generates in-browser, and verifies in a single transaction.

## How It Works

The system has four pieces: a Noir ZK circuit, a Solidity verifier, a compliance gate contract, and a browser-based prover.

**The circuit** (`circuits/compliance/src/main.nr`, 50 lines of Noir) does three things:

1. **Merkle membership** - The prover reconstructs a Pedersen hash leaf from their address hash, salt, and KYC level. Then walks a depth-10 Merkle tree (supports 1024 leaves) to compute the root. The circuit asserts the computed root matches the public root stored on-chain.

2. **Threshold check** - The circuit asserts `kyc_level >= threshold`. The threshold is a public input set by the protocol. The exact level stays private.

3. **Nullifier** - A Pedersen hash of `(nullifier_secret, address_hash)` prevents double-use of the same credential. The secret stays private; only the hash goes on-chain.

The circuit has 3 public inputs (merkle_root, threshold, nullifier_hash) and 6 private inputs. The Barretenberg UltraHonk backend compiles this into a Solidity verifier (2460 lines, optimized to fit under the 24KB contract size limit at 24,245 bytes).

**In the browser**, `@noir-lang/noir_js` compiles the witness and `@aztec/bb.js` generates the UltraHonk proof. The user never sends private data anywhere.

## Architecture

```
User's Browser                          HashKey Chain (Testnet, ID: 133)
+---------------------------+           +----------------------------------+
|                           |           |                                  |
|  1. Connect wallet        |           |  MockKycSBT                      |
|  2. Read KYC from SBT     |---------->|  isHuman(addr) -> (bool, level)  |
|  3. Build Merkle witness   |           |                                  |
|  4. noir_js + bb.js        |           +----------------------------------+
|     generate proof (16KB) |
|  5. Submit proof tx        |---------->+----------------------------------+
|                           |           |  ComplianceGate                   |
+---------------------------+           |  verifyAndMark(proof, inputs)     |
                                        |    -> calls HonkVerifier          |
                                        |    -> stores nullifier            |
                                        |    -> marks address compliant     |
                                        +----------------------------------+
                                                      |
                                        +----------------------------------+
                                        |  GatedVault                       |
                                        |  deposit() - requires compliant   |
                                        |  withdraw() - returns funds       |
                                        +----------------------------------+
```

## What We Built

- **Noir ZK circuit** - Pedersen-based Merkle membership proof + KYC threshold check + nullifier. Depth 10 (1024 leaves). Compiles, proves, and verifies locally with nargo + bb.
- **HonkVerifier.sol** - Auto-generated UltraHonk verifier from the circuit. 2460 lines of Solidity. Optimizer set to 1 run to fit under 24KB.
- **ComplianceGate.sol** - Accepts proof + public inputs, calls HonkVerifier, stores nullifier to prevent reuse, marks the caller as compliant.
- **GatedVault.sol** - Demo protocol that gates deposit/withdraw behind ComplianceGate. Shows how any DeFi protocol can integrate.
- **MockKycSBT.sol** - Same interface as HashKey's real IKycSBT (isHuman, getKycInfo, requestKyc). Used for testnet where the real SBT is not publicly deployed.
- **Browser prover** - In-browser ZK proof generation using @noir-lang/noir_js and @aztec/bb.js. No backend server. The user's private inputs never leave the browser.
- **Frontend** - Vanilla JS + Vite. 4-step flow: connect wallet -> view KYC credential -> generate proof -> deposit into vault. Auto-switches wallet to HashKey testnet (Chain ID 133).
- **10/10 Foundry tests** - Full coverage of proof verification, nullifier reuse prevention, vault gating, and edge cases.

## Deployed Contracts (HashKey Testnet, Chain ID 133)

| Contract | Address |
|---|---|
| HonkVerifier | `0x5014eD2B51785e33F3E982C20a82ed20FF9Dd89c` |
| ComplianceGate | `0x17e5737284Fc6A7a369B6a18505B561C8c195DE3` |
| GatedVault | `0x3cc5520B3EE988f5dCBa1F8324A002F0a2ef993E` |
| MockKycSBT | `0x5a62799Aef0577C2B4234Ddaa08Dc8B4ADe7Bfc5` |

Explorer: https://testnet.hsk.xyz

## Tech Stack

| Layer | Tool | Version |
|---|---|---|
| ZK Circuit | Noir | 1.0.0-beta.20 |
| Proving Backend | Barretenberg (UltraHonk) | 5.0.0-nightly.20260324 |
| Smart Contracts | Foundry / Forge | 1.4.4-stable |
| Frontend | Vite + vanilla JS | - |
| Browser Proving | @noir-lang/noir_js | 1.0.0-beta.20 |
| Browser Proving | @aztec/bb.js | 4.1.3 |
| Chain Interaction | viem | - |
| Hosting | GitHub Pages | - |

## Track

**ZKID** - "Proving without leaking"

HashKey Chain has built-in KYC through its SBT system, but reading the SBT on-chain tells everyone your compliance status and links it to your address. zkGate adds a privacy layer: the chain verifies you're compliant, but learns nothing else about you. Not your address, not your level, not your identity. That's the gap we fill.
