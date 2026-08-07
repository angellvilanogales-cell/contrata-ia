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

function parseStandard(file) {
  const text = fs.readFileSync(file, "utf8");
  if (!text.trim()) throw new Error("archivo vacío");
  if (file.endsWith(".json")) return JSON.parse(text);
  // Some generated master indexes intentionally repeat configuration sections
  // across concatenated parts. json:true preserves the last value instead of
  // treating the legacy concatenation as a syntax error.
  return yaml.load(text, { json: true });
}

function topLevelId(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  for (const key of ["id", "ruleId", "knowledgeId"]) {
    if (typeof value[key] === "string" && value[key].trim()) return value[key].trim();
  }
  return undefined;
}

function parseLegacyRules(file) {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  const rules = [];
  let current = null;

  const flush = () => {
    if (!current) return;
    const parsed = yaml.load(current.join("\n"));
    const candidate = Array.isArray(parsed) && parsed.length === 1 ? parsed[0] : parsed;
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate) || typeof candidate.id !== "string" || !candidate.id.trim()) {
      throw new Error("bloque de regla sin identificador válido");
    }
    rules.push(candidate);
    current = null;
  };

  for (const line of lines) {
    if (/^-\s+id:\s*/.test(line)) {
      flush();
      current = [line];
      continue;
    }
    if (current) {
      if (/^\S/.test(line) && !line.trim().startsWith("#")) {
        flush();
      } else {
        current.push(line);
      }
    }
  }
  flush();

  if (!rules.length) throw new Error("formato legacy sin bloques '- id:'");
  return rules;
}

const files = walk(ROOT).sort();
const errors = [];
const productionIds = new Map();
const pendingIds = new Set();

for (const file of files) {
  const relative = path.relative(process.cwd(), file).replaceAll(path.sep, "/");
  const isPending = relative.startsWith("knowledge/pending/");
  const isRuleFile = relative.startsWith("knowledge/rules/") && /\.rules\.(ya?ml)$/.test(relative);

  try {
    let parsed;
    try {
      parsed = parseStandard(file);
    } catch (standardError) {
      if (!isRuleFile) throw standardError;
      parsed = parseLegacyRules(file);
      console.log(`Formato legacy de reglas aceptado: ${relative}`);
    }

    const values = Array.isArray(parsed) ? parsed : [parsed];
    for (const value of values) {
      const id = topLevelId(value);
      if (!id) continue;
      if (isPending) {
        pendingIds.add(id);
        continue;
      }
      const previous = productionIds.get(id);
      if (previous) errors.push(`ID duplicado '${id}': ${previous} y ${relative}`);
      else productionIds.set(id, relative);
    }
  } catch (error) {
    errors.push(`${relative}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log(`Archivos inspeccionados: ${files.length}`);
console.log(`Identificadores de producción: ${productionIds.size}`);
console.log(`Identificadores pendientes: ${pendingIds.size}`);

if (errors.length) {
  console.error(`Errores de integridad: ${errors.length}`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("RESULTADO: OK");
}
