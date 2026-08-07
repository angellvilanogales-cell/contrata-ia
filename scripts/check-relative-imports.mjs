#!/usr/bin/env node

/**
 * Contrata-IA — auditoría de imports relativos del runtime.
 *
 * El runtime canónico está en src/. El directorio knowledge/ es conocimiento
 * declarativo (YAML/JSON) y se valida con los auditores de conocimiento.
 * Los antiguos .ts de knowledge/ no forman parte del runtime compilable.
 *
 * Uso:
 *   npm run audit:imports
 *   node scripts/check-relative-imports.mjs src knowledge
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..");
const DEFAULT_ROOTS = ["src"];
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".mts", ".cts"]);
const RESOLUTION_EXTENSIONS = ["", ".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"];
const INDEX_FILES = ["index.ts", "index.tsx", "index.mts", "index.cts", "index.js", "index.jsx", "index.mjs", "index.cjs"];
const IMPORT_PATTERNS = [
  /\bimport\s+(?:type\s+)?[\s\S]*?\sfrom\s*["']([^"']+)["']/g,
  /\bimport\s*["']([^"']+)["']/g,
  /\bexport\s+(?:type\s+)?[\s\S]*?\sfrom\s*["']([^"']+)["']/g,
  /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g
];

function normalizePath(value) { return value.split(path.sep).join("/"); }
function isRelativeSpecifier(specifier) { return specifier === "." || specifier === ".." || specifier.startsWith("./") || specifier.startsWith("../"); }
function isSourceFile(filePath) { return SOURCE_EXTENSIONS.has(path.extname(filePath)); }

function walkDirectory(directory) {
  if (!fs.existsSync(directory)) return [];
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (["node_modules", "dist", "dist-test", ".git"].includes(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...walkDirectory(fullPath));
    else if (entry.isFile() && isSourceFile(fullPath)) result.push(fullPath);
  }
  return result;
}

function removeJsLikeExtension(specifier) {
  const extension = path.extname(specifier);
  return [".js", ".jsx", ".mjs", ".cjs"].includes(extension)
    ? specifier.slice(0, -extension.length)
    : specifier;
}

function resolveRelativeImport(importerFile, specifier) {
  const basePath = path.resolve(path.dirname(importerFile), specifier);
  const normalizedBasePath = removeJsLikeExtension(basePath);
  for (const extension of RESOLUTION_EXTENSIONS) {
    const candidate = `${normalizedBasePath}${extension}`;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  for (const indexFile of INDEX_FILES) {
    const candidate = path.join(normalizedBasePath, indexFile);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function extractImports(sourceText) {
  const imports = [];
  for (const pattern of IMPORT_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(sourceText)) !== null) {
      const specifier = match[1];
      if (typeof specifier === "string" && isRelativeSpecifier(specifier)) imports.push({ specifier, index: match.index });
    }
  }
  return imports;
}

function calculateLineNumber(sourceText, index) { return sourceText.slice(0, index).split("\n").length; }

function main() {
  const roots = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_ROOTS;
  const sourceFiles = [...new Set(roots.flatMap(root => walkDirectory(path.resolve(PROJECT_ROOT, root))))].sort();
  const unresolved = [];
  let importCount = 0;

  for (const filePath of sourceFiles) {
    const sourceText = fs.readFileSync(filePath, "utf8");
    const seen = new Set();
    for (const item of extractImports(sourceText)) {
      const key = `${item.specifier}:${item.index}`;
      if (seen.has(key)) continue;
      seen.add(key);
      importCount++;
      if (!resolveRelativeImport(filePath, item.specifier)) {
        unresolved.push({ file: normalizePath(path.relative(PROJECT_ROOT, filePath)), line: calculateLineNumber(sourceText, item.index), specifier: item.specifier });
      }
    }
  }

  console.log(`Archivos TypeScript analizados: ${sourceFiles.length}`);
  console.log(`Imports relativos encontrados: ${importCount}`);
  console.log(`Imports relativos no resueltos: ${unresolved.length}`);

  if (!unresolved.length) {
    console.log("RESULTADO: OK");
    process.exitCode = 0;
    return;
  }

  console.error("RESULTADO: ERROR");
  for (const item of unresolved) console.error(`- ${item.file}:${item.line} -> ${item.specifier}`);
  process.exitCode = 1;
}

try { main(); }
catch (error) {
  console.error("ERROR FATAL EN LA AUDITORÍA");
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
}
