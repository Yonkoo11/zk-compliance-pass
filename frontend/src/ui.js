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
  if (el) el.className = `value ${className}`;
}

export function enableBtn(id, enabled = true) {
  const el = document.getElementById(id);
  if (el) el.disabled = !enabled;
}

export function truncateAddress(addr) {
  if (!addr) return 'Not connected';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}
