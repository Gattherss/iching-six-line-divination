import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const srcHtml = join(root, 'wenshi-liuyao.html');
const versionFile = join(root, 'VERSION');
const outDir = join(root, 'dist');
const outHtml = join(outDir, 'wenshi-liuyao.html');

// Read version from VERSION file (written by bump-version script)
function getVersion() {
  try {
    return readFileSync(versionFile, 'utf8').trim();
  } catch {
    return 'v0.0.0';
  }
}

mkdirSync(outDir, { recursive: true });

let html = readFileSync(srcHtml, 'utf8');
const version = getVersion();

html = html.replace(
  /version:\s*'[^']*'/,
  `version: '${version}'`
);

writeFileSync(outHtml, html);
console.log(`Built ${outHtml} with version ${version}`);
