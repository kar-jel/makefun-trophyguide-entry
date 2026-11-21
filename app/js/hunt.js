// Plan an efficient, spoiler-conscious clean-up session from remaining trophies.
const KIND_MINUTES = Object.freeze({ story: 20, side: 18, activity: 15, collectible: 9, online: 18, misc: 12 });
const earned = (t, p) => p?.[t.id] === true || p?.[t.id]?.earned === true || p?.[t.id]?.completed === true;
const stageOf = t => t.stage || 'Unassigned';
const kindOf = t => t.kind || 'misc';
const label = v => String(v).replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const priority = t => t.missable ? 0 : (kindOf(t) === 'story' ? 1 : 2);

function buildGroups(trophies) {
  const map = new Map();
  for (const trophy of trophies) {
    const key = `${stageOf(trophy)}\u0000${kindOf(trophy)}`;
    if (!map.has(key)) map.set(key, { stage: stageOf(trophy), kind: kindOf(trophy), trophies: [] });
    map.get(key).trophies.push(trophy);
  }
  return [...map.values()].map(group => {
    group.trophies.sort((a, b) => priority(a) - priority(b) || String(a.name).localeCompare(String(b.name)));
    group.remaining = group.trophies.length;
    group.minutes = group.remaining * (KIND_MINUTES[group.kind] || KIND_MINUTES.misc);
    group.priority = Math.min(...group.trophies.map(priority));
    group.missables = group.trophies.filter(t => t.missable).length;
    return group;
  });
}

// Visit urgent groups first and prefer the already-selected stage for ties.
function routeGroups(groups) {
  const pending = [...groups], route = [];
  let stage = null;
  while (pending.length) {
    pending.sort((a, b) => a.priority - b.priority ||
      Number(b.stage === stage) - Number(a.stage === stage) ||
      a.stage.localeCompare(b.stage) || a.kind.localeCompare(b.kind));
    const next = pending.shift();
    route.push(next); stage = next.stage;
  }
  return route;
}

export function buildHuntSession(trophies = [], progress = {}) {
  const all = Array.isArray(trophies) ? trophies : [];
  const unearned = all.filter(t => !earned(t, progress));
  const grouped = routeGroups(buildGroups(unearned));
  const byKind = Object.create(null);
  for (const group of grouped) {
    byKind[group.kind] ||= { kind: group.kind, remaining: 0, minutes: 0 };
    byKind[group.kind].remaining += group.remaining;
    byKind[group.kind].minutes += group.minutes;
  }
  return {
    groups: grouped.map((g, index) => ({ ...g, routeOrder: index + 1, percent: 0 })),
    byKind: Object.values(byKind).sort((a, b) => a.kind.localeCompare(b.kind)),
    remaining: unearned.length, completed: all.length - unearned.length, total: all.length,
    minutes: grouped.reduce((sum, g) => sum + g.minutes, 0),
    stageChanges: grouped.slice(1).reduce((n, g, i) => n + (g.stage !== grouped[i].stage ? 1 : 0), 0),
    route: [...new Set(grouped.map(g => g.stage))], generatedAt: new Date().toISOString()
  };
}

function appendText(parent, tag, text, className) {
  const node = document.createElement(tag); node.textContent = text;
  if (className) node.className = className;
  parent.append(node); return node;
}
function exportText(session) {
  const rows = ['LEONIDA CLEAN-UP SESSION', `${session.remaining} remaining / ${session.total} total`,
    `Estimated time: ${session.minutes} min`, `Stage changes: ${session.stageChanges}`, '', 'ROUTE'];
  session.groups.forEach(group => {
    rows.push(`${group.routeOrder}. ${label(group.stage)} — ${label(group.kind)} (${group.remaining}; ~${group.minutes} min)`);
    group.trophies.forEach(t => rows.push(`   - ${t.name}${t.missable ? ' [MISSABLE]' : ''}`));
  });
  return rows.join('\n');
}

export function renderHuntSession(root, session) {
  if (!root) return;
  root.replaceChildren(); root.className = 'hunt-session';
  appendText(root, 'h2', 'Next clean-up session');
  appendText(root, 'p', `${session.remaining} remaining · ${session.completed} complete · about ${session.minutes} min · ${session.stageChanges} stage changes`, 'hunt-summary');
  const controls = document.createElement('div'); controls.className = 'hunt-controls';
  const exportButton = document.createElement('button'); exportButton.type = 'button'; exportButton.textContent = 'Export this session as text';
  exportButton.addEventListener('click', async () => {
    const text = exportText(session);
    try { await navigator.clipboard.writeText(text); exportButton.textContent = 'Session copied'; }
    catch {
      const area = document.createElement('textarea'); area.value = text;
      area.setAttribute('aria-label', 'Session text'); controls.append(area); area.select();
      exportButton.textContent = 'Select and copy session text';
    }
  });
  controls.append(exportButton); root.append(controls);
  if (!session.groups.length) { appendText(root, 'p', 'All objectives earned — session complete.', 'hunt-complete'); return; }
  const route = document.createElement('p'); route.className = 'hunt-route';
  route.textContent = `Route: ${session.route.map(label).join(' → ') || 'No stages'}`; root.append(route);
  const kindSummary = document.createElement('div'); kindSummary.className = 'hunt-kind-summary';
  session.byKind.forEach(item => appendText(kindSummary, 'span', `${label(item.kind)}: ${item.remaining} · ~${item.minutes}m`)); root.append(kindSummary);
  const list = document.createElement('div'); list.className = 'hunt-groups';
  session.groups.forEach(group => {
    const card = document.createElement('article'); card.className = `hunt-group${group.priority === 0 ? ' is-urgent' : ''}`;
    appendText(card, 'h3', `${group.routeOrder}. ${label(group.stage)} · ${label(group.kind)}`);
    appendText(card, 'span', `${group.remaining} remaining · ~${group.minutes} min${group.missables ? ` · ${group.missables} missable` : ''}`, 'hunt-count');
    const bar = document.createElement('div'); bar.className = 'hunt-progress'; bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', `${label(group.stage)} ${label(group.kind)} progress`);
    bar.setAttribute('aria-valuemin', '0'); bar.setAttribute('aria-valuemax', String(group.remaining)); bar.setAttribute('aria-valuenow', '0');
    const fill = document.createElement('i'); fill.style.width = '0%'; bar.append(fill); card.append(bar);
    const names = document.createElement('ul');
    group.trophies.slice(0, 4).forEach(t => appendText(names, 'li', `${t.name}${t.missable ? ' — MISSABLE' : ''}`));
    if (group.remaining > 4) appendText(names, 'li', `+ ${group.remaining - 4} more`);
    card.append(names); list.append(card);
  });
  root.append(list);
}
