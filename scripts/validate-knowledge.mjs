#!/usr/bin/env node
// scripts/validate-knowledge.mjs
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const knowledgeDir = path.resolve(process.cwd(), 'knowledge');
const out = path.resolve(process.cwd(), 'docs', 'audit', 'KNOWLEDGE_VALIDATION_REPORT.md');
let report = [];

function walk(dir){
  if(!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => {
    const p = path.join(dir, entry.name);
    if(entry.isDirectory()) return walk(p);
    if(entry.isFile() && (p.endsWith('.yaml')||p.endsWith('.yml')||p.endsWith('.json'))) return [p];
    return [];
  });
}

for(const file of walk(knowledgeDir)){
  try{
    const content = fs.readFileSync(file,'utf8');
    if(file.endsWith('.json')) JSON.parse(content);
    else yaml.load(content);
    report.push(`OK: ${path.relative(process.cwd(), file)}`);
  }catch(e){
    report.push(`ERROR: ${path.relative(process.cwd(), file)} -> ${e.message}`);
  }
}
fs.mkdirSync(path.dirname(out), {recursive:true});
fs.writeFileSync(out, report.join('\n'));
console.log('Validation complete. Report written to', out);
