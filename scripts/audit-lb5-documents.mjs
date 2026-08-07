import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const profilePath = path.join(root, "knowledge/lb5/document-profile.json");
const errors = [];

let profile;
try {
  profile = JSON.parse(fs.readFileSync(profilePath, "utf8"));
} catch (error) {
  errors.push(`No se puede leer ${path.relative(root, profilePath)}: ${error instanceof Error ? error.message : String(error)}`);
}

if (profile) {
  const requiredPrimary = ["MEMORIA_JUSTIFICATIVA", "PCAP", "PPT"];
  for (const kind of requiredPrimary) {
    if (!profile.primaryDocuments?.includes(kind)) errors.push(`Falta documento principal ${kind}.`);
  }

  for (const block of ["NEED_IDONEITY", "INSUFFICIENCY_MEANS"]) {
    const placements = profile.configurableContent?.[block];
    if (!Array.isArray(placements) || !placements.includes("IN_MEMORY") || !placements.includes("STANDALONE")) {
      errors.push(`${block} debe poder integrarse en Memoria o generarse como documento independiente.`);
    }
  }

  if (profile.additionalDocuments?.mode !== "BLOCK_COMPOSITION") {
    errors.push("Los documentos adicionales deben componerse desde bloques verificables compartidos.");
  }
  if (profile.additionalDocuments?.simpleInstructionInterpreter !== true) {
    errors.push("Debe existir un intérprete de indicaciones simples para documentos adicionales.");
  }
  if (profile.editableFormat !== "DOCX") errors.push("El formato editable principal de LB-5 debe ser DOCX.");
  if (profile.secondaryFormat !== "PDF") errors.push("LB-5 debe producir también PDF derivado.");
  if (profile.style?.primaryFont !== "Source Sans Pro") errors.push("El perfil de referencia documental debe usar Source Sans Pro como familia principal.");
  if (profile.style?.pageSize !== "A4") errors.push("El perfil de referencia debe usar A4.");

  const sourceIds = new Set((profile.sources ?? []).map(source => source.id));
  for (const required of ["LCSP-2017-CONSOLIDADA-2026", "JA-MODELOS-PCAP", "JA-PCAP-LIMPIEZA-EJEMPLOS-USUARIO", "SAE-GUIA-OPERATIVA-CONTRATACION"]) {
    if (!sourceIds.has(required)) errors.push(`Falta fuente documental obligatoria ${required}.`);
  }

  for (const source of profile.sources ?? []) {
    if (!source.id || !source.authority || !source.locator || !source.purpose) errors.push("Fuente LB-5 incompleta.");
    if (source.locator !== "file-library" && !String(source.locator).startsWith("https://")) errors.push(`Fuente ${source.id} sin localizador HTTPS o file-library.`);
  }
}

const requiredCodeFiles = [
  "src/application/documents/lb5/DocumentModel.ts",
  "src/application/documents/lb5/LB5DocumentComposer.ts",
  "src/application/documents/lb5/AdministrativeDocumentRenderer.ts",
  "src/application/documents/lb5/SimpleDocumentRequest.ts",
  "src/application/documents/lb5/LB5Demo.ts"
];
for (const file of requiredCodeFiles) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Falta implementación LB-5: ${file}`);
}

if (errors.length > 0) {
  console.error("LB-5 document audit: FAIL");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("LB-5 document audit: PASS");
console.log("- Memoria, PCAP y PPT: registrados como núcleo");
console.log("- necesidad e insuficiencia: ubicación configurable");
console.log("- documentos adicionales: composición por bloques verificables");
console.log("- salida editable DOCX y PDF: declaradas");
console.log("- fuentes documentales y perfil administrativo: registrados");
