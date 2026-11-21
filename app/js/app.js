// Application entry point: state, rendering, tabs, and user actions.
import { loadTrophies, countsByGrade } from './data.js';
import { readProgress, writeProgress, toggle, earnedCount, resetProgress, isEarned } from './progress.js';
import { exportProgress, importProgress } from './transfer.js';
import { applyFilters, KINDS } from './filters.js';
import { spoilersHidden, setSpoilers } from './spoiler.js';
import { renderList } from './list.js';
import { renderDetail } from './detail.js';
import { renderRoadmap, renderMissables } from './roadmap.js';
import { el, on, toast, confirmDialog } from './ui.js';
import { renderStats } from './stats.js';
import { buildIndex, search as searchTrophies, renderSearch } from './search.js';
import { renderNotes } from './notes.js';
import { buildHuntSession, renderHuntSession } from './hunt.js';
import { createTimer } from './timer.js';
import { installShortcuts, renderShortcutHelp } from './shortcuts.js';
import { buildReport, renderReport } from './report.js';
import { createFilterBar } from './filterbar.js';
const $ = selector => document.querySelector(selector);
let trophies = [], searchIndex = [], progress = readProgress(), selected = null;
let kind = 'all', query = '', hideEarned = false;
let filterBar;
function setSelected(trophy) { selected = trophy.id; render(); }
function saveToggle(trophy, earned) { progress = toggle(progress, trophy.id, earned); writeProgress(progress); render(); }
function renderHeader() {
  const count = earnedCount(trophies, progress), percent = trophies.length ? Math.round(count / trophies.length * 100) : 0;
  $('#earnedTotal').textContent = `${count} / ${trophies.length}`; $('#percent').textContent = `${percent}%`; $('#progressBar').style.width = `${percent}%`;
  $('#gradeCounts').replaceChildren(...countsByGrade(trophies, progress).map(item => el('div', { className: 'grade-card' }, [el('span', { className: item.grade }, item.grade.toUpperCase()), el('b', { className: item.grade }, `${item.earned} / ${item.total}`)])));
}
function render() {
  renderHeader(); renderStats($('#statsStrip'), trophies, progress);
  renderSearch($('#searchResults'), searchTrophies(query, searchIndex), setSelected);
  const visible = applyFilters(trophies, { ...(filterBar?.getFilters() || {}), kind, query, hideEarned, progress });
  $('#resultCount').textContent = `${visible.length} RECORDS`;
  renderList($('#trophyList'), visible, trophies, progress, selected, setSelected, saveToggle);
  renderDetail($('#detailPanel'), trophies.find(t => t.id === selected), progress, saveToggle);
  renderRoadmap($('#roadmap'), trophies, progress, saveToggle, setSelected);
  renderMissables($('#missables'), trophies, progress, saveToggle, setSelected);
  renderHuntSession($('#huntSession'), buildHuntSession(trophies, progress));
  renderReport($('#reportPanel'), buildReport(trophies, progress));
}
function setView(view) {
  if (view === 'notes') renderNotes($('#notes'), trophies, setSelected);
  document.querySelectorAll('.tab').forEach(button => { const active = button.dataset.view === view; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); });
  document.querySelectorAll('.view').forEach(panel => panel.classList.toggle('active', panel.id === `${view}View`));
}
function renderFilters() {
  $('#filters').replaceChildren(...KINDS.filter(value => value !== 'online' || trophies.some(t => t.kind === 'online')).map(value => el('button', { className: `filter ${value === kind ? 'active' : ''}`, 'data-kind': value }, value === 'all' ? 'All files' : value[0].toUpperCase() + value.slice(1))));
}
async function handleImport(file) {
  try { const incoming = await importProgress(file); const replace = await confirmDialog('Replace saved progress? Choose Cancel to merge the imported completions.'); progress = replace ? incoming : { ...progress, ...incoming }; writeProgress(progress); render(); toast('Progress imported.'); }
  catch (error) { toast(`Import failed: ${error.message}`); }
}
async function start() {
  try {
    trophies = await loadTrophies();
    filterBar = createFilterBar($('#filterBar'), { trophies, progress }, () => render());
    selected = trophies.find(t => t.kind === 'story' && !isEarned(progress, t))?.id ?? trophies.find(t => t.grade !== 'platinum' && !isEarned(progress, t))?.id ?? null;
    searchIndex = buildIndex(trophies); renderFilters(); $('#spoilerToggle').checked = spoilersHidden();
    $('#hideEarned').addEventListener('change', event => { hideEarned = event.target.checked; render(); });
    $('#spoilerToggle').addEventListener('change', event => { setSpoilers(event.target.checked); render(); });
    $('#search').addEventListener('input', event => { query = event.target.value; render(); $('#searchResults').hidden = !query.trim(); }); $('#searchResults').hidden = true;
    on($('#filters'), 'click', '[data-kind]', (_event, button) => { kind = button.dataset.kind; renderFilters(); render(); });
    on($('.tabs'), 'click', '[data-view]', (_event, button) => setView(button.dataset.view));
    $('#exportBtn').addEventListener('click', () => exportProgress(progress)); $('#importBtn').addEventListener('click', () => $('#importFile').click());
    $('#importFile').addEventListener('change', event => { if (event.target.files[0]) handleImport(event.target.files[0]); event.target.value = ''; });
    $('#resetBtn').addEventListener('click', async () => { if (await confirmDialog('Erase every saved trophy completion on this device?')) { progress = resetProgress(); render(); toast('Progress reset.'); } });
    const timer = createTimer($('#huntTimer'), { seconds: 25 * 60, onDone: () => toast('Hunt timer complete.') });
    renderShortcutHelp($('#shortcutHelp'));
    installShortcuts({
      search: () => $('#search').focus(),
      hideEarned: () => { const input = $('#hideEarned'); input.checked = !input.checked; hideEarned = input.checked; render(); },
      spoilers: () => { const input = $('#spoilerToggle'); input.checked = !input.checked; setSpoilers(input.checked); render(); },
      notes: () => setView('notes'), roadmap: () => setView('roadmap'),
      timer: () => $('#huntTimer').classList.contains('timer-running') ? timer.pause() : timer.start(),
      resetView: () => { query = ''; kind = 'all'; selected = null; hideEarned = false; $('#search').value = ''; $('#hideEarned').checked = false; renderFilters(); render(); },
      help: () => $('#shortcutHelp').open()
    });
    render();
  } catch (error) { $('#trophyList').textContent = `Unable to start: ${error.message}`; }
}
start();
