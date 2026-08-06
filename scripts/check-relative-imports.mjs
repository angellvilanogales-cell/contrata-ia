#!/usr/bin/env node

/**
 * Contrata-IA — auditoría de imports relativos.
 *
 * Objetivo:
 * - Analizar archivos TypeScript dentro de src/ y knowledge/.
 * - Detectar imports y re-exportaciones relativas.
 * - Resolver los destinos contra el árbol real del repositorio.
 * - Devolver código 1 si existe al menos un import relativo no resuelto.
 *
 * Uso:
 *   npm run audit:imports
 *
 * Opcionalmente:
 *   node scripts/check-relative-imports.mjs src knowledge
 *
 * El script no instala dependencias y no modifica archivos del proyecto.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..");

const DEFAULT_ROOTS = ["src", "knowledge"];

const SOURCE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".mts",
  ".cts"
]);

const RESOLUTION_EXTENSIONS = [
  "",
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs"
];

const INDEX_FILES = [
  "index.ts",
  "index.tsx",
  "index.mts",
  "index.cts",
  "index.js",
  "index.jsx",
  "index.mjs",
  "index.cjs"
];

const IMPORT_PATTERNS = [
  /\bimport\s+(?:type\s+)?[\s\S]*?\sfrom\s*["']([^"']+)["']/g,
  /\bimport\s*["']([^"']+)["']/g,
  /\bexport\s+(?:type\s+)?[\s\S]*?\sfrom\s*["']([^"']+)["']/g,
  /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g
];

function normalizePath(value) {
  return value.split(path.sep).join("/");
}

function isRelativeSpecifier(specifier) {
  return (
    specifier === "." ||
    specifier === ".." ||
    specifier.startsWith("./") ||
    specifier.startsWith("../")
  );
}

function isSourceFile(filePath) {
  return SOURCE_EXTENSIONS.has(path.extname(filePath));
}

function walkDirectory(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const entries = fs.readdirSync(directory, {
    withFileTypes: true
  });

  const result = [];

  for (const entry of entries) {
    if (
      entry.name === "node_modules" ||
      entry.name === "dist" ||
      entry.name === "dist-test" ||
      entry.name === ".git"
    ) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      result.push(...walkDirectory(fullPath));
      continue;
    }

    if (entry.isFile() && isSourceFile(fullPath)) {
      result.push(fullPath);
    }
  }

  return result;
}

function removeJsLikeExtension(specifier) {
  const extension = path.extname(specifier);

  if (
    extension === ".js" ||
    extension === ".jsx" ||
    extension === ".mjs" ||
    extension === ".cjs"
  ) {
    return specifier.slice(0, -extension.length);
  }

  return specifier;
}

function resolveRelativeImport(importerFile, specifier) {
  const importerDirectory = path.dirname(importerFile);

  const basePath = path.resolve(
    importerDirectory,
    specifier
  );

  const normalizedBasePath = removeJsLikeExtension(basePath);

  for (const extension of RESOLUTION_EXTENSIONS) {
    const candidate = `${normalizedBasePath}${extension}`;

    if (
      fs.existsSync(candidate) &&
      fs.statSync(candidate).isFile()
    ) {
      return candidate;
    }
  }

  for (const indexFile of INDEX_FILES) {
    const candidate = path.join(
      normalizedBasePath,
      indexFile
    );

    if (
      fs.existsSync(candidate) &&
      fs.statSync(candidate).isFile()
    ) {
      return candidate;
    }
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

      if (
        typeof specifier !== "string" ||
        !isRelativeSpecifier(specifier)
      ) {
        continue;
      }

      imports.push({
        specifier,
        index: match.index
      });
    }
  }

  return imports;
}

function calculateLineNumber(sourceText, index) {
  return sourceText
    .slice(0, index)
    .split("\n")
    .length;
}

function uniqueImports(imports) {
  const seen = new Set();

  return imports.filter((item) => {
    const key = `${item.specifier}:${item.index}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
}

function main() {
  const requestedRoots = process.argv.slice(2);

  const roots =
    requestedRoots.length > 0
      ? requestedRoots
      : DEFAULT_ROOTS;

  const sourceFiles = roots.flatMap((root) => {
    const absoluteRoot = path.resolve(
      PROJECT_ROOT,
      root
    );

    return walkDirectory(absoluteRoot);
  });

  const uniqueSourceFiles = [
    ...new Set(sourceFiles)
  ].sort();

  const unresolved = [];

  let importCount = 0;

  for (const filePath of uniqueSourceFiles) {
    const sourceText = fs.readFileSync(
      filePath,
      "utf8"
    );

    const imports = uniqueImports(
      extractImports(sourceText)
    );

    importCount += imports.length;

    for (const item of imports) {
      const resolvedPath =
        resolveRelativeImport(
          filePath,
          item.specifier
        );

      if (resolvedPath) {
        continue;
      }

      unresolved.push({
        file: normalizePath(
          path.relative(
            PROJECT_ROOT,
            filePath
          )
        ),
        line: calculateLineNumber(
          sourceText,
          item.index
        ),
        specifier: item.specifier
      });
    }
  }

  const relativeImportCount = importCount;
  const unresolvedCount = unresolved.length;

  console.log("");
  console.log(
    "Contrata-IA — Auditoría de imports relativos"
  );
  console.log(
    "=".repeat(48)
  );
  console.log(
    `Raíz del proyecto: ${PROJECT_ROOT}`
  );
  console.log(
    `Directorios analizados: ${roots.join(", ")}`
  );
  console.log(
    `Archivos TypeScript analizados: ${uniqueSourceFiles.length}`
  );
  console.log(
    `Imports relativos encontrados: ${relativeImportCount}`
  );
  console.log(
    `Imports relativos no resueltos: ${unresolvedCount}`
  );
  console.log("");

  if (unresolvedCount === 0) {
    console.log(
      "RESULTADO: OK"
    );

    console.log(
      "Todos los imports relativos analizados se resuelven en el árbol actual."
    );

    process.exitCode = 0;

    return;
  }

  console.error(
    "RESULTADO: ERROR"
  );

  console.error("");

  console.error(
    "Imports relativos no resueltos:"
  );

  for (const item of unresolved) {
    console.error(
      `- ${item.file}:${item.line} -> ${item.specifier}`
    );
  }

  console.error("");

  console.error(
    "La auditoría termina con código 1 para impedir que una integración posterior oculte referencias rotas."
  );

  process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(
    "ERROR FATAL EN LA AUDITORÍA"
  );

  if (error instanceof Error) {
    console.error(error.message);
    console.error(error.stack);
  } else {
    console.error(error);
  }

  process.exitCode = 1;
}
