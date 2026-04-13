# ZK Compliance Pass — Memory

## Phase 1 Gate (MUST PASS BEFORE ANY OTHER WORK)
Core Action: ZK proof of KYC compliance level >= threshold
Success Test: nargo compile + bb prove + bb verify all succeed locally
Min Tech: Noir circuit + Barretenberg
NOT Phase 1: Frontend, contracts, deployment, styling
Status: [ ] NOT STARTED

## Hackathon
- Name: HashKey Chain Horizon Hackathon
- Track: ZKID ($10K)
- Deadline: April 15 registration, April 23 final pitch
- Judging: Innovation, execution, use of HashKey ecosystem
- Required: GitHub repo + live demo + BUIDL on DoraHacks
- Past winners: Invoice Pay (RWA), Likwid (liquidity), Stable Swap

## Chosen Idea
ZK Compliance Pass: Users prove KYC compliance without revealing identity.
- KYC SBT on HashKey Chain has isHuman(address) and getKycInfo(address)
- We build Merkle tree of KYC'd addresses
- ZK proof shows membership + level >= threshold
- Cross-wallet: prove from wallet B without revealing wallet A

## Architecture Decisions
- Noir over Circom: Rust-like syntax, faster compile, stdlib has pedersen + merkle
- UltraHonk backend (Barretenberg): auto-generates Solidity verifier
- Merkle tree approach (not direct SBT read): genuine privacy gain
- MockKycSBT as fallback: same interface as real SBT
- Vanilla JS + Vite frontend: matches Noir tutorial, avoids framework issues

## Toolchain
- nargo: 1.0.0-beta.20
- bb: 5.0.0-nightly.20260324
- forge: 1.4.4-stable
- npm packages: @noir-lang/noir_js@1.0.0-beta.20, @aztec/bb.js@4.1.3
- HashKey testnet: Chain ID 133, RPC https://testnet.hsk.xyz

## Competitive Landscape
- No ZK compliance tools on HashKey Chain (gap confirmed)
- World ID ($250M) and Privado ID ($65M) are general-purpose, not HashKey-specific
- zkid.digital is Solana-based, unrelated
- ZKID track likely has fewest competitors (ZK is hard)

## Fatal Flaws
- Noir beta version npm compatibility may break
- Pedersen hash must match between JS and Noir (use @aztec/bb.js for both)
- KYC SBT contract address not publicly documented (MockKycSBT fallback ready)
- UltraVerifier contract may exceed 24KB (use optimizer)

## HashKey Chain KYC SBT
- Interface: IKycSBT
- isHuman(address) -> (bool, uint8 level)
- getKycInfo(address) -> (ensName, level, status, createTime)
- requestKyc(string ensName) -> payable
- Levels: NONE(0), BASIC(1), ADVANCED(2), PREMIUM(3), ULTIMATE(4)
- Status: NONE(0), APPROVED(1), REVOKED(2)
- KYC testnet portal: https://kyc-testnet.hunyuankyc.com/
