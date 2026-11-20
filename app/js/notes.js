// Private per-trophy notes and timestamped note activity, separate from progress.
const NOTES_KEY = 'leonida-trophy-notes-v1';
function clean(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
export function readNotes() {
  try {
    return clean(JSON.parse(localStorage.getItem(NOTES_KEY) || '{}'));
  } catch {
    return {};
  }
}
export function writeNote(id, text) {
  const notes = readNotes();
  const updated = { ...notes, [id]: { text: String(text), updatedAt: new Date().toISOString() } };
  localStorage.setItem(NOTES_KEY, JSON.stringify(updated));
  return updated[id];
}
export function listNotes() {
  return Object.entries(readNotes())
    .filter(([, note]) => note && typeof note.text === 'string' && note.text.trim())
    .map(([id, note]) => ({ id, ...note }))
    .sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)));
}
export function renderNotes(container, trophies, onJump) {
  const notes = readNotes();
  const root = document.createDocumentFragment();
  const recent = document.createElement('section');
  recent.className = 'recent-notes';
  const heading = document.createElement('h3');
  heading.textContent = 'Recently noted';
  recent.append(heading);
  const records = listNotes();
  if (!records.length) {
    const empty = document.createElement('p');
    empty.textContent = 'No notes saved yet.';
    recent.append(empty);
  }
  records.slice(0, 8).forEach(note => {
    const trophy = trophies.find(item => String(item.id) === String(note.id));
    if (!trophy) return;
    const jump = document.createElement('button');
    jump.type = 'button';
    jump.className = 'note-jump';
    jump.textContent = `${trophy.name} · ${note.text.trim().slice(0, 90)}`;
    jump.addEventListener('click', () => onJump(trophy));
    recent.append(jump);
  });
  root.append(recent);
  trophies.forEach(trophy => {
    const card = document.createElement('article');
    card.className = 'note-card';
    const label = document.createElement('label');
    label.htmlFor = `note-${trophy.id}`;
    label.textContent = trophy.name;
    const area = document.createElement('textarea');
    area.id = `note-${trophy.id}`;
    area.rows = 3;
    area.placeholder = 'Personal route notes…';
    area.value = typeof notes[trophy.id] === 'string' ? notes[trophy.id] : notes[trophy.id]?.text ?? '';
    area.addEventListener('change', () => writeNote(trophy.id, area.value));
    card.append(label, area);
    root.append(card);
  });
  container.replaceChildren(root);
}
