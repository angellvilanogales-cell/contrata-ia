#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

let changed = 0;
for (const file of walk('src').filter(f => /\.tsx?$/.test(f))) {
  const before = fs.readFileSync(file, 'utf8');
  const trimmed = before.trim();
  if (!trimmed.startsWith('```')) continue;
  const lines = before.split(/\r?\n/);
  const first = lines.findIndex(line => line.trim().startsWith('```'));
  let last = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() === '```') { last = i; break; }
  }
  if (first < 0 || last <= first) continue;
  const outsideBefore = lines.slice(0, first).join('').trim();
  const outsideAfter = lines.slice(last + 1).join('').trim();
  if (outsideBefore || outsideAfter) continue;
  const after = lines.slice(first + 1, last).join('\n') + '\n';
  fs.writeFileSync(file, after);
  changed++;
  console.log(`stripped markdown fence: ${file}`);
}
console.log(`files changed: ${changed}`);
if (!changed) process.exitCode = 1;
