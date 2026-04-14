import { createPublicClient, http } from 'viem';

const MOCK_KYC_SBT = '0x5a62799Aef0577C2B4234Ddaa08Dc8B4ADe7Bfc5';

const hashkeyTestnet = {
  id: 133,
  name: 'HashKey Chain Testnet',
  nativeCurrency: { name: 'HSK', symbol: 'HSK', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet.hsk.xyz'] } },
};

const client = createPublicClient({
  chain: hashkeyTestnet,
  transport: http(),
});

const KYC_ABI = [
  {
    name: 'isHuman',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }, { name: '', type: 'uint8' }],
  },
  {
    name: 'getKycInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [
      { name: 'ensName', type: 'string' },
      { name: 'level', type: 'uint8' },
      { name: 'status', type: 'uint8' },
      { name: 'createTime', type: 'uint256' },
    ],
  },
];

const KYC_LEVELS = ['None', 'Basic', 'Advanced', 'Professional', 'Ultimate'];
const KYC_STATUSES = ['None', 'Approved', 'Revoked'];

export async function getKycStatus(address) {
  try {
    const [isHumanResult, kycInfo] = await Promise.all([
      client.readContract({ address: MOCK_KYC_SBT, abi: KYC_ABI, functionName: 'isHuman', args: [address] }),
      client.readContract({ address: MOCK_KYC_SBT, abi: KYC_ABI, functionName: 'getKycInfo', args: [address] }),
    ]);

    return {
      isHuman: isHumanResult[0],
      level: Number(isHumanResult[1]),
      levelName: KYC_LEVELS[Number(isHumanResult[1])] || 'Unknown',
      ensName: kycInfo[0] || '--',
      status: KYC_STATUSES[Number(kycInfo[2])] || 'Unknown',
      createTime: Number(kycInfo[3]),
    };
  } catch {
    return { isHuman: false, level: 0, levelName: 'None', ensName: '--', status: 'None', createTime: 0 };
  }
}

export { client, hashkeyTestnet };
