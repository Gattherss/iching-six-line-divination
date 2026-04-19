import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const srcHtml = join(root, 'wenshi-liuyao.html');
const outDir = join(root, 'dist');
const outHtml = join(outDir, 'wenshi-liuyao.html');

// Resolve version: prefer git tag, fall back to package.json + date + short hash
function getVersion() {
  // 1. Try latest git tag
  try {
    const tag = execSync('git describe --tags --exact-match', {
      cwd: root,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    if (tag.startsWith('v')) return tag;
    return 'v' + tag;
  } catch {}

  // 2. Fallback: package.json version + date + short hash
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const shortHash = execSync('git rev-parse --short HEAD', {
    cwd: root,
    encoding: 'utf8'
  }).trim();
  const date = new Date().toISOString().slice(0, 10);
  return `v${pkg.version} (${date} · ${shortHash})`;
}

mkdirSync(outDir, { recursive: true });

let html = readFileSync(srcHtml, 'utf8');
const version = getVersion();

html = html.replace(
  /version:\s*'[^']*'/,
  `version: '${version}'`
);
// Also clean up any leftover commit field
html = html.replace(/^\s*commit:\s*'[^']*'\s*$/m, '');

writeFileSync(outHtml, html);
console.log(`Built ${outHtml} with version ${version}`);
