import { Noir } from '@noir-lang/noir_js';
import { UltraHonkBackend } from '@aztec/bb.js';
import circuit from './circuits/compliance.json';

let noir = null;
let backend = null;

export async function initNoir(onLog) {
  if (noir && backend) return;
  onLog?.('Loading ZK circuit...');
  noir = new Noir(circuit);
  onLog?.('Initializing proving backend (this may take a moment)...');
  backend = new UltraHonkBackend(circuit.bytecode);
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
  return proof;
}

export async function verifyProofLocally(proof, onLog) {
  if (!backend) throw new Error('Backend not initialized');
  onLog?.('Verifying proof locally...');
  const isValid = await backend.verifyProof(proof);
  onLog?.(`Local verification: ${isValid ? 'VALID' : 'INVALID'}`);
  return isValid;
}

// Format proof for on-chain submission
// The proof object from bb.js has { proof: Uint8Array, publicInputs: string[] }
// The contract expects: bytes proof, uint8 threshold, bytes32 nullifierHash
export function formatProofForChain(proofResult) {
  const proofHex = '0x' + Array.from(proofResult.proof).map(b => b.toString(16).padStart(2, '0')).join('');
  return proofHex;
}
