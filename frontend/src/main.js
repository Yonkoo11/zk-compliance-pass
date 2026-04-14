import { connectWallet, getAccount, onAccountChange } from './wallet.js';
import { getKycStatus } from './kyc.js';
import { initNoir, generateProof, formatProofForChain } from './proof.js';
import { submitProof, deposit, withdraw, isCompliant, getBalance, formatEther } from './contracts.js';
import { log, showStatus, hideStatus, setText, setClass, enableBtn, truncateAddress } from './ui.js';

// Demo mode values (match the seeded on-chain state)
const DEMO_INPUTS = {
  merkle_root: '0x1c5e0b3f58661b92b7d2bad2b63f2c27063adf308b3b02f7d65cc3580b4c13e0',
  address_hash: '0x1234',
  kyc_level: 2,
  salt: '0x5678',
  index: '0',
  hash_path: ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
  nullifier_secret: '0xabcd',
};

const DEMO_NULLIFIER = '0x27bf76d59941726dc948eed8f755c9af9e2e2a3ada0168bb20ea91991bcfa692';

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
  log('Reading KYC status...');
  const kyc = await getKycStatus(account);
  setText('kyc-level', kyc.level > 0 ? `Level ${kyc.level} - ${kyc.levelName}` : 'No KYC');
  setText('ens-name', kyc.ensName);
  setText('kyc-status', kyc.status);
  setClass('kyc-status', kyc.status === 'Approved' ? 'status-compliant' : 'status-pending');

  if (kyc.level > 0) {
    log(`KYC Level ${kyc.level} (${kyc.levelName}) detected`, 'success');
    enableBtn('generate-btn');
  } else {
    log('No KYC found for this address', 'info');
  }

  // Check compliance
  const compliant = await isCompliant(account);
  if (compliant) {
    setText('compliance-status', 'Verified');
    setClass('compliance-status', 'status-compliant');
    enableBtn('deposit-btn');
    enableBtn('withdraw-btn');
    log('Address is already marked compliant on-chain', 'success');
  }

  // Load vault balance
  await refreshBalance(account);

  // Start initializing Noir in background
  initNoir((msg) => log(msg, 'info')).catch((err) => {
    log(`ZK init warning: ${err.message}`, 'error');
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
    const threshold = parseInt(document.getElementById('threshold-input').value);
    const inputs = {
      ...DEMO_INPUTS,
      threshold,
      nullifier_hash: DEMO_NULLIFIER,
    };

    showStatus('proof-status', 'Generating ZK proof... This may take 30-60 seconds.', 'loading');

    generatedProof = await generateProof(inputs, (msg) => log(msg, 'info'));

    showStatus('proof-status', 'Proof generated! Ready to submit on-chain.', 'success');
    log('ZK proof generated successfully', 'success');
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
    const nullifierBytes32 = DEMO_NULLIFIER.padEnd(66, '0').slice(0, 66);

    showStatus('submit-status', 'Submitting proof to ComplianceGate...', 'loading');
    log('Submitting ZK proof on-chain...', 'info');

    const { hash } = await submitProof(proofHex, threshold, nullifierBytes32);

    showStatus('submit-status', 'Compliance verified on-chain!', 'success');
    log(`Proof accepted! Tx: ${truncateAddress(hash)}`, 'success');

    setText('compliance-status', 'Verified');
    setClass('compliance-status', 'status-compliant');
    enableBtn('deposit-btn');
    enableBtn('withdraw-btn');
    enableBtn('submit-btn', false);
  } catch (err) {
    const msg = err.message.includes('Nullifier') ? 'This proof was already used.' : err.message;
    showStatus('submit-status', `Submission failed: ${msg}`, 'error');
    log(`Submit error: ${msg}`, 'error');
    btn.disabled = false;
  }
  btn.textContent = 'Submit ZK Proof';
});

// -- Deposit --
document.getElementById('deposit-btn').addEventListener('click', async () => {
  const amount = document.getElementById('deposit-input').value;
  if (!amount || parseFloat(amount) <= 0) {
    showStatus('vault-status', 'Enter an amount to deposit.', 'error');
    return;
  }

  const btn = document.getElementById('deposit-btn');
  btn.disabled = true;
  btn.textContent = 'Depositing...';

  try {
    showStatus('vault-status', 'Depositing into gated vault...', 'loading');
    log(`Depositing ${amount} HSK...`, 'info');

    const { hash } = await deposit(amount);

    showStatus('vault-status', `Deposited ${amount} HSK!`, 'success');
    log(`Deposit confirmed! Tx: ${truncateAddress(hash)}`, 'success');

    await refreshBalance(getAccount());
  } catch (err) {
    const msg = err.message.includes('compliance') ? 'KYC compliance required. Submit your proof first.' : err.message;
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
    log(`Withdrawal confirmed! Tx: ${truncateAddress(hash)}`, 'success');

    await refreshBalance(account);
  } catch (err) {
    showStatus('vault-status', `Withdrawal failed: ${err.message}`, 'error');
    log(`Withdraw error: ${err.message}`, 'error');
  } finally {
    btn.textContent = 'Withdraw All';
    btn.disabled = false;
  }
});

// -- Account changes --
onAccountChange(async (account) => {
  if (account) {
    await onConnected(account);
  } else {
    document.getElementById('connect-btn').textContent = 'Connect Wallet';
    setText('id-address', 'Not connected');
    setText('trade-address', 'Not connected');
  }
});

// Initial log
log('zkGate loaded. Connect your wallet to begin.', 'info');
