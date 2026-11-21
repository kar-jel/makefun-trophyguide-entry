// Keyboard shortcuts and an accessible, lightweight help overlay.
const SHORTCUTS = Object.freeze([
  ['/', 'Focus trophy search', 'search'], ['h', 'Toggle hide-earned filter', 'hideEarned'],
  ['s', 'Toggle spoiler mode', 'spoilers'], ['n', 'Open notes panel', 'notes'],
  ['r', 'Jump to roadmap', 'roadmap'], ['t', 'Start or pause hunt timer', 'timer'],
  ['?', 'Show keyboard shortcut help', 'help']
]);
const editable = target => target instanceof Element && (target.closest('input, textarea, select, [contenteditable="true"]') !== null);

export function installShortcuts(handlers = {}) {
  const listener = event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat || editable(event.target)) return;
    const key = event.key === '?' ? '?' : event.key.toLowerCase();
    const shortcut = SHORTCUTS.find(([candidate]) => candidate === key);
    if (!shortcut) return;
    const [, , action] = shortcut;
    if (action === 'search') { event.preventDefault(); handlers.search?.(); return; }
    if (action === 'help') { handlers.help?.(); return; }
    handlers[action]?.(event);
  };
  document.addEventListener('keydown', listener);
  return () => document.removeEventListener('keydown', listener);
}

export function renderShortcutHelp(root) {
  if (!root) return;
  root.replaceChildren();
  root.className = 'shortcut-help';
  const dialog = document.createElement('dialog');
  dialog.className = 'shortcut-dialog';
  dialog.setAttribute('aria-labelledby', 'shortcut-title');
  const title = document.createElement('h2'); title.id = 'shortcut-title'; title.textContent = 'Keyboard shortcuts';
  const list = document.createElement('dl');
  for (const [key, description] of SHORTCUTS) {
    const term = document.createElement('dt'); term.textContent = key === '/' ? 'Slash' : key.toUpperCase();
    const detail = document.createElement('dd'); detail.textContent = description;
    list.append(term, detail);
  }
  const close = document.createElement('button'); close.type = 'button'; close.textContent = 'Close';
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.append(title, list, close); root.append(dialog);
  root.open = () => { if (!dialog.open) dialog.showModal(); };
  root.close = () => { if (dialog.open) dialog.close(); };
  root.dialog = dialog;
}
