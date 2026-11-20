// Trophy categories and searchable checklist filtering.
export const KINDS = ['all', 'story', 'missable', 'collectibles', 'activities', 'online'];
export function matchesKind(trophy, kind) { return kind === 'all' || (kind === 'missable' ? Boolean(trophy.missable) || trophy.kind === 'missable' : trophy.kind === kind); }
export function matchesQuery(trophy, query) { return `${trophy.name} ${trophy.guide || ''}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()); }
export function applyFilters(trophies, { kind = 'all', query = '', hideEarned = false, progress = {} } = {}) { return trophies.filter(t => matchesKind(t, kind) && matchesQuery(t, query) && !(hideEarned && progress[t.id])); }
