import { Noir } from '@noir-lang/noir_js';
import { Barretenberg, UltraHonkBackend } from '@aztec/bb.js';
import circuit from './circuits/compliance.json';

let noir = null;
let backend = null;
let bb = null;

export async function initNoir(onLog) {
  if (noir && backend) return;
  onLog?.('Loading ZK circuit...');
  noir = new Noir(circuit);
  onLog?.('Initializing proving backend (this may take a moment)...');
  bb = await Barretenberg.new();
  backend = new UltraHonkBackend(circuit.bytecode, bb);
  onLog?.('ZK system ready.');
}

export async function generateProof(inputs, onLog) {
  if (!noir || !backend) {
    await initNoir(onLog);
  }

  onLog?.('Computing witness...');
  const { witness } = await noir.execute(inputs);

  onLog?.('Generating ZK proof (this takes 30-60 seconds)...');
  const proof = await backend.generateProof(witness);

  onLog?.('Proof generated successfully.');

  // proof.proof = Uint8Array (raw proof bytes, no public inputs)
  // proof.publicInputs = string[] (hex-encoded field elements)
  return proof;
}

export async function verifyProofLocally(proof, onLog) {
  if (!backend) throw new Error('Backend not initialized');
  onLog?.('Verifying proof locally...');
  const isValid = await backend.verifyProof(proof);
  onLog?.(`Local verification: ${isValid ? 'VALID' : 'INVALID'}`);
  return isValid;
}

// Format proof bytes as hex for on-chain submission
export function formatProofForChain(proofResult) {
  return '0x' + Array.from(proofResult.proof).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Extract nullifier hash from proof public inputs
// Circuit public inputs order: [merkle_root, threshold, nullifier_hash]
export function getNullifierFromProof(proofResult) {
  if (proofResult.publicInputs.length < 3) {
    throw new Error('Proof missing public inputs');
  }
  // publicInputs[2] is the nullifier_hash as hex string
  let nullifier = proofResult.publicInputs[2];
  if (!nullifier.startsWith('0x')) nullifier = '0x' + nullifier;
  // Pad to bytes32 (66 chars = 0x + 64 hex chars)
  return nullifier.padEnd(66, '0').slice(0, 66);
}
