import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const manifestPath = path.join(root, "src/architecture/canonical-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const required = [
  "configuration", "events", "rules", "inference", "knowledge",
  "legalReasoning", "cpv", "procedure", "expediente", "documents", "export", "ai"
];

const errors = [];
const ids = new Set();
const canonicalPaths = new Set();

if (manifest.runtimeEntrypoint !== "src/main.ts") {
  errors.push(`runtimeEntrypoint must be src/main.ts, got ${manifest.runtimeEntrypoint}`);
}

for (const component of manifest.components ?? []) {
  if (ids.has(component.id)) errors.push(`duplicate component id: ${component.id}`);
  ids.add(component.id);

  if (canonicalPaths.has(component.canonicalPath)) {
    errors.push(`canonical path reused by multiple responsibilities: ${component.canonicalPath}`);
  }
  canonicalPaths.add(component.canonicalPath);

  const absoluteCanonical = path.join(root, component.canonicalPath);
  if (!fs.existsSync(absoluteCanonical)) {
    errors.push(`canonical implementation does not exist: ${component.canonicalPath}`);
  }

  for (const legacyPath of component.legacyPaths ?? []) {
    if (legacyPath === component.canonicalPath) {
      errors.push(`canonical path is also marked legacy for ${component.id}: ${legacyPath}`);
    }
  }
}

for (const requiredId of required) {
  if (!ids.has(requiredId)) errors.push(`missing canonical responsibility: ${requiredId}`);
}

const expediente = (manifest.components ?? []).find(component => component.id === "expediente");
if (expediente?.canonicalPath !== "src/domain/expediente/CanonicalExpedienteState.ts") {
  errors.push("expediente authority must be CanonicalExpedienteState.ts");
}
for (const legacyExpedientePath of [
  "src/domain/expediente/Expediente.ts",
  "src/domain/expediente/ExpedienteContext.ts",
  "src/domain/expediente/ExpedienteContexto.ts",
]) {
  if (!expediente?.legacyPaths?.includes(legacyExpedientePath)) {
    errors.push(`legacy expediente model must be declared compatibility-only: ${legacyExpedientePath}`);
  }
}

const mainSource = fs.readFileSync(path.join(root, "src/main.ts"), "utf8");
const forbiddenDirectLayerImport = /from\s+["']\.\/(?:domain|application|infrastructure)\//g;
if (forbiddenDirectLayerImport.test(mainSource)) {
  errors.push("src/main.ts imports an internal layer directly; runtime must enter through src/architecture");
}

const tsconfig = JSON.parse(fs.readFileSync(path.join(root, "tsconfig.json"), "utf8"));
const includes = new Set(tsconfig.include ?? []);
for (const requiredInclude of ["src/main.ts", "src/architecture/**/*.ts"]) {
  if (!includes.has(requiredInclude)) {
    errors.push(`tsconfig must compile canonical runtime surface: missing ${requiredInclude}`);
  }
}

if (errors.length > 0) {
  console.error("Canonical architecture audit: FAIL");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Canonical architecture audit: PASS (${ids.size} responsibilities, ${canonicalPaths.size} unique providers)`);
