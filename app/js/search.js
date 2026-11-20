// Search trophy records and render safe highlighted result fragments.
function words(text) {
  return String(text ?? '').toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}
export function buildIndex(trophies) {
  return trophies.map(trophy => ({
    trophy,
    name: words(trophy.name),
    description: words(trophy.description),
    guide: words(trophy.guide)
  }));
}
export function search(query, index) {
  const terms = words(query);
  if (!terms.length) return [];
  const hits = [];
  for (const entry of index) {
    const fields = [entry.name, entry.description, entry.guide];
    const matched = fields.map(field => terms.every(term => field.some(word => word.startsWith(term))));
    const tier = matched[0] ? 0 : matched[1] ? 1 : matched[2] ? 2 : -1;
    if (tier >= 0) hits.push({ ...entry, score: tier });
  }
  return hits.sort((left, right) => left.score - right.score || left.trophy.id - right.trophy.id);
}
export function highlight(text, query) {
  const fragment = document.createDocumentFragment();
  const terms = words(query);
  const expression = /[\p{L}\p{N}]+/gu;
  let cursor = 0;
  for (const match of String(text ?? '').matchAll(expression)) {
    const token = match[0];
    const start = match.index;
    fragment.append(document.createTextNode(String(text).slice(cursor, start)));
    if (terms.some(term => token.toLocaleLowerCase().startsWith(term))) {
      const mark = document.createElement('mark');
      mark.textContent = token;
      fragment.append(mark);
    } else {
      fragment.append(document.createTextNode(token));
    }
    cursor = start + token.length;
  }
  fragment.append(document.createTextNode(String(text ?? '').slice(cursor)));
  return fragment;
}
export function renderSearch(container, results, onSelect) {
  container.replaceChildren();
  results.forEach(result => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'search-result';
    button.textContent = result.trophy.name;
    button.addEventListener('click', () => onSelect(result.trophy));
    container.append(button);
  });
}
