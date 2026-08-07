#!/usr/bin/env node
/**
 * Simple knowledge validator.
 * Scans knowledge/ for .yaml/.yml/.json and attempts to parse them using js-yaml.
 * Exits with code 0 if all parse ok, otherwise prints diagnostics and exits 1.
 */

const fs = require('fs');
const path = require('path');

function fail(msg) {
  console.error(msg);
  process.exitCode = 1;
}

async function main() {
  let jsYaml;
  try {
    jsYaml = require('js-yaml');
  } catch (e) {
    console.error('Missing dependency "js-yaml". Run: npm ci');
    process.exit(2);
  }

  const glob = require('glob');
  const patterns = ['knowledge/**/*.yaml', 'knowledge/**/*.yml', 'knowledge/**/*.json'];
  const files = patterns.flatMap(p => glob.sync(p, { nodir: true }));
  if (files.length === 0) {
    console.log('No knowledge files found under knowledge/.');
    return;
  }

  let errors = 0;
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (file.endsWith('.json')) {
        JSON.parse(content);
      } else {
        jsYaml.loadAll(content);
      }
    } catch (err) {
      errors++;
      console.error(`\nERROR parsing ${file}:\n  ${err.message}`);
    }
  }

  if (errors > 0) {
    console.error(`\nvalidate-knowledge: ${errors} file(s) with syntax errors.`);
    process.exit(1);
  }

  console.log('validate-knowledge: all knowledge files parsed successfully.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
