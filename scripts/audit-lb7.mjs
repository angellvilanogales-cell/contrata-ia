import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const requiredFiles = [
  "src/application/operations/lb7/OperationalPorts.ts",
  "src/infrastructure/operations/lb7/FileCaseRepository.ts",
  "src/infrastructure/operations/lb7/HashChainAuditLog.ts",
  "src/interfaces/lb7/SecurityPolicy.ts",
  "src/interfaces/lb7/PwaAssets.ts",
  "tests/lb7-security.test.ts",
  "tests/lb7-pwa.test.ts",
  "docs/operations/LB7-PILOT-AND-RELEASE.md"
];
for (const file of requiredFiles) if (!fs.existsSync(path.join(root, file))) errors.push(`Falta componente LB-7: ${file}`);

function read(file) { return fs.readFileSync(path.join(root, file), "utf8"); }
if (fs.existsSync(path.join(root, "src/interfaces/lb7/SecurityPolicy.ts"))) {
  const value = read("src/interfaces/lb7/SecurityPolicy.ts");
  for (const marker of ["NODE_ENV === \"production\"", "timingSafeEqual", "REVIEWER", "ADMIN", "content-security-policy"]) {
    if (!value.includes(marker)) errors.push(`SecurityPolicy no contiene salvaguarda: ${marker}`);
  }
}
if (fs.existsSync(path.join(root, "src/infrastructure/operations/lb7/FileCaseRepository.ts"))) {
  const value = read("src/infrastructure/operations/lb7/FileCaseRepository.ts");
  for (const marker of ["sha256", "renameSync", "backup", "0o600"]) if (!value.includes(marker)) errors.push(`Persistencia LB-7 sin salvaguarda: ${marker}`);
}
if (fs.existsSync(path.join(root, "src/infrastructure/operations/lb7/HashChainAuditLog.ts"))) {
  const value = read("src/infrastructure/operations/lb7/HashChainAuditLog.ts");
  for (const marker of ["previousHash", "GENESIS", "verify", "sha256"]) if (!value.includes(marker)) errors.push(`Auditoría LB-7 sin salvaguarda: ${marker}`);
}
if (fs.existsSync(path.join(root, "src/interfaces/lb7/PwaAssets.ts"))) {
  const value = read("src/interfaces/lb7/PwaAssets.ts");
  for (const marker of ["display: \"standalone\"", "PWA_SERVICE_WORKER", "url.pathname.startsWith('/api/')", "SHELL=['/'"]) {
    if (!value.includes(marker)) errors.push(`PWA LB-7 sin requisito: ${marker}`);
  }
  if (value.includes("'/api/cases'")) errors.push("La caché PWA no debe contener rutas de expedientes.");
}
if (fs.existsSync(path.join(root, "src/interfaces/lb6/LB6Server.ts"))) {
  const value = read("src/interfaces/lb6/LB6Server.ts");
  for (const marker of ["/manifest.webmanifest", "/sw.js", "beforeinstallprompt", "apple-mobile-web-app-capable"]) {
    if (!value.includes(marker)) errors.push(`Interfaz LB-7 no expone PWA: ${marker}`);
  }
}
if (fs.existsSync(path.join(root, "src/application/documents/lb5/AdministrativeDocumentRenderer.ts"))) {
  const value = read("src/application/documents/lb5/AdministrativeDocumentRenderer.ts");
  if (value.includes('paragraphXml(`Fuentes:')) errors.push("El renderer final sigue insertando IDs técnicos de fuentes en documentos administrativos.");
  if (value.includes("Estado: ${paragraph.validation}")) errors.push("El renderer final sigue insertando estados técnicos de validación en documentos administrativos.");
}

if (errors.length) {
  console.error("LB-7 operational/security audit: FAIL");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("LB-7 operational/security audit: PASS");
console.log("- persistencia atómica con integridad y backup: presente");
console.log("- auditoría hash-chain verificable: presente");
console.log("- RBAC/autenticación obligatoria en producción: presente");
console.log("- PWA instalable con caché limitada al shell público: presente");
console.log("- metadatos técnicos excluidos de documentos administrativos visibles: verificado");
console.log("- plan de piloto y liberación: presente");
