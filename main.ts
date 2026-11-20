// Package the static trophy guide and its judge dossier.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repository = fileURLToPath(new URL('.', import.meta.url));
const application = join(repository, 'app');
const destination = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function verifyInputs() {
  for (const file of [join(application, 'index.html'), join(application, 'data', 'trophies.json')]) {
    if (!existsSync(file)) throw new Error(`Required app file is missing: ${file}`);
  }
}

function formatBytes(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

verifyInputs();

mkdirSync(destination, { recursive: true });
cpSync(application, join(destination, 'app'), { recursive: true });
cpSync(join(repository, 'screenshots'), join(destination, 'screenshots'), { recursive: true });
const limits = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};
writeFileSync(join(destination, 'dossier.json'), buildDossier(destination, limits));
const appBytes = JSON.stringify(limits).length;
console.log(`Packaged app, screenshots, and dossier in ${destination} (limits: ${formatBytes(appBytes)}).`);
