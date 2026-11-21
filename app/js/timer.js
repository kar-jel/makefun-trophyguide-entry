// Countdown and stopwatch widget with complete, leak-free lifecycle controls.
export function formatClock(seconds) {
  const value = Math.max(0, Math.floor(Number(seconds) || 0));
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

export function createTimer(root, { seconds = 0, mode, onDone = () => {} } = {}) {
  const initial = Math.max(0, Math.floor(Number(seconds) || 0));
  const timerMode = mode || (initial > 0 ? 'countdown' : 'stopwatch');
  let remaining = initial, elapsed = 0, interval = null, destroyed = false, completed = false;
  let startedAt = false;
  const doc = root?.ownerDocument || globalThis.document;
  const readout = doc?.createElement('output'), status = doc?.createElement('span');
  const progress = doc?.createElement('div'), fill = doc?.createElement('i');
  const controls = doc?.createElement('div'), buttons = {};
  const stopTick = () => { if (interval !== null) { clearInterval(interval); interval = null; } };
  function paint() {
    if (!root || destroyed) return;
    readout.textContent = formatClock(timerMode === 'countdown' ? remaining : elapsed);
    status.textContent = timerMode === 'countdown' ? `${formatClock(elapsed)} elapsed / ${formatClock(initial)} planned` : `${formatClock(elapsed)} elapsed / stopwatch`;
    const fraction = timerMode === 'countdown' && initial ? 1 - remaining / initial : Math.min(elapsed / 3600, 1);
    fill.style.width = `${Math.max(0, Math.min(100, fraction * 100))}%`;
    progress.setAttribute('aria-valuenow', String(Math.round(fraction * 100)));
    root.classList.toggle('timer-warning', timerMode === 'countdown' && remaining > 0 && remaining <= 60);
    root.classList.toggle('timer-running', interval !== null);
    buttons.start.disabled = interval !== null || completed; buttons.pause.disabled = interval === null;
    buttons.resume.disabled = interval !== null || !startedAt || completed;
  }
  function tick() {
    if (timerMode === 'countdown') {
      remaining = Math.max(0, remaining - 1); elapsed = initial - remaining;
      if (!remaining) { stopTick(); completed = true; paint(); onDone(); return; }
    } else elapsed += 1;
    paint();
  }
  function start() {
    if (destroyed || interval !== null || completed) return api;
    if (timerMode === 'countdown' && remaining <= 0) { remaining = initial; elapsed = 0; }
    startedAt = true; interval = setInterval(tick, 1000); paint(); return api;
  }
  function pause() { stopTick(); paint(); return api; }
  function resume() { return start(); }
  function reset() { stopTick(); remaining = initial; elapsed = 0; completed = false; startedAt = false; paint(); return api; }
  function destroy() { stopTick(); destroyed = true; root?.replaceChildren(); }
  if (root && doc) {
    root.classList.add('hunt-timer'); readout.dataset.timerReadout = ''; readout.setAttribute('aria-live', 'off');
    status.className = 'timer-status'; progress.className = 'timer-progress'; progress.setAttribute('role', 'progressbar');
    progress.setAttribute('aria-label', 'Timer progress'); progress.setAttribute('aria-valuemin', '0'); progress.setAttribute('aria-valuemax', '100'); progress.append(fill);
    controls.className = 'timer-controls';
    for (const [action, text] of [['start', 'Start'], ['pause', 'Pause'], ['resume', 'Resume'], ['reset', 'Reset']]) {
      const button = doc.createElement('button'); button.type = 'button'; button.dataset.timerAction = action; button.textContent = text;
      button.addEventListener('click', () => ({ start, pause, resume, reset })[action]()); buttons[action] = button; controls.append(button);
    }
    root.append(readout, status, progress, controls);
  }
  const api = { start, pause, resume, reset, destroy }; paint(); return api;
}
