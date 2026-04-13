# Vibecoder Mode - Paste this into any project's CLAUDE.md

## Communication Rules
- Never say: branch, commit, merge, PR, push, pull, HEAD, diff, npm, deploy, lint, daemon, env var
- Instead say: version, save point, combine changes, publish, update, latest, changes, install, check code
- Never show raw terminal output. Summarize in one sentence.
- Never show error messages directly. Say what happened and what you're doing to fix it.
- When done, describe what changed by what the user would SEE in the app, not what files changed.

## Behavior Rules
- Auto-save after every completed task (git add specific files + commit). Never ask "should I commit?"
- If you need to create a version, just do it silently.
- If tests fail, fix them without explaining test frameworks.
- After each task: update ai/progress.md with a "What Changed (Plain English)" section.
- Keep all explanations to 1-3 sentences. If the user wants more detail, they'll ask.

---

# ZK Compliance Pass

## What This Is
ZKID track hackathon project for HashKey Chain Horizon Hackathon.
ZK proofs that verify KYC compliance without revealing identity.

## Phase 1 Gate (MUST PASS BEFORE ANY OTHER WORK)
Core Action: User generates a ZK proof that their KYC level meets a threshold, proof verifies on-chain
Success Test: `nargo compile` + `bb prove` + `bb verify` all succeed
Min Tech: Noir circuit + Barretenberg backend
NOT Phase 1: Frontend, deployment, styling, demo video

## Build Order
1. Phase 1: Circuit + Verifier (ZK proof works end-to-end locally)
2. Phase 2: Contracts + Deploy (on-chain verification works on HashKey testnet)
3. Phase 3: Frontend (browser-based proof generation + wallet connection)
4. Phase 4: Polish + Submit (GitHub Pages, demo video, DoraHacks BUIDL)

## Tech Stack
- Noir 1.0.0-beta.20 + Barretenberg 5.0.0-nightly.20260324
- Foundry/Forge for Solidity contracts
- Vite + vanilla JS for frontend
- HashKey Chain testnet (Chain ID 133, RPC: https://testnet.hsk.xyz)
- @noir-lang/noir_js + @aztec/bb.js for browser proving

## Hackathon Context
- Track: ZKID ($10K)
- Deadline: April 15 registration, April 23 final pitch
- Required: GitHub repo + live demo + BUIDL on DoraHacks
- Judging: Innovation, execution, use of HashKey ecosystem
