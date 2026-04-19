import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const pkgPath = join(root, 'package.json');
const versionPath = join(root, 'VERSION');

const bumpType = process.argv[2] || 'patch';
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

const parts = (pkg.version || '1.0.0').split('.').map(Number);
const [major, minor, patch] = parts;

switch (bumpType) {
  case 'major':
    pkg.version = `${major + 1}.0.0`;
    break;
  case 'minor':
    pkg.version = `${major}.${minor + 1}.0`;
    break;
  default:
    pkg.version = `${major}.${minor}.${patch + 1}`;
}

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

const tagName = `v${pkg.version}`;
writeFileSync(versionPath, tagName + '\n');

execSync(`git add ${pkgPath} ${versionPath}`, { cwd: root });
execSync(`git commit -m "chore: bump version to ${tagName}"`, { cwd: root });
execSync(`git tag ${tagName}`, { cwd: root });

console.log(`Bumped to ${tagName} — push with: git push && git push --tags`);
