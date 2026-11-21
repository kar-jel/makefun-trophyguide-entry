// Aggregate earned/unearned trophies into a readable, copyable field report.
const GRADES = ['platinum', 'gold', 'silver', 'bronze'];
const KINDS = ['story', 'side', 'activity', 'collectible', 'online', 'misc'];
const MINUTES = Object.freeze({ story: 20, side: 18, activity: 15, collectible: 9, online: 18, misc: 12 });
const earned = (t, p) => p?.[t.id] === true || p?.[t.id]?.earned === true || p?.[t.id]?.completed === true;
const stageName = t => t.stage || 'Unassigned';
const label = value => String(value || 'Unassigned').replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
function blankCounts(keys) { return Object.fromEntries(keys.map(key => [key, { total: 0, earned: 0, remaining: 0, percent: 0 }])); }
function computeChain(items) {
  const byStage = new Map();
  for (const trophy of items) { const key = stageName(trophy); if (!byStage.has(key)) byStage.set(key, []); byStage.get(key).push(trophy); }
  return [...byStage.entries()].map(([stage, trophies]) => ({ stage, trophies, remaining: trophies.length }))
    .sort((a, b) => b.remaining - a.remaining || a.stage.localeCompare(b.stage))[0] || { stage: 'None', trophies: [], remaining: 0 };
}
function makeText(report) {
  const lines = ['LEONIDA TROPHY PROGRESS REPORT', `${report.overall.earned}/${report.overall.total} earned (${report.overall.percent}%)`, `${report.overall.remaining} remaining · approximately ${report.minutes} minutes`, '', 'BY GRADE'];
  Object.entries(report.byGrade).forEach(([k, r]) => lines.push(`${label(k)}: ${r.earned}/${r.total} (${r.percent}%)`));
  lines.push('', 'BY KIND'); Object.entries(report.byKind).forEach(([k, r]) => lines.push(`${label(k)}: ${r.earned}/${r.total} (${r.percent}%)`));
  lines.push('', 'BY STAGE'); Object.entries(report.byStage).forEach(([k, r]) => lines.push(`${label(k)}: ${r.earned}/${r.total} (${r.percent}%)`));
  lines.push('', `Longest remaining chain: ${label(report.longestChain.stage)} (${report.longestChain.remaining})`); return lines.join('\n');
}
export function buildReport(trophies = [], progress = {}) {
  const all = Array.isArray(trophies) ? trophies : [], byGrade = blankCounts(GRADES), byKind = blankCounts(KINDS), byStage = {};
  const remainingItems = all.filter(t => !earned(t, progress));
  for (const trophy of all) {
    const done = earned(trophy, progress), grade = String(trophy.grade || 'bronze').toLowerCase();
    const kind = String(trophy.kind || 'misc').toLowerCase(), stage = stageName(trophy);
    for (const [map, key] of [[byGrade, grade], [byKind, kind]]) {
      map[key] ||= { total: 0, earned: 0, remaining: 0, percent: 0 }; map[key].total += 1; if (done) map[key].earned += 1;
    }
    byStage[stage] ||= { total: 0, earned: 0, remaining: 0, percent: 0 };
    byStage[stage].total += 1; if (done) byStage[stage].earned += 1;
  }
  for (const map of [byGrade, byKind, byStage]) for (const row of Object.values(map)) {
    row.remaining = row.total - row.earned; row.percent = row.total ? Math.round(row.earned / row.total * 100) : 0;
  }
  const total = all.length, complete = total - remainingItems.length;
  const report = {
    overall: { total, earned: complete, remaining: remainingItems.length, percent: total ? Math.round(complete / total * 100) : 0 },
    byGrade, byKind, byStage, longestChain: computeChain(remainingItems),
    minutes: remainingItems.reduce((sum, t) => sum + (MINUTES[String(t.kind || 'misc').toLowerCase()] || MINUTES.misc), 0),
    remaining: remainingItems
  };
  report.text = makeText(report); return report;
}
function el(tag, text, className) { const node = document.createElement(tag); node.textContent = text; if (className) node.className = className; return node; }
function barRow(labelText, row) {
  const wrapper = document.createElement('div'); wrapper.className = 'report-row';
  const header = document.createElement('div'); header.className = 'report-row-heading'; header.append(el('span', labelText), el('span', `${row.earned}/${row.total} · ${row.percent}%`));
  const track = document.createElement('div'); track.className = 'report-bar'; track.setAttribute('role', 'progressbar');
  track.setAttribute('aria-label', `${labelText} completion`); track.setAttribute('aria-valuemin', '0'); track.setAttribute('aria-valuemax', String(row.total)); track.setAttribute('aria-valuenow', String(row.earned));
  const fill = document.createElement('i'); fill.style.width = `${row.percent}%`; track.append(fill); wrapper.append(header, track); return wrapper;
}
export function renderReport(root, report) {
  if (!root) return;
  root.replaceChildren(); root.className = 'progress-report'; root.append(el('h2', 'Progress report'));
  root.append(el('p', `${report.overall.earned} / ${report.overall.total} earned · ${report.overall.percent}% complete · ${report.overall.remaining} remaining`, 'report-summary'));
  const groups = [['By grade', report.byGrade], ['By kind', report.byKind], ['By stage', report.byStage]], grid = document.createElement('div'); grid.className = 'report-grid';
  groups.forEach(([title, values]) => {
    const section = document.createElement('section'); section.className = 'report-section'; section.append(el('h3', title));
    Object.entries(values).sort(([a], [b]) => a.localeCompare(b)).forEach(([key, row]) => section.append(barRow(label(key), row))); grid.append(section);
  });
  root.append(grid); root.append(el('p', `Longest remaining chain: ${label(report.longestChain.stage)} · ${report.longestChain.remaining} trophies`, 'report-chain'));
  root.append(el('p', `Estimated remaining play time: about ${report.minutes} minutes`, 'report-time'));
  const copy = document.createElement('div'); copy.className = 'report-copy';
  const area = document.createElement('textarea'); area.readOnly = true; area.value = report.text; area.setAttribute('aria-label', 'Plain-text progress report');
  const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Copy plain-text report';
  button.addEventListener('click', async () => { try { await navigator.clipboard.writeText(report.text); button.textContent = 'Report copied'; } catch { area.focus(); area.select(); button.textContent = 'Select and copy report text'; } });
  copy.append(button, area); root.append(copy);
}
