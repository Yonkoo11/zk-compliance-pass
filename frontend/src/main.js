import { connectWallet, getAccount, onAccountChange } from './wallet.js';
import { getKycStatus } from './kyc.js';
import { initNoir, generateProof, formatProofForChain, getNullifierFromProof } from './proof.js';
import { submitProof, deposit, withdraw, isCompliant, getBalance, formatEther } from './contracts.js';
import { log, showStatus, setText, setClass, enableBtn, truncateAddress } from './ui.js';

// Demo mode values (match the seeded on-chain state)
// In production, these would be computed from on-chain KYC data
const DEMO_INPUTS = {
  merkle_root: '0x1c5e0b3f58661b92b7d2bad2b63f2c27063adf308b3b02f7d65cc3580b4c13e0',
  address_hash: '0x1234',
  kyc_level: '2',
  salt: '0x5678',
  index: '0',
  hash_path: ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
  nullifier_secret: '0xabcd',
};

const EXPLORER_URL = 'https://testnet-explorer.hsk.xyz/tx/';

let generatedProof = null;

// -- Wallet Connection --
document.getElementById('connect-btn').addEventListener('click', async () => {
  try {
    const btn = document.getElementById('connect-btn');
    btn.textContent = 'Connecting...';
    btn.disabled = true;

    const account = await connectWallet();
    log(`Wallet connected: ${truncateAddress(account)}`, 'success');
    await onConnected(account);
  } catch (err) {
    log(`Connection failed: ${err.message}`, 'error');
    document.getElementById('connect-btn').textContent = 'Connect Wallet';
    document.getElementById('connect-btn').disabled = false;
  }
});

async function onConnected(account) {
  document.getElementById('connect-btn').textContent = truncateAddress(account);
  setText('id-address', truncateAddress(account));
  setText('trade-address', truncateAddress(account));

  // Load KYC status
  log('Reading KYC status from on-chain SBT...');
  const kyc = await getKycStatus(account);
  setText('kyc-level', kyc.level > 0 ? `Level ${kyc.level} - ${kyc.levelName}` : 'No KYC');
  setText('ens-name', kyc.ensName);
  setText('kyc-status', kyc.status);
  setClass('kyc-status', kyc.status === 'Approved' ? 'status-compliant' : 'status-pending');

  if (kyc.level > 0) {
    log(`KYC Level ${kyc.level} (${kyc.levelName}) found`, 'success');
    enableBtn('generate-btn');
  } else {
    log('No KYC found. Using demo mode with test values.', 'info');
    enableBtn('generate-btn');
  }

  // Check existing compliance
  const compliant = await isCompliant(account);
  if (compliant) {
    setText('compliance-status', 'Verified');
    setClass('compliance-status', 'status-compliant');
    enableBtn('deposit-btn');
    enableBtn('withdraw-btn');
    log('Already marked compliant on-chain', 'success');
  }

  // Load vault balance
  await refreshBalance(account);

  // Start initializing ZK system in background
  initNoir((msg) => log(msg, 'info')).catch((err) => {
    log(`ZK init failed: ${err.message}. Proof generation may not work in this browser.`, 'error');
  });
}

async function refreshBalance(account) {
  try {
    const bal = await getBalance(account);
    setText('vault-balance', `${formatEther(bal)} HSK`);
  } catch {
    setText('vault-balance', '0 HSK');
  }
}

// -- Proof Generation --
document.getElementById('generate-btn').addEventListener('click', async () => {
  const btn = document.getElementById('generate-btn');
  btn.disabled = true;
  btn.classList.add('generating');
  btn.textContent = 'Generating...';

  try {
    const threshold = document.getElementById('threshold-input').value;
    const inputs = {
      ...DEMO_INPUTS,
      threshold,
      nullifier_hash: '0x27bf76d59941726dc948eed8f755c9af9e2e2a3ada0168bb20ea91991bcfa692',
    };

    showStatus('proof-status', 'Generating ZK proof... This takes 30-60 seconds in the browser.', 'loading');

    generatedProof = await generateProof(inputs, (msg) => log(msg, 'info'));

    showStatus('proof-status', 'Proof generated! Click "Submit ZK Proof" to verify on-chain.', 'success');
    log('ZK proof generated', 'success');
    enableBtn('submit-btn');
  } catch (err) {
    showStatus('proof-status', `Proof generation failed: ${err.message}`, 'error');
    log(`Proof error: ${err.message}`, 'error');
  } finally {
    btn.classList.remove('generating');
    btn.textContent = 'Generate ZK Proof';
    btn.disabled = false;
  }
});

