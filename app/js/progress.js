// Versioned local progress persistence and calculations.
const STORAGE_KEY = 'leonida-trophy-progress-v2';
function validProgress(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
export function readProgress() { try { return validProgress(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')); } catch { return {}; } }
export function writeProgress(progress) { localStorage.setItem(STORAGE_KEY, JSON.stringify(validProgress(progress))); }
export function isEarned(progress, trophyOrId) { return Boolean(progress[typeof trophyOrId === 'object' ? trophyOrId.id : trophyOrId]); }
export function toggle(progress, id, earned) { return { ...progress, [id]: Boolean(earned) }; }
export function earnedCount(trophies, progress) { return trophies.filter(t => isEarned(progress, t)).length; }
export function percentByGrade(trophies, progress) { return Object.fromEntries(['platinum','gold','silver','bronze'].map(grade => { const all = trophies.filter(t => t.grade === grade); return [grade, { earned: all.filter(t => isEarned(progress,t)).length, total: all.length, percent: all.length ? Math.round(all.filter(t => isEarned(progress,t)).length / all.length * 100) : 0 }]; })); }
export function resetProgress() { localStorage.removeItem(STORAGE_KEY); return {}; }
