#!/usr/bin/env node

/**
 * Contrata-IA — validación automática del conocimiento YAML/JSON.
 *
 * Objetivo:
 * - Analizar archivos .yaml, .yml y .json dentro de knowledge/.
 * - Detectar errores de sintaxis.
 * - Detectar archivos vacíos.
 * - Informar de forma reproducible qué archivos presentan errores.
 * - Finalizar con código 1 si existe al menos un problema.
 *
 * Uso:
 *   npm run audit:knowledge
 *
 * El script no modifica ningún archivo del proyecto.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..");
const KNOWLEDGE_ROOT = path.resolve(
  PROJECT_ROOT,
  "knowledge"
);

const KNOWLEDGE_EXTENSIONS = new Set([
  ".yaml",
  ".yml",
  ".json"
]);

function normalizePath(value) {
  return value.split(path.sep).join("/");
}

function walkDirectory(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const entries = fs.readdirSync(
    directory,
    {
      withFileTypes: true
    }
  );

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

    const fullPath = path.join(
      directory,
      entry.name
    );

    if (entry.isDirectory()) {
      result.push(
        ...walkDirectory(fullPath)
      );
      continue;
    }

    if (
      entry.isFile() &&
      KNOWLEDGE_EXTENSIONS.has(
        path.extname(entry.name).toLowerCase()
      )
    ) {
      result.push(fullPath);
    }
  }

  return result;
}

function validateJson(
  filePath,
  sourceText
) {
  try {
    const parsed = JSON.parse(
      sourceText
    );

    if (
      parsed === null ||
      typeof parsed !== "object"
    ) {
      return {
        valid: false,
        error:
          "El JSON debe contener un objeto o un array."
      };
    }

    return {
      valid: true,
      error: null
    };
  } catch (error) {
    return {
      valid: false,
      error:
        error instanceof Error
          ? error.message
          : String(error)
    };
  }
}

function validateYaml(
  filePath,
  sourceText
) {
  try {
    const parsed = yaml.load(
      sourceText
    );

    if (
      parsed === undefined ||
      parsed === null
    ) {
      return {
        valid: false,
        error:
          "El archivo YAML está vacío o no contiene un documento válido."
      };
    }

    return {
      valid: true,
      error: null
    };
  } catch (error) {
    return {
      valid: false,
      error:
        error instanceof Error
          ? error.message
          : String(error)
    };
  }
}

function validateFile(filePath) {
  const relativePath = normalizePath(
    path.relative(
      PROJECT_ROOT,
      filePath
    )
  );

  const sourceText = fs.readFileSync(
    filePath,
    "utf8"
  );

  if (sourceText.trim().length === 0) {
    return {
      file: relativePath,
      valid: false,
      error: "Archivo vacío."
    };
  }

  const extension =
    path.extname(filePath)
      .toLowerCase();

  if (extension === ".json") {
    const result = validateJson(
      filePath,
      sourceText
    );

    return {
      file: relativePath,
      ...result
    };
  }

  const result = validateYaml(
    filePath,
    sourceText
  );

  return {
    file: relativePath,
    ...result
  };
}

function main() {
  console.log("");
  console.log(
    "Contrata-IA — Validación automática del conocimiento YAML/JSON"
  );
  console.log(
    "=".repeat(64)
  );
  console.log(
    `Raíz del conocimiento: ${KNOWLEDGE_ROOT}`
  );

  if (
    !fs.existsSync(
      KNOWLEDGE_ROOT
    )
  ) {
    console.error("");
    console.error(
      "ERROR: no existe el directorio knowledge/."
    );

    process.exitCode = 1;

    return;
  }

  const files = walkDirectory(
    KNOWLEDGE_ROOT
  ).sort();

  console.log(
    `Archivos de conocimiento encontrados: ${files.length}`
  );

  if (files.length === 0) {
    console.error("");
    console.error(
      "ERROR: no se han encontrado archivos YAML, YML o JSON."
    );

    process.exitCode = 1;

    return;
  }

  const results = files.map(
    validateFile
  );

  const invalidFiles = results.filter(
    (result) => !result.valid
  );

  const validFiles = results.filter(
    (result) => result.valid
  );

  console.log(
    `Archivos válidos: ${validFiles.length}`
  );

  console.log(
    `Archivos inválidos: ${invalidFiles.length}`
  );

  console.log("");

  if (
    invalidFiles.length === 0
  ) {
    console.log(
      "RESULTADO: OK"
    );

    console.log(
      "Todos los archivos YAML/JSON del conocimiento son válidos y no están vacíos."
    );

    process.exitCode = 0;

    return;
  }

  console.error(
    "RESULTADO: ERROR"
  );

  console.error("");

  console.error(
    "Archivos con problemas:"
  );

  for (const result of invalidFiles) {
    console.error("");
    console.error(
      `- ${result.file}`
    );
    console.error(
      `  ${result.error}`
    );
  }

  console.error("");

  console.error(
    "La validación termina con código 1 para impedir que conocimiento inválido llegue a fases posteriores."
  );

  process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(
    "ERROR FATAL EN LA VALIDACIÓN DEL CONOCIMIENTO"
  );

  if (error instanceof Error) {
    console.error(
      error.message
    );

    console.error(
      error.stack
    );
  } else {
    console.error(
      error
    );
  }

  process.exitCode = 1;
}
