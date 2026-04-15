// ========================================
// UI helpers for step-based flow
// ========================================

const STEP_IDS = ['step-connect', 'step-kyc', 'step-proof', 'step-compliant'];

/**
 * Show a step by ID, hide all others with exit/enter transitions.
 */
export function showStep(stepId) {
  const incoming = document.getElementById(stepId);
  if (!incoming) return;

  for (const id of STEP_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;

    if (id === stepId) {
      // Show incoming
      el.classList.remove('exiting');
      el.classList.add('active');
    } else if (el.classList.contains('active')) {
      // Animate out current
      el.classList.remove('active');
      el.classList.add('exiting');
      // Remove exiting class after animation
      setTimeout(() => el.classList.remove('exiting'), 160);
    } else {
      el.classList.remove('active', 'exiting');
    }
  }
}

/**
 * Animate a proof generation stage.
 * stageNumber: 1, 2, or 3
 * state: 'active' | 'done' | 'reset'
 */
export function animateProofStage(stageNumber, state) {
  const stage = document.getElementById(`stage-${stageNumber}`);
  if (!stage) return;

  stage.classList.remove('stage-active', 'stage-done');

  if (state === 'active') {
    stage.classList.add('stage-active');
  } else if (state === 'done') {
    stage.classList.add('stage-done');
  }
  // 'reset' leaves no class
}

/**
 * Reset all proof stages to initial state.
 */
export function resetProofStages() {
  for (let i = 1; i <= 3; i++) {
    animateProofStage(i, 'reset');
  }
}

/**
 * Show the compliance badge with entrance animation.
 */
export function showComplianceBadge() {
  const badge = document.getElementById('compliance-badge');
  if (badge) {
    badge.classList.add('visible');
  }
}

/**
 * Toggle the activity log open/closed.
 */
export function initLogToggle() {
  const toggle = document.getElementById('log-toggle');
  const container = document.getElementById('log-container');
  if (!toggle || !container) return;

  toggle.addEventListener('click', () => {
    const isOpen = container.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

// ========================================
// Existing utility functions (preserved)
// ========================================

export function log(message, type = '') {
  const entries = document.getElementById('log-entries');
  if (!entries) return;
  const entry = document.createElement('div');
  entry.className = `log-entry ${type ? 'log-' + type : ''}`;
  const time = new Date().toLocaleTimeString();
  const timeSpan = document.createElement('span');
  timeSpan.className = 'time';
  timeSpan.textContent = time;
  entry.appendChild(timeSpan);
  entry.appendChild(document.createTextNode(' ' + message));
  entries.prepend(entry);
  while (entries.children.length > 50) entries.lastChild.remove();
}

export function showStatus(elementId, message, type) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.className = `status-box ${type}`;
}

export function hideStatus(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.className = 'status-box hidden';
}

export function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

export function setClass(id, className) {
  const el = document.getElementById(id);
  if (el) el.className = className;
}

export function enableBtn(id, enabled = true) {
  const el = document.getElementById(id);
  if (el) el.disabled = !enabled;
}

export function truncateAddress(addr) {
  if (!addr) return 'Not connected';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

export function showConnectError(message) {
  const el = document.getElementById('connect-error');
  if (!el) return;
  el.textContent = message;
  el.classList.remove('hidden');
}

export function hideConnectError() {
  const el = document.getElementById('connect-error');
  if (!el) return;
  el.textContent = '';
  el.classList.add('hidden');
}
