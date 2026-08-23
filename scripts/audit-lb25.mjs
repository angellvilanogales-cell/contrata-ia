import fs from "node:fs";
import path from "node:path";

const required = [
  "src/application/intake/lb25/UniversalV1ReleaseReadiness.ts",
  "src/application/intake/lb25/ContrataIAV1ReleaseCandidate.ts",
  "tests/lb25-v1-release-readiness.test.ts",
  "docs/operations/LB25-V1-RELEASE-CLOSURE.md",
];

for (const relative of required) {
  const absolute = path.resolve(relative);
  if (!fs.existsSync(absolute)) throw new Error(`LB25 incompleto: falta ${relative}`);
}

const gate = fs.readFileSync(path.resolve(required[0]), "utf8");
for (const token of [
  "acceptedRealCaseIds",
  "officialEditableAssetsVerified",
  "legacyGenerationDisabledForProduction",
  "httpsDeploymentVerified",
  "releaseReviewed",
  "productionReady",
]) {
  if (!gate.includes(token)) throw new Error(`LB25 gate incompleto: falta ${token}`);
}

const candidate = fs.readFileSync(path.resolve(required[1]), "utf8");
if (/productionReady\s*:\s*true/.test(candidate)) {
  throw new Error("LB25 no permite declarar productionReady=true de forma estática en el candidato actual.");
}
if (!candidate.includes("evaluateUniversalV1AcceptanceClosure([])")) {
  throw new Error("El candidato V1 debe conservar explícitamente la ausencia actual de casos reales aceptados.");
}

console.log("LB25 release gate audit: OK");
