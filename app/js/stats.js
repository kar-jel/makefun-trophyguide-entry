// Progress summaries for stages, kinds, grades, and the next objective.
const STAGE_ORDER = ['Prologue', 'Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Epilogue', 'Cleanup: collectibles', 'Cleanup: activities', 'Platinum'];
const GRADES = ['platinum', 'gold', 'silver', 'bronze'];
const earned = (progress, trophy) => Boolean(progress?.[trophy.id]);
export function stageBreakdown(trophies, progress) {
  return STAGE_ORDER.map(stage => {
    const entries = trophies.filter(trophy => trophy.stage === stage);
    return { stage, total: entries.length, earned: entries.filter(trophy => earned(progress, trophy)).length };
  }).filter(item => item.total > 0);
}
export function kindBreakdown(trophies, progress = {}) {
  return [...new Set(trophies.map(trophy => trophy.kind))].map(kind => {
    const entries = trophies.filter(trophy => trophy.kind === kind);
    return { kind, total: entries.length, earned: entries.filter(trophy => earned(progress, trophy)).length };
  });
}
export function gradeBreakdown(trophies, progress = {}) {
  return GRADES.map(grade => {
    const entries = trophies.filter(trophy => trophy.grade === grade);
    return { grade, total: entries.length, earned: entries.filter(trophy => earned(progress, trophy)).length };
  });
}
export function completionPercent(trophies, progress = {}) {
  return trophies.length ? Math.round(trophies.filter(trophy => earned(progress, trophy)).length / trophies.length * 100) : 0;
}
export function nextUp(trophies, progress = {}) {
  return [...trophies].sort((left, right) => {
    const a = STAGE_ORDER.indexOf(left.stage);
    const b = STAGE_ORDER.indexOf(right.stage);
    return (a < 0 ? STAGE_ORDER.length : a) - (b < 0 ? STAGE_ORDER.length : b) || left.id - right.id;
  }).find(trophy => trophy.grade !== 'platinum' && !earned(progress, trophy)) ?? null;
}
function barRow(label, earnedCount, total, className = '') {
  const row = document.createElement('div');
  row.className = 'stat-row';
  const heading = document.createElement('div');
  heading.className = 'stat-label';
  heading.textContent = `${label} ${earnedCount} / ${total}`;
  const track = document.createElement('div');
  track.className = 'stat-track';
  const fill = document.createElement('i');
  fill.className = className;
  fill.style.width = `${total ? earnedCount / total * 100 : 0}%`;
  track.append(fill);
  row.append(heading, track);
  return row;
}
export function renderStats(container, trophies, progress) {
  container.replaceChildren();
  const groups = [
    ['Stages', stageBreakdown(trophies, progress)],
    ['Kinds', kindBreakdown(trophies, progress)],
    ['Grades', gradeBreakdown(trophies, progress)]
  ];
  const next = nextUp(trophies, progress);
  const summary = document.createElement('p');
  summary.className = 'stats-summary';
  summary.textContent = `${completionPercent(trophies, progress)}% complete${next ? ` · Next: ${next.name}` : ' · No remaining non-platinum trophies'}`;
  container.append(summary);
  for (const [title, entries] of groups) {
    const section = document.createElement('section');
    section.className = 'stats-group';
    const heading = document.createElement('h3');
    heading.textContent = title;
    section.append(heading);
    entries.forEach(entry => section.append(barRow(entry.stage ?? entry.kind ?? entry.grade, entry.earned, entry.total, entry.grade ?? '')));
    container.append(section);
  }
}
