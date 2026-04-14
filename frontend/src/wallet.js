const HASHKEY_TESTNET = {
  chainId: '0x85',
  chainName: 'HashKey Chain Testnet',
  rpcUrls: ['https://testnet.hsk.xyz'],
  nativeCurrency: { name: 'HSK', symbol: 'HSK', decimals: 18 },
  blockExplorerUrls: ['https://testnet-explorer.hsk.xyz'],
};

let currentAccount = null;

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask to use this app.');
  }
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  currentAccount = accounts[0];
  await switchToHashKey();
  return currentAccount;
}

export async function switchToHashKey() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: HASHKEY_TESTNET.chainId }],
    });
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [HASHKEY_TESTNET],
      });
    } else {
      throw err;
    }
  }
}

export function getAccount() {
  return currentAccount;
}

export function onAccountChange(callback) {
  if (!window.ethereum) return;
  window.ethereum.on('accountsChanged', (accounts) => {
    currentAccount = accounts[0] || null;
    callback(currentAccount);
  });
  window.ethereum.on('chainChanged', () => {
    window.location.reload();
  });
}
