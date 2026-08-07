import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const required = [
  "src/application/intake/lb6/IntakeModel.ts",
  "src/application/intake/lb6/IntakeEngine.ts",
  "src/application/intake/lb6/QuestionnaireDocx.ts",
  "src/application/intake/lb6/LB6Orchestrator.ts",
  "src/application/intake/lb6/LB6Demo.ts",
  "src/interfaces/lb6/LB6Server.ts",
  "docs/architecture/ADR-0007-LB6-DUAL-INTAKE.md",
  "tests/lb6-intake.test.ts"
];
for (const file of required) if (!fs.existsSync(path.join(root, file))) errors.push(`Falta componente LB-6: ${file}`);

function read(file) { return fs.existsSync(path.join(root, file)) ? fs.readFileSync(path.join(root, file), "utf8") : ""; }
const engine = read("src/application/intake/lb6/IntakeEngine.ts");
const questionnaire = read("src/application/intake/lb6/QuestionnaireDocx.ts");
const orchestrator = read("src/application/intake/lb6/LB6Orchestrator.ts");
const server = read("src/interfaces/lb6/LB6Server.ts");

for (const id of ["contractingAuthority", "object", "need", "estimatedValue", "insufficiencyOfMeans", "needPlacement", "insufficiencyPlacement", "additionalDocumentInstruction"]) {
  if (!engine.includes(`id: "${id}"`)) errors.push(`Falta pregunta estructural LB-6: ${id}`);
}
if (!questionnaire.includes("[[Q:${question.id}]]")) errors.push("La ficha DOCX no conserva identificadores de pregunta importables.");
if (!questionnaire.includes("inflateRawSync")) errors.push("La importación DOCX debe admitir documentos guardados por Word con compresión DEFLATE.");
if (!orchestrator.includes("QUESTIONNAIRE_IMPORT")) errors.push("No se preserva la procedencia de respuestas importadas.");
if (!orchestrator.includes("toLB5Context")) errors.push("LB-6 no desemboca en el motor documental LB-5.");
if (!server.includes("/api/questionnaire/import")) errors.push("Falta endpoint de importación de ficha.");
if (!server.includes("/validate")) errors.push("Falta validación humana vía API.");
if (!server.includes("/generate")) errors.push("Falta generación documental vía API.");
if (!server.includes("Asistente guiado") || !server.includes("Descargar Ficha de Datos")) errors.push("La interfaz no ofrece las dos vías principales de entrada.");

if (errors.length) {
  console.error("LB-6 audit: FAIL");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("LB-6 audit: PASS");
console.log("- guided, questionnaire and hybrid intake: present");
console.log("- editable DOCX questionnaire round-trip: present");
console.log("- human validation gate: present");
console.log("- LB-5 generation integration: present");
console.log("- HTTP API and operator UI: present");