// -- Submit Proof --
document.getElementById('submit-btn').addEventListener('click', async () => {
  if (!generatedProof) return;
  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    const threshold = parseInt(document.getElementById('threshold-input').value);
    const proofHex = formatProofForChain(generatedProof);
    const nullifierHash = getNullifierFromProof(generatedProof);

    showStatus('submit-status', 'Submitting proof to ComplianceGate contract...', 'loading');
    log('Sending proof transaction...', 'info');

    const { hash } = await submitProof(proofHex, threshold, nullifierHash);

    showStatus('submit-status', 'Compliance verified on-chain!', 'success');
    log(`Proof accepted! View tx: ${EXPLORER_URL}${hash}`, 'success');

    setText('compliance-status', 'Verified');
    setClass('compliance-status', 'status-compliant');
    enableBtn('deposit-btn');
    enableBtn('withdraw-btn');
    enableBtn('submit-btn', false);
  } catch (err) {
    let msg = err.message;
    if (msg.includes('Nullifier')) msg = 'This proof was already used. Generate a new one with a different nullifier.';
    else if (msg.includes('User rejected')) msg = 'Transaction rejected by user.';
    else if (msg.includes('insufficient')) msg = 'Insufficient HSK for gas fees.';
    showStatus('submit-status', `Failed: ${msg}`, 'error');
    log(`Submit error: ${msg}`, 'error');
    btn.disabled = false;
  }
  btn.textContent = 'Submit ZK Proof';
});

// -- Deposit --
document.getElementById('deposit-btn').addEventListener('click', async () => {
  const amountStr = document.getElementById('deposit-input').value;
  const amount = parseFloat(amountStr);
  if (!amountStr || amount <= 0 || amount > 1000) {
    showStatus('vault-status', 'Enter a valid amount (0 to 1000 HSK).', 'error');
    return;
  }

  const btn = document.getElementById('deposit-btn');
  btn.disabled = true;
  btn.textContent = 'Depositing...';

  try {
    showStatus('vault-status', `Depositing ${amountStr} HSK into gated vault...`, 'loading');
    log(`Depositing ${amountStr} HSK...`, 'info');

    const { hash } = await deposit(amountStr);

    showStatus('vault-status', `Deposited ${amountStr} HSK!`, 'success');
    log(`Deposit confirmed! View tx: ${EXPLORER_URL}${hash}`, 'success');

    await refreshBalance(getAccount());
  } catch (err) {
    let msg = err.message;
    if (msg.includes('compliance')) msg = 'KYC compliance required. Submit your ZK proof first.';
    else if (msg.includes('User rejected')) msg = 'Transaction rejected by user.';
    showStatus('vault-status', `Deposit failed: ${msg}`, 'error');
    log(`Deposit error: ${msg}`, 'error');
  } finally {
    btn.textContent = 'Deposit';
    btn.disabled = false;
  }
});

// -- Withdraw --
document.getElementById('withdraw-btn').addEventListener('click', async () => {
  const btn = document.getElementById('withdraw-btn');
  btn.disabled = true;
  btn.textContent = 'Withdrawing...';

  try {
    showStatus('vault-status', 'Withdrawing from vault...', 'loading');
    const account = getAccount();
    const { hash } = await withdraw(account);

    showStatus('vault-status', 'Withdrawal complete!', 'success');
    log(`Withdrawal confirmed! View tx: ${EXPLORER_URL}${hash}`, 'success');

    await refreshBalance(account);
  } catch (err) {
    let msg = err.message;
    if (msg.includes('User rejected')) msg = 'Transaction rejected by user.';
    else if (msg.includes('Insufficient') || msg.includes('No balance')) msg = 'No balance to withdraw.';
    showStatus('vault-status', `Withdrawal failed: ${msg}`, 'error');
    log(`Withdraw error: ${msg}`, 'error');
  } finally {
    btn.textContent = 'Withdraw All';
    btn.disabled = false;
  }
});

// -- Account changes --
onAccountChange(async (account) => {
  if (account) {
    generatedProof = null;
    enableBtn('submit-btn', false);
    await onConnected(account);
  } else {
    document.getElementById('connect-btn').textContent = 'Connect Wallet';
    setText('id-address', 'Not connected');
    setText('trade-address', 'Not connected');
  }
});

// Initial log
log('zkGate loaded. Connect your wallet to begin.', 'info');
