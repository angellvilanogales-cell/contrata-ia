#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const ROOT = path.resolve(process.cwd(), "knowledge");
const EXTENSIONS = new Set([".yaml", ".yml", ".json"]);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", "dist", "dist-test"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...walk(full));
    else if (EXTENSIONS.has(path.extname(entry.name).toLowerCase())) result.push(full);
  }
  return result;
}

function parse(file) {
  const text = fs.readFileSync(file, "utf8");
  if (!text.trim()) throw new Error("archivo vacío");
  if (file.endsWith(".json")) return JSON.parse(text);
  return yaml.load(text);
}

function topLevelId(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const object = value;
  for (const key of ["id", "ruleId", "knowledgeId"]) {
    if (typeof object[key] === "string" && object[key].trim()) return object[key].trim();
  }
  return undefined;
}

const files = walk(ROOT).sort();
const errors = [];
const ids = new Map();

for (const file of files) {
  const relative = path.relative(process.cwd(), file).replaceAll(path.sep, "/");
  let parsed;
  try {
    parsed = parse(file);
  } catch (error) {
    errors.push(`${relative}: ${error instanceof Error ? error.message : String(error)}`);
    continue;
  }

  const id = topLevelId(parsed);
  if (id) {
    const previous = ids.get(id);
    if (previous) errors.push(`ID duplicado '${id}': ${previous} y ${relative}`);
    else ids.set(id, relative);
  }

  if (relative.startsWith("knowledge/rules/") && relative.endsWith(".rules.yaml") && id) {
    const filenameId = path.basename(relative, ".rules.yaml");
    if (id !== filenameId && !id.startsWith(`${filenameId}.`)) {
      errors.push(`Identificador incoherente en ${relative}: el archivo sugiere '${filenameId}' pero declara '${id}'.`);
    }
  }
}

console.log(`Archivos inspeccionados: ${files.length}`);
console.log(`Identificadores únicos: ${ids.size}`);

if (errors.length) {
  console.error(`Errores de integridad: ${errors.length}`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("RESULTADO: OK");
}
