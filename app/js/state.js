const KEY='leonida-trophy-progress-v1';
export function loadProgress(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
export function saveProgress(progress){localStorage.setItem(KEY,JSON.stringify(progress))}
export function exportProgress(progress){const blob=new Blob([JSON.stringify({format:'leonida-field-guide-progress-v1',progress},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='leonida-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
export async function importProgress(file){const parsed=JSON.parse(await file.text());const value=parsed.progress??parsed;if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Progress file must contain a progress object');return value}
