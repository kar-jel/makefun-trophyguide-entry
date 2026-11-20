// Package the static trophy guide and its judge dossier.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repository = fileURLToPath(new URL('.', import.meta.url));
const application = join(repository, 'app');
const requiredFiles = [join(application, 'index.html'), join(application, 'data', 'trophies.json')];
for (const file of requiredFiles) {
  if (!existsSync(file)) throw new Error(`Required app file is missing: ${file}`);
}
const destination = process.env.MAKEFUN_OUTPUT_DIR || '/output';
mkdirSync(destination, { recursive: true });
cpSync(application, join(destination, 'app'), { recursive: true });
const sourceShots = join(repository, 'screenshots');
const deliveredShots = join(destination, 'screenshots');
mkdirSync(deliveredShots, { recursive: true });
if (existsSync(sourceShots)) cpSync(sourceShots, deliveredShots, { recursive: true });
const caps = { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 };
writeFileSync(join(destination, 'dossier.json'), buildDossier(destination, caps));
console.log(`Packaged app, screenshots, and dossier in ${destination}.`);
