#!/usr/bin/env node
import fs from 'node:fs';

function writeIfChanged(file, transform) {
  const before = fs.readFileSync(file, 'utf8');
  const after = transform(before);
  if (after === before) {
    console.log(`${file}: no change`);
    return;
  }
  fs.writeFileSync(file, after);
  console.log(`${file}: repaired`);
}

writeIfChanged('src/domain/cpv/CPVEngine.ts', source => {
  const trimmed = source.trimEnd();
  if (trimmed.endsWith('}')) return source;
  return trimmed + '\n\n}\n';
});

for (const file of [
  'src/domain/diagnostics/DiagnosticsCenter.ts',
  'src/domain/events/EventBus.ts'
]) {
  writeIfChanged(file, source => source.replace(/\n}\s*\n\s*}\s*$/, '\n}\n'));
}

writeIfChanged('src/domain/knowledge/catalogs/CoreKnowledgeConcepts.ts', source => {
  const marker = /\n\s*}\s*\n\s*];\s*\n\s*(\/\*\*[\s\S]*?CONCEPT-0006)/;
  const match = source.match(marker);
  if (!match) return source;
  return source.replace(marker, '\n    },\n\n    $1');
});
