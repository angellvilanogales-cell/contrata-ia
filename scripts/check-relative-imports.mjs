#!/usr/bin/env node
// scripts/check-relative-imports.mjs
import fs from 'fs';
import path from 'path';

const root = path.resolve(process.cwd(), 'src');
const out = path.resolve(process.cwd(), 'docs', 'audit', 'IMPORTS_DETECTED.csv');

function walk(dir){
  const res = [];
  for(const e of fs.readdirSync(dir, {withFileTypes:true})){
    const p = path.join(dir,e.name);
    if(e.isDirectory()) res.push(...walk(p));
    else if(e.isFile() && p.endsWith('.ts')) res.push(p);
  }
  return res;
}

const files = fs.existsSync(root) ? walk(root) : [];
const importRegex = /from\s+['\"](\.\.?(?:\/[^'\"]*)*)['\"]/g;
const rows = [];
for(const f of files){
  const content = fs.readFileSync(f,'utf8');
  let m;
  while((m = importRegex.exec(content))){
    rows.push(`${path.relative(process.cwd(), f)};${m.index};${m[1]}`);
  }
}
fs.mkdirSync(path.dirname(out), {recursive:true});
fs.writeFileSync(out, 'ruta;pos;import\n' + rows.join('\n'));
console.log('Wrote', out);
