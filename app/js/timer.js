// Countdown/stopwatch widget with explicit lifecycle control.
export function createTimer(root, { seconds = 0, onDone = () => {} } = {}) {
  let initial = Math.max(0, Math.floor(Number(seconds) || 0));
  let remaining = initial;
  let interval = null;
  let mode = initial > 0 ? 'countdown' : 'stopwatch';
  let elapsed = 0;
  let destroyed = false;
  const display = root?.querySelector('[data-timer-readout]') || root;
  const button = (action, text) => {
    const element = document.createElement('button'); element.type = 'button';
    element.dataset.timerAction = action; element.textContent = text; return element;
  };
  const readout = () => {
    const value = mode === 'countdown' ? remaining : elapsed;
    const minutes = Math.floor(value / 60).toString().padStart(2, '0');
    const secs = (value % 60).toString().padStart(2, '0');
    if (display) display.textContent = `${minutes}:${secs}`;
  };
  const stopInterval = () => { if (interval !== null) { clearInterval(interval); interval = null; } };
  const tick = () => {
    if (mode === 'countdown') {
      remaining = Math.max(0, remaining - 1); readout();
      if (remaining === 0) { stopInterval(); onDone(); }
    } else { elapsed += 1; readout(); }
  };
  const start = () => {
    if (destroyed || interval !== null) return;
    if (mode === 'countdown' && remaining <= 0) { remaining = initial; if (!remaining) { mode = 'stopwatch'; } }
    readout(); interval = setInterval(tick, 1000);
  };
  const pause = () => { stopInterval(); };
  const reset = () => { stopInterval(); remaining = initial; elapsed = 0; readout(); };
  const destroy = () => { stopInterval(); destroyed = true; if (root) root.replaceChildren(); };
  if (root) {
    root.classList.add('hunt-timer');
    const output = document.createElement('output'); output.dataset.timerReadout = ''; output.setAttribute('aria-live', 'off');
    root.append(output, button('start', 'Start'), button('pause', 'Pause'), button('reset', 'Reset'));
    root.addEventListener('click', event => {
      const action = event.target.closest('[data-timer-action]')?.dataset.timerAction;
      if (action === 'start') start(); else if (action === 'pause') pause(); else if (action === 'reset') reset();
    });
  }
  readout();
  return { start, pause, reset, destroy };
}
