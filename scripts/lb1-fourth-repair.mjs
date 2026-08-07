#!/usr/bin/env node
import fs from 'node:fs';

function write(file, transform) {
  const before = fs.readFileSync(file, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`Expected change not produced: ${file}`);
  fs.writeFileSync(file, after);
  console.log(`repaired ${file}`);
}

write('src/domain/pcap/PCAPGeneratorEngine.ts', source => {
  let out = source.replace(/index\+\+\.toString\(\)/g, '(index++).toString()');
  out = out.replace(/\n\s*=+\s*\nARCHIVO\s*\n\s*PCAPGeneratorEngine\.ts\s*\n\s*BLOQUE\s*\n\s*\d+ de 12\s*\n\s*ESTADO\s*\n[\s\S]*?\nSIGUIENTE\s*\n[\s\S]*?\nRUTA\s*\n\s*src\/domain\/pcap\/PCAPGeneratorEngine\.ts\s*\n\s*=+\s*\n/g, '\n');
  return out;
});

write('src/domain/rules/RuleEvaluatorEngine.ts', source => source.trimEnd() + '\n\n}\n');

write('src/domain/validation/ValidationFramework.ts', source => source.replace(/\n}\s*\n}\s*$/, '\n}\n'));

write('src/infrastructure/ai/AIManager.ts', source => {
  const autoMarker = '/*===========================================================================\n=\n= AUTOINICIALIZACIÓN';
  const factoryMarker = 'export class AIManagerFactory';
  const auto = source.indexOf(autoMarker);
  const factory = source.indexOf(factoryMarker);
  if (auto < 0 || factory < 0 || factory <= auto) throw new Error('AIManager markers not found');
  const prefix = source.slice(0, auto);
  const close = prefix.lastIndexOf('}');
  if (close < 0) throw new Error('AIManager premature close not found');
  let out = source.slice(0, close) + source.slice(close + 1);
  const newFactory = out.indexOf(factoryMarker);
  out = out.slice(0, newFactory) + '}\n\n' + out.slice(newFactory);
  return out;
});
