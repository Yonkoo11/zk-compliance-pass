import { createWalletClient, createPublicClient, custom, http, parseEther, formatEther } from 'viem';

const COMPLIANCE_GATE = '0x17e5737284Fc6A7a369B6a18505B561C8c195DE3';
const GATED_VAULT = '0x3cc5520B3EE988f5dCBa1F8324A002F0a2ef993E';

const hashkeyTestnet = {
  id: 133,
  name: 'HashKey Chain Testnet',
  nativeCurrency: { name: 'HSK', symbol: 'HSK', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet.hsk.xyz'] } },
};

const GATE_ABI = [
  {
    name: 'proveCompliance',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'proof', type: 'bytes' },
      { name: 'threshold', type: 'uint8' },
      { name: 'nullifierHash', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    name: 'isCompliant',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'merkleRoot',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32' }],
  },
];

const VAULT_ABI = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'balances',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
];

function getWalletClient() {
  return createWalletClient({
    chain: hashkeyTestnet,
    transport: custom(window.ethereum),
  });
}

const publicClient = createPublicClient({
  chain: hashkeyTestnet,
  transport: http(),
});

export async function submitProof(proofBytes, threshold, nullifierHash) {
  const walletClient = getWalletClient();
  const [account] = await walletClient.getAddresses();

  const hash = await walletClient.writeContract({
    address: COMPLIANCE_GATE,
    abi: GATE_ABI,
    functionName: 'proveCompliance',
    args: [proofBytes, threshold, nullifierHash],
    account,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { hash, receipt };
}

export async function isCompliant(address) {
  return publicClient.readContract({
    address: COMPLIANCE_GATE,
    abi: GATE_ABI,
    functionName: 'isCompliant',
    args: [address],
  });
}

export async function getMerkleRoot() {
  return publicClient.readContract({
    address: COMPLIANCE_GATE,
    abi: GATE_ABI,
    functionName: 'merkleRoot',
  });
}

export async function deposit(amountHsk) {
  const walletClient = getWalletClient();
  const [account] = await walletClient.getAddresses();

  const hash = await walletClient.writeContract({
    address: GATED_VAULT,
    abi: VAULT_ABI,
    functionName: 'deposit',
    args: [],
    value: parseEther(amountHsk),
    account,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { hash, receipt };
}

export async function withdraw(address) {
  const walletClient = getWalletClient();
  const [account] = await walletClient.getAddresses();
  const balance = await getBalance(address);

  if (balance === 0n) throw new Error('No balance to withdraw');

  const hash = await walletClient.writeContract({
    address: GATED_VAULT,
    abi: VAULT_ABI,
    functionName: 'withdraw',
    args: [balance],
    account,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { hash, receipt };
}

export async function getBalance(address) {
  return publicClient.readContract({
    address: GATED_VAULT,
    abi: VAULT_ABI,
    functionName: 'balances',
    args: [address],
  });
}

export { formatEther };
