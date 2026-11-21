// Build and render a compact, prioritized trophy clean-up plan.
const KIND_MINUTES = Object.freeze({ story: 20, side: 15, activity: 12, collectible: 8, online: 15, misc: 10 });
const priority = trophy => (trophy.missable ? 0 : 2) + (trophy.kind === 'story' ? 0 : 1);
const remaining = (trophy, progress) => {
  const value = progress?.[trophy.id];
  return !(value === true || value?.earned === true || value?.completed === true);
};
const label = value => String(value || 'Unassigned').replace(/[-_]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());

export function buildHuntSession(trophies, progress) {
  const unearned = (trophies || []).filter(trophy => remaining(trophy, progress));
  const groups = new Map();
  for (const trophy of unearned) {
    const key = `${trophy.stage || 'Unassigned'}\u0000${trophy.kind || 'misc'}`;
    if (!groups.has(key)) groups.set(key, { stage: trophy.stage || 'Unassigned', kind: trophy.kind || 'misc', trophies: [] });
    groups.get(key).trophies.push(trophy);
  }
  const ordered = [...groups.values()].map(group => {
    group.trophies.sort((a, b) => priority(a) - priority(b) || String(a.name).localeCompare(String(b.name)));
    group.remaining = group.trophies.length;
    group.minutes = group.remaining * (KIND_MINUTES[group.kind] || KIND_MINUTES.misc);
    group.priority = Math.min(...group.trophies.map(priority));
    return group;
  }).sort((a, b) => a.priority - b.priority || a.stage.localeCompare(b.stage) || a.kind.localeCompare(b.kind));
  return { groups: ordered, remaining: unearned.length, minutes: ordered.reduce((sum, group) => sum + group.minutes, 0) };
}

export function renderHuntSession(root, session) {
  if (!root) return;
  root.replaceChildren();
  root.className = 'hunt-session';
  const heading = document.createElement('h2');
  heading.textContent = 'Next clean-up session';
  root.append(heading);
  const summary = document.createElement('p');
  summary.className = 'hunt-summary';
  summary.textContent = `${session.remaining} objectives remaining · about ${session.minutes} min`;
  root.append(summary);
  if (!session.groups.length) {
    const done = document.createElement('p'); done.textContent = 'All objectives earned — session complete.'; root.append(done); return;
  }
  const list = document.createElement('div'); list.className = 'hunt-groups';
  for (const group of session.groups) {
    const card = document.createElement('article'); card.className = 'hunt-group';
    const title = document.createElement('h3'); title.textContent = `${label(group.stage)} · ${label(group.kind)}`;
    const count = document.createElement('span'); count.className = 'hunt-count'; count.textContent = `${group.remaining} left · ~${group.minutes} min`;
    const names = document.createElement('ul');
    for (const trophy of group.trophies.slice(0, 3)) { const item = document.createElement('li'); item.textContent = trophy.name; names.append(item); }
    if (group.remaining > 3) { const more = document.createElement('li'); more.textContent = `+ ${group.remaining - 3} more`; names.append(more); }
    card.append(title, count, names); list.append(card);
  }
  root.append(list);
}
