# zkGate Demo — Voiceover Clips (v2)

Framework: PAS (Problem-Agitation-Solution)
Target: 70-80 seconds
Tone: Talking to a smart friend. Technical but casual.

---

## Clip 01 — hook
**Frame:** Proof generation complete screen (all 3 stages green)
**Text:** So this just generated a ZK proof right in the browser, and it's about to verify on HashKey Chain. The person submitting it stays completely anonymous.

## Clip 02 — problem
**Frame:** Connect wallet screen
**Text:** Here's the problem. HashKey Chain has built-in KYC through soul-bound tokens. But if a DeFi protocol reads your SBT, it sees everything. Your name, your level, when you verified.

## Clip 03 — agitation
**Frame:** Terminal showing exposed KYC data vs private proof
**Text:** So anyone watching the chain can connect your trading wallet back to your real identity. You're compliant, but you've lost all privacy.

## Clip 04 — solution
**Frame:** KYC credential card with privacy note visible
**Text:** zkGate separates the two. It reads your KYC credential, builds a Merkle proof of membership, and generates a zero-knowledge proof that you pass the threshold. Your wallet address and exact level never leave the browser.

## Clip 05 — demo-proof
**Frame:** Proof generation screen with stages animating
**Text:** Everything happens client-side. Noir compiles the circuit, Barretenberg generates a 16 kilobyte UltraHonk proof. There's no server involved.

## Clip 06 — demo-submit
**Frame:** Transaction confirmation / compliant badge
**Text:** You submit the proof from whatever wallet you want. The on-chain verifier checks it, marks you compliant, and now you can deposit into this gated vault. There's zero connection to your KYC wallet.

## Clip 07 — close
**Frame:** Landing page with URL
**Text:** That's zkGate. Try it at the link on screen.
