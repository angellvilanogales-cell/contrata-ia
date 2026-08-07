#!/usr/bin/env node
/**
 * Lightweight check-imports script.
 * Scans src/**/*.ts for import statements with relative paths and checks target exists (with .ts, .tsx, .js, .json or index variants).
 * Exits with 0 if all resolved, otherwise prints missing imports and exits 1.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function resolvePossibleExtensions(base) {
  const exts = ['.ts', '.tsx', '.js', '.jsx', '.json'];
  const candidates = exts.map(e => base + e);
  candidates.push(path.join(base, 'index.ts'));
  candidates.push(path.join(base, 'index.js'));
  return candidates;
}

function fileExistsOneOf(base) {
  const candidates = resolvePossibleExtensions(base);
  return candidates.some(c => fs.existsSync(c));
}

async function main() {
  const files = glob.sync('src/**/*.ts', { nodir: true });
  let missing = [];
  const importRegex = /import\s+(?:[^'";]+)from\s+['"](.+?)['"]/g;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const imp = match[1];
      if (imp.startsWith('.') ) {
        const resolved = path.resolve(path.dirname(file), imp);
        if (!fileExistsOneOf(resolved)) {
          missing.push({ from: file, import: imp, resolved });
        }
      }
    }
  }

  if (missing.length > 0) {
    console.error('check-imports: missing import targets:');
    for (const m of missing) {
      console.error(` - ${m.from} -> ${m.import} (tried: ${m.resolved}{.ts,.tsx,.js,.json, /index.ts})`);
    }
    process.exit(1);
  }

  console.log('check-imports: all relative imports resolved (basic check).');
}

main();
