// Central keyboard registry: keys are normalized and editable targets are ignored.
const SHORTCUTS = Object.freeze([
  { key: '/', action: 'search', label: 'Focus trophy search', scope: 'Anywhere outside editable fields' },
  { key: 'h', action: 'hideEarned', label: 'Toggle hide-earned filter', scope: 'Anywhere outside editable fields' },
  { key: 's', action: 'spoilers', label: 'Toggle spoiler mode', scope: 'Anywhere outside editable fields' },
  { key: 'n', action: 'notes', label: 'Open notes', scope: 'Anywhere outside editable fields' },
  { key: 'r', action: 'roadmap', label: 'Jump to roadmap', scope: 'Anywhere outside editable fields' },
  { key: 't', action: 'timer', label: 'Start or pause the timer', scope: 'Anywhere outside editable fields' },
  { key: 'x', action: 'resetView', label: 'Reset progress view', scope: 'Anywhere outside editable fields' },
  { key: '?', action: 'help', label: 'Open this help', scope: 'Anywhere outside editable fields' }
]);
const editable = target => target instanceof Element && !!target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]');
const normalized = key => key === '?' || key === '/' ? key : String(key).toLowerCase();

function validateRegistry(list) {
  const seen = new Set();
  for (const item of list) {
    const key = normalized(item.key);
    if (seen.has(key)) throw new Error(`Shortcut conflict: ${key}`);
    seen.add(key);
  }
  return true;
}
validateRegistry(SHORTCUTS);

export function shortcutList() {
  return SHORTCUTS.map(item => ({ ...item }));
}

export function installShortcuts(handlers = {}) {
  validateRegistry(SHORTCUTS);
  const listener = event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat || editable(event.target)) return;
    const item = SHORTCUTS.find(entry => normalized(entry.key) === normalized(event.key));
    if (!item || typeof handlers[item.action] !== 'function') return;
    if (item.action === 'search') event.preventDefault();
    handlers[item.action](event);
  };
  document.addEventListener('keydown', listener);
  return () => document.removeEventListener('keydown', listener);
}

export function renderShortcutHelp(root) {
  if (!root) return;
  root.replaceChildren(); root.className = 'shortcut-help';
  const dialog = document.createElement('dialog'); dialog.className = 'shortcut-dialog';
  dialog.setAttribute('aria-labelledby', 'shortcut-title');
  const title = document.createElement('h2'); title.id = 'shortcut-title'; title.textContent = 'Keyboard shortcuts';
  const list = document.createElement('dl');
  for (const item of shortcutList()) {
    const term = document.createElement('dt'); term.textContent = item.key === '/' ? 'SLASH' : item.key.toUpperCase();
    const detail = document.createElement('dd'); detail.className = 'shortcut-detail';
    const action = document.createElement('strong'); action.textContent = item.label;
    const scope = document.createElement('small'); scope.textContent = item.scope;
    detail.append(action, scope); list.append(term, detail);
  }
  const close = document.createElement('button'); close.type = 'button'; close.textContent = 'Close';
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.append(title, list, close); root.append(dialog);
  root.open = () => { if (!dialog.open) dialog.showModal(); };
  root.close = () => { if (dialog.open) dialog.close(); };
  root.dialog = dialog;
}
