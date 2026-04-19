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
function safeExec(cmd) {
  try {
    return execSync(cmd, { cwd: root, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return null;
  }
}

function getVersion() {
  // 1. Try latest git tag
  const tag = safeExec('git describe --tags --exact-match');
  if (tag) return tag.startsWith('v') ? tag : 'v' + tag;

  // 2. Fallback: package.json version + optional date/hash
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const shortHash = safeExec('git rev-parse --short HEAD');
  const date = new Date().toISOString().slice(0, 10);
  const parts = [`v${pkg.version}`];
  if (date) parts.push(date);
  if (shortHash) parts.push(shortHash);
  return parts.join(' · ');
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
