#!/usr/bin/env node
import fs from 'node:fs';

const targets = [
  ['src/domain/cpv/CPVEngine.ts', 'CPVEngine'],
  ['src/domain/diagnostics/DiagnosticsCenter.ts', 'DiagnosticsCenter'],
  ['src/domain/events/EventBus.ts', 'EventBus'],
  ['src/domain/legal/LegalReasoner.ts', 'LegalReasoner'],
  ['src/domain/legal/LegalReferenceEngine.ts', 'LegalReferenceEngine'],
  ['src/domain/pcap/PCAPGeneratorEngine.ts', 'PCAPGeneratorEngine'],
  ['src/domain/plugins/PluginManager.ts', 'PluginManager'],
  ['src/domain/rules/RuleEngine.ts', 'RuleEngine'],
  ['src/domain/rules/RuleEvaluatorEngine.ts', 'RuleEvaluatorEngine'],
  ['src/domain/rules/solvency/ClassificationRule.ts', 'ClassificationRule'],
  ['src/domain/validation/ValidationFramework.ts', 'ValidationFramework'],
  ['src/domain/knowledge/catalogs/CoreKnowledgeConcepts.ts', 'CoreKnowledgeConcepts'],
  ['src/infrastructure/ai/AIManager.ts', 'AIManager'],
  ['src/domain/resolvers/AwardCriteriaResolver.ts', 'AwardCriteriaResolver'],
  ['src/domain/document/DocumentGenerator.ts', 'DocumentGenerator'],
];

function maskNonCode(source) {
  let out = '';
  let i = 0;
  let mode = 'code';
  let quote = '';
  while (i < source.length) {
    const c = source[i], n = source[i + 1];
    if (mode === 'code') {
      if (c === '/' && n === '/') { mode = 'line'; out += '  '; i += 2; continue; }
      if (c === '/' && n === '*') { mode = 'block'; out += '  '; i += 2; continue; }
      if (c === '"' || c === "'" || c === '`') { mode = 'string'; quote = c; out += ' '; i++; continue; }
      out += c; i++; continue;
    }
    if (mode === 'line') {
      if (c === '\n') { mode = 'code'; out += '\n'; } else out += ' ';
      i++; continue;
    }
    if (mode === 'block') {
      if (c === '*' && n === '/') { out += '  '; i += 2; mode = 'code'; } else { out += c === '\n' ? '\n' : ' '; i++; }
      continue;
    }
    if (mode === 'string') {
      if (c === '\\') { out += '  '; i += 2; continue; }
      if (c === quote) { out += ' '; i++; mode = 'code'; quote = ''; continue; }
      out += c === '\n' ? '\n' : ' '; i++; continue;
    }
  }
  return out;
}

function matchBrace(masked, open) {
  let depth = 0;
  for (let i = open; i < masked.length; i++) {
    if (masked[i] === '{') depth++;
    else if (masked[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function extractNestedDeclarations(source, className) {
  let masked = maskNonCode(source);
  const classRe = new RegExp(`export\\s+class\\s+${className}\\b`);
  const cm = classRe.exec(masked);
  if (!cm) return { source, changed: false, moved: 0 };
  const classOpen = masked.indexOf('{', cm.index);
  if (classOpen < 0) return { source, changed: false, moved: 0 };
  let classClose = matchBrace(masked, classOpen);
  if (classClose < 0) classClose = source.length;

  const declRe = /export\s+(interface|enum|type)\s+[A-Za-z_$][\w$]*/g;
  const ranges = [];
  let m;
  while ((m = declRe.exec(masked))) {
    if (m.index <= classOpen || m.index >= classClose) continue;
    const kind = m[1];
    let end;
    if (kind === 'type') {
      end = masked.indexOf(';', m.index);
      if (end < 0 || end > classClose) continue;
      end += 1;
    } else {
      const open = masked.indexOf('{', m.index);
      if (open < 0 || open > classClose) continue;
      const close = matchBrace(masked, open);
      if (close < 0 || close > classClose) continue;
      end = close + 1;
    }
    while (end < source.length && /[ \t\r\n]/.test(source[end])) end++;
    ranges.push([m.index, end]);
    declRe.lastIndex = end;
  }

  if (!ranges.length) return { source, changed: false, moved: 0 };
  const declarations = ranges.map(([s,e]) => source.slice(s,e).trim()).join('\n\n');
  let body = source;
  for (const [s,e] of ranges.slice().reverse()) body = body.slice(0,s) + body.slice(e);
  const insertAt = classRe.exec(maskNonCode(body))?.index ?? cm.index;
  body = body.slice(0, insertAt) + declarations + '\n\n' + body.slice(insertAt);
  return { source: body, changed: true, moved: ranges.length };
}

function recoverPrematureClose(source, className) {
  const masked = maskNonCode(source);
  const classRe = new RegExp(`export\\s+class\\s+${className}\\b`);
  const cm = classRe.exec(masked);
  if (!cm) return { source, changed: false };
  const open = masked.indexOf('{', cm.index);
  if (open < 0) return { source, changed: false };
  const close = matchBrace(masked, open);
  if (close < 0) return { source, changed: false };
  const after = masked.slice(close + 1);
  const outsideMethod = /(^|\n)\s*(public|private|protected)\s+(?:static\s+)?(?:readonly\s+)?[A-Za-z_$]/m.test(after);
  if (!outsideMethod) return { source, changed: false };

  const exportTail = source.slice(close + 1).search(/(^|\n)\s*export\s+(default|\{)/m);
  const insertion = exportTail >= 0 ? close + 1 + exportTail : source.length;
  const without = source.slice(0, close) + source.slice(close + 1);
  const adjustedInsertion = insertion > close ? insertion - 1 : insertion;
  const result = without.slice(0, adjustedInsertion) + '\n}\n' + without.slice(adjustedInsertion);
  return { source: result, changed: true };
}

let changedFiles = 0;
for (const [file, className] of targets) {
  if (!fs.existsSync(file)) continue;
  let source = fs.readFileSync(file, 'utf8');
  const first = extractNestedDeclarations(source, className);
  source = first.source;
  const second = recoverPrematureClose(source, className);
  source = second.source;
  if (first.changed || second.changed) {
    fs.writeFileSync(file, source);
    changedFiles++;
    console.log(`${file}: moved=${first.moved}, prematureClose=${second.changed}`);
  }
}
console.log(`Changed files: ${changedFiles}`);
