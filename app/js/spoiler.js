// Story spoiler preference and safe trophy text.
const KEY = 'leonida-hide-spoilers';
export function spoilersHidden() { try { return localStorage.getItem(KEY) === 'true'; } catch { return false; } }
export function setSpoilers(hidden) { try { localStorage.setItem(KEY, String(Boolean(hidden))); } catch {} }
export function redact(trophy, earned = false) { const hidden = spoilersHidden() && trophy.kind === 'story' && !earned; return { name: hidden ? '████████████' : trophy.name, description: hidden ? 'Description concealed until this objective is earned.' : trophy.description }; }
