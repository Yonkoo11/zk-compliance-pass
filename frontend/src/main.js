import { connectWallet, getAccount, onAccountChange } from './wallet.js';
import { getKycStatus } from './kyc.js';
import { initNoir, generateProof, formatProofForChain, getNullifierFromProof } from './proof.js';
import { submitProof, deposit, withdraw, isCompliant, getBalance, formatEther } from './contracts.js';
import {
  log, showStatus, setText, setClass, enableBtn, truncateAddress,
  showStep, animateProofStage, resetProofStages, showComplianceBadge, initLogToggle,
  showConnectError, hideConnectError
} from './ui.js';

// Demo mode values (match the seeded on-chain state)
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

// ========================================
// Initialization
// ========================================

initLogToggle();
log('zkGate loaded. Connect your wallet to begin.', 'info');

// ========================================
// Connect: both header button and step CTA
// ========================================

async function handleConnect() {
  const headerBtn = document.getElementById('connect-btn');
  const ctaBtn = document.getElementById('connect-cta');

  try {
    hideConnectError();
    headerBtn.textContent = 'Connecting...';
    headerBtn.disabled = true;
    if (ctaBtn) {
      ctaBtn.textContent = 'Connecting...';
      ctaBtn.disabled = true;
    }

    const account = await connectWallet();
    log(`Wallet connected: ${truncateAddress(account)}`, 'success');
    await onConnected(account);
  } catch (err) {
    let userMsg = err.message;
    if (userMsg.includes('MetaMask') || userMsg.includes('install')) {
      userMsg = 'MetaMask not detected. Please install it or open this page in a browser with MetaMask.';
    } else if (userMsg.includes('User rejected') || userMsg.includes('denied')) {
      userMsg = 'Connection was rejected. Click Connect Wallet to try again.';
    }
    showConnectError(userMsg);
    log(`Connection failed: ${err.message}`, 'error');
    headerBtn.textContent = 'Connect Wallet';
    headerBtn.disabled = false;
    if (ctaBtn) {
      ctaBtn.textContent = 'Connect Wallet';
      ctaBtn.disabled = false;
    }
  }
}

document.getElementById('connect-btn').addEventListener('click', handleConnect);
document.getElementById('connect-cta').addEventListener('click', handleConnect);

// ========================================
// Post-connect flow
// ========================================

