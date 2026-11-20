// Trophy data loading and derived indexes.
export async function loadTrophies() {
  let response;
  try { response = await fetch('./data/trophies.json'); }
  catch (error) { throw new Error(`Could not fetch trophy data: ${error.message}`); }
  if (!response.ok) throw new Error(`Could not load trophies (HTTP ${response.status}).`);
  let data;
  try { data = await response.json(); } catch { throw new Error('Trophy data is not valid JSON.'); }
  if (!data || !Array.isArray(data.trophies) || data.trophies.some(t => !Number.isInteger(t.id) || typeof t.name !== 'string' || typeof t.grade !== 'string' || typeof t.stage !== 'string')) throw new Error('Trophy data has an invalid shape.');
  return data.trophies;
}
export function indexById(trophies) { return new Map(trophies.map(trophy => [trophy.id, trophy])); }
export function groupsByStage(trophies) { return [...trophies.reduce((groups, trophy) => groups.set(trophy.stage, [...(groups.get(trophy.stage) || []), trophy]), new Map())]; }
export function countsByGrade(trophies, progress) { return ['platinum','gold','silver','bronze'].map(grade => ({ grade, total: trophies.filter(t => t.grade === grade).length, earned: trophies.filter(t => t.grade === grade && progress[t.id]).length })); }
export function missableList(trophies) { return trophies.filter(t => t.missable); }
