import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcesPath = path.join(root, "knowledge/lb4/official-sources.json");
const rulesPath = path.join(root, "knowledge/lb4/rules.json");

const errors = [];

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`${path.relative(root, file)} no es JSON válido: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

const sourcesDoc = readJson(sourcesPath);
const rulesDoc = readJson(rulesPath);

if (sourcesDoc && rulesDoc) {
  const sources = Array.isArray(sourcesDoc.sources) ? sourcesDoc.sources : [];
  const rules = Array.isArray(rulesDoc.rules) ? rulesDoc.rules : [];
  const sourceIds = new Set();
  const ruleIds = new Set();

  for (const source of sources) {
    if (!source?.id || typeof source.id !== "string") {
      errors.push("Fuente LB-4 sin id válido.");
      continue;
    }
    if (sourceIds.has(source.id)) errors.push(`Fuente duplicada: ${source.id}`);
    sourceIds.add(source.id);
    if (!source.authority || !source.title || !source.effectiveContext) {
      errors.push(`Fuente ${source.id} carece de autoridad, título o contexto de vigencia.`);
    }
    if (source.authority !== "Documentación administrativa aportada al proyecto") {
      if (typeof source.url !== "string" || !source.url.startsWith("https://")) {
        errors.push(`Fuente oficial ${source.id} sin URL HTTPS.`);
      }
    }
  }

  const requiredSourceIds = [
    "LCSP-2017-CONSOLIDADA-2026",
    "UE-2025-2152",
    "JA-MODELOS-PCAP",
    "JA-PROCEDIMIENTOS",
    "JA-CLAUSULAS-SOCIALES-AMBIENTALES"
  ];
  for (const id of requiredSourceIds) {
    if (!sourceIds.has(id)) errors.push(`Falta fuente oficial obligatoria: ${id}`);
  }

  const requiredTopics = new Set([
    "cpv",
    "procedure",
    "harmonized-regulation",
    "lots",
    "economic-solvency",
    "technical-solvency",
    "guarantees",
    "award-criteria",
    "special-execution-condition",
    "data-protection-execution-condition",
    "subrogation",
    "tender-deadline"
  ]);
  const seenTopics = new Set();

  for (const rule of rules) {
    if (!rule?.id || typeof rule.id !== "string") {
      errors.push("Regla LB-4 sin id válido.");
      continue;
    }
    if (ruleIds.has(rule.id)) errors.push(`Regla duplicada: ${rule.id}`);
    ruleIds.add(rule.id);
    if (!rule.topic) errors.push(`Regla ${rule.id} sin topic.`);
    else seenTopics.add(rule.topic);
    if (!rule.justification || typeof rule.justification !== "string") {
      errors.push(`Regla ${rule.id} sin justificación.`);
    }
    if (!Array.isArray(rule.sourceIds) || rule.sourceIds.length === 0) {
      errors.push(`Regla ${rule.id} sin fuentes.`);
    } else {
      for (const sourceId of rule.sourceIds) {
        if (!sourceIds.has(sourceId)) errors.push(`Regla ${rule.id} referencia fuente inexistente ${sourceId}.`);
      }
    }
    if (typeof rule.humanValidation !== "boolean") {
      errors.push(`Regla ${rule.id} debe declarar humanValidation.`);
    }
  }

  for (const topic of requiredTopics) {
    if (!seenTopics.has(topic)) errors.push(`Falta cobertura LB-4 para topic ${topic}.`);
  }

  const thresholds = rulesDoc.thresholds ?? {};
  if (thresholds?.saraServicesRegional?.amount !== 216000) {
    errors.push("El umbral SARA regional 2026-2027 debe ser 216000 EUR.");
  }
  if (thresholds?.simplifiedOpenServices?.amountExclusive !== 140000) {
    errors.push("El límite de referencia del abierto simplificado de servicios 2026-2027 debe ser < 140000 EUR.");
  }
  if (thresholds?.abbreviatedSimplifiedServices?.amountExclusive !== 60000) {
    errors.push("El límite del abierto simplificado abreviado de servicios debe ser < 60000 EUR.");
  }

  const today = new Date();
  const end = new Date(`${rulesDoc.effectiveTo}T23:59:59Z`);
  if (Number.isNaN(end.getTime())) errors.push("effectiveTo no es una fecha válida.");
  else if (today > end) errors.push(`Paquete LB-4 caducado el ${rulesDoc.effectiveTo}; revisar umbrales y fuentes antes de usarlo.`);

  if (!String(rulesDoc.scope?.serviceFamily ?? "").includes("CLEANING")) {
    errors.push("El paquete LB-4 debe permanecer acotado a la familia de limpieza hasta nueva ADR.");
  }
}

if (errors.length > 0) {
  console.error("LB-4 normative audit: FAIL");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("LB-4 normative audit: PASS");
console.log("- official/source registry: valid");
console.log("- unique rules and source references: valid");
console.log("- required legal topics: covered");
console.log("- 2026-2027 thresholds: verified");
console.log("- expiry guard: active");