async function onConnected(account) {
  // Update header button
  const headerBtn = document.getElementById('connect-btn');
  headerBtn.textContent = truncateAddress(account);
  headerBtn.classList.add('connected');

  // Check if already compliant first
  const compliant = await isCompliant(account);
  if (compliant) {
    log('Already marked compliant on-chain', 'success');
    showStep('step-compliant');
    showComplianceBadge();
    enableBtn('deposit-btn');
    enableBtn('withdraw-btn');
    await refreshBalance(account);
    return;
  }

  // Show KYC step
  showStep('step-kyc');

  // Load KYC status
  log('Reading KYC status from on-chain SBT...');
  setText('kyc-address', truncateAddress(account));
  const kyc = await getKycStatus(account);

  setText('kyc-level', kyc.level > 0 ? `Level ${kyc.level} - ${kyc.levelName}` : 'No KYC');
  setText('ens-name', kyc.ensName);
  setText('kyc-status', kyc.status);

  if (kyc.status === 'Approved') {
    setClass('kyc-status', 'field-value field-approved');
  } else {
    setClass('kyc-status', 'field-value field-pending');
  }

  if (kyc.level > 0) {
    log(`KYC Level ${kyc.level} (${kyc.levelName}) found`, 'success');
    enableBtn('generate-btn');
  } else {
    log('No KYC found. Using demo mode with test values.', 'info');
    enableBtn('generate-btn');
  }

  // Start initializing ZK system in background
  initNoir((msg) => log(msg, 'info')).catch((err) => {
    log(`ZK init failed: ${err.message}`, 'error');
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

// ========================================
// Proof Generation
// ========================================

document.getElementById('generate-btn').addEventListener('click', async () => {
  const btn = document.getElementById('generate-btn');
  btn.disabled = true;
  btn.textContent = 'Generating...';
  btn.classList.add('generating');

  // Move to proof step
  showStep('step-proof');
  resetProofStages();
  setText('proof-time-msg', 'This may take 30-60 seconds in the browser...');

  try {
    const inputs = {
      ...DEMO_INPUTS,
      threshold: '1',
      nullifier_hash: '0x27bf76d59941726dc948eed8f755c9af9e2e2a3ada0168bb20ea91991bcfa692',
    };

    // Stage 1: Computing witness
    animateProofStage(1, 'active');

    generatedProof = await generateProof(inputs, (msg) => {
      log(msg, 'info');

      // Progress stage transitions based on log messages
      if (msg.includes('Generating ZK proof') || msg.includes('generating')) {
        animateProofStage(1, 'done');
        animateProofStage(2, 'active');
      }
    });

    // All stages done
    animateProofStage(2, 'done');
    animateProofStage(3, 'done');
    setText('proof-time-msg', 'Proof generated successfully.');
    log('ZK proof generated', 'success');
    enableBtn('submit-btn');

  } catch (err) {
    showStatus('submit-status', `Proof generation failed: ${err.message}`, 'error');
    log(`Proof error: ${err.message}`, 'error');
    setText('proof-time-msg', 'Proof generation failed. Try again.');

    // Go back to KYC step so user can retry
    setTimeout(() => {
      showStep('step-kyc');
      btn.classList.remove('generating');
      btn.textContent = 'Generate ZK Proof';
      btn.disabled = false;
    }, 2000);
    return;
  }

  btn.classList.remove('generating');
  btn.textContent = 'Generate ZK Proof';
  btn.disabled = false;
});

// ========================================
// Submit Proof
// ========================================

document.getElementById('submit-btn').addEventListener('click', async () => {
  if (!generatedProof) return;
  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Submitting...';
  btn.classList.add('generating');

  try {
    const threshold = 1;
    const proofHex = formatProofForChain(generatedProof);
    const nullifierHash = getNullifierFromProof(generatedProof);

    showStatus('submit-status', 'Submitting proof to ComplianceGate contract...', 'loading');
    log('Sending proof transaction...', 'info');

    const { hash } = await submitProof(proofHex, threshold, nullifierHash);

    log(`Proof accepted! View tx: ${EXPLORER_URL}${hash}`, 'success');

    // Move to compliant step
    showStep('step-compliant');
    // Small delay for step transition, then show badge
    setTimeout(() => showComplianceBadge(), 300);

    enableBtn('deposit-btn');
    enableBtn('withdraw-btn');
    await refreshBalance(getAccount());

  } catch (err) {
    let msg = err.message;
    if (msg.includes('Nullifier')) msg = 'This proof was already used. Generate a new one with a different nullifier.';
    else if (msg.includes('User rejected')) msg = 'Transaction rejected by user.';
    else if (msg.includes('insufficient')) msg = 'Insufficient HSK for gas fees.';
    showStatus('submit-status', `Failed: ${msg}`, 'error');
    log(`Submit error: ${msg}`, 'error');
    btn.disabled = false;
  }

  btn.classList.remove('generating');
  btn.textContent = 'Submit Proof On-Chain';
});

// ========================================
// Deposit
// ========================================

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

// ========================================
// Withdraw
// ========================================

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

// ========================================
// Account changes
// ========================================

onAccountChange(async (account) => {
  if (account) {
    generatedProof = null;
    enableBtn('submit-btn', false);
    await onConnected(account);
  } else {
    document.getElementById('connect-btn').textContent = 'Connect Wallet';
    document.getElementById('connect-btn').classList.remove('connected');
    showStep('step-connect');
  }
});
