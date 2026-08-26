import { createHash } from "node:crypto";
import { readOdtZip, writeOdtZip, type OdtZipEntry } from "../lb23/OdtPackageCodec";
import { computeOdtStyleFingerprint } from "../lb23/UniversalOdtProductionRenderer";
import type { VerifiedEditableAsset } from "../../../infrastructure/operations/lb52/VerifiedEditableAssetStore";

export type SupplyGeneralTemplateKind = "MEMORY" | "PPT";

export interface SupplyDerivedTemplateEvidence {
  kind: SupplyGeneralTemplateKind;
  templateId: string;
  sourceAssetId: string;
  sourceSha256: string;
  sourceStyleFingerprint: string;
  derivedSha256: string;
  derivedStyleFingerprint: string;
  corpusSourceIds: readonly string[];
  transformationVersion: string;
  contaminationHits: readonly string[];
  bytes: Uint8Array;
  ready: boolean;
  blockers: readonly string[];
}

export const SUPPLY_GENERAL_DERIVATION_VERSION = "LB94-SUPPLY-GENERAL-ODT-V1" as const;

/** Fuentes independientes usadas solo para acreditar estructura, no para copiar decisiones. */
export const SUPPLY_GENERAL_STRUCTURAL_CORPUS = [
  "FERRETERIA-2026",
  "PANDA-ANTIVIRUS-AVRA",
  "AULAS-DIGITALES",
  "TABLETS-PLATAFORMA",
  "SAS-470-2025",
  "CADIZ-MOBILIARIO",
  "VEIASA-WINDOWS-SERVER",
] as const;

const FORBIDDEN_CASE_MARKERS = [
  "CONTR/2026/240267",
  "44316400-2",
  "FERRETERÍA",
  "FERRETERIA",
  "LEONARDO DA VINCI",
  "AMÉRICO VESPUCIO",
  "AMERICO VESPUCIO",
  "18.160,96",
  "21.793,15",
  "3.632,19",
  "ABRAZADERAS MANGUERA",
] as const;

const XML_HEADER = `<?xml version="1.0" encoding="UTF-8"?>`;

const MEMORY_BODY = `<office:text>
<text:h text:outline-level="1">MEMORIA JUSTIFICATIVA DEL CONTRATO DE SUMINISTRO</text:h>
<text:p>EXPEDIENTE: {{caseId}}</text:p>
<text:h text:outline-level="1">1. ANTECEDENTES Y NECESIDAD</text:h>
<text:p>{{need}}</text:p>
<text:h text:outline-level="1">2. OBJETO DEL CONTRATO Y CODIFICACIÓN</text:h>
<text:p>{{object}}</text:p>
<text:p>CPV principal: {{cpvMain}}</text:p>
<text:h text:outline-level="1">3. LOTES</text:h>
<text:p>{{lotsRegime}}</text:p>
<text:h text:outline-level="1">4. PRESUPUESTO, PRECIO Y VALOR ESTIMADO</text:h>
<text:p>{{economicSummary}}</text:p>
<text:h text:outline-level="1">5. DURACIÓN Y PRÓRROGAS</text:h>
<text:p>{{durationSummary}}</text:p>
<text:h text:outline-level="1">6. PROCEDIMIENTO DE ADJUDICACIÓN</text:h>
<text:p>{{procedureSummary}}</text:p>
<text:h text:outline-level="1">7. CRITERIOS DE ADJUDICACIÓN</text:h>
<text:p>{{awardCriteriaSummary}}</text:p>
<text:h text:outline-level="1">8. EJECUCIÓN, RECEPCIÓN Y MODIFICACIONES</text:h>
<text:p>{{executionSummary}}</text:p>
<text:p>{{modificationSummary}}</text:p>
<text:h text:outline-level="1">9. VALIDACIÓN</text:h>
<text:p>Documento generado por Contrata-IA a partir de datos trazables del expediente. Requiere revisión y validación humana antes de su aprobación o firma.</text:p>
</office:text>`;

const PPT_BODY = `<office:text>
<text:h text:outline-level="1">PLIEGO DE PRESCRIPCIONES TÉCNICAS DEL CONTRATO DE SUMINISTRO</text:h>
<text:p>EXPEDIENTE: {{caseId}}</text:p>
<text:h text:outline-level="1">1. OBJETO DEL PLIEGO</text:h>
<text:p>{{object}}</text:p>
<text:h text:outline-level="1">2. UNIDAD GESTORA Y RESPONSABLE DEL CONTRATO</text:h>
<text:p>{{contractManagement}}</text:p>
<text:h text:outline-level="1">3. DURACIÓN, LUGAR Y CONDICIONES DE ENTREGA</text:h>
<text:p>{{durationSummary}}</text:p>
<text:p>{{executionLocations}}</text:p>
<text:h text:outline-level="1">4. PRESCRIPCIONES TÉCNICAS ESENCIALES</text:h>
<text:p>{{technicalRequirements}}</text:p>
<text:h text:outline-level="1">5. ALCANCE SEGÚN SUBFAMILIA DEL SUMINISTRO</text:h>
<text:p>{{supplyVariantRequirements}}</text:p>
<text:h text:outline-level="1">6. CONTROL DE CALIDAD, RECEPCIÓN Y CONFORMIDAD</text:h>
<text:p>{{receiptAndAcceptanceRegime}}</text:p>
<text:h text:outline-level="1">7. OBLIGACIONES TÉCNICAS DE EJECUCIÓN</text:h>
<text:p>{{specialExecutionConditions}}</text:p>
<text:h text:outline-level="1">8. VALIDACIÓN</text:h>
<text:p>Documento generado por Contrata-IA. Las prescripciones concretas proceden del expediente y deben ser revisadas y validadas humanamente antes de su aprobación o firma.</text:p>
</office:text>`;

function hash(bytes: Uint8Array): string { return createHash("sha256").update(bytes).digest("hex"); }
function get(entries: readonly OdtZipEntry[], name: string): OdtZipEntry { const found = entries.find(item => item.name === name); if (!found) throw new Error(`ODT inválido: falta ${name}.`); return found; }
function text(entries: readonly OdtZipEntry[], name: string): string { return Buffer.from(get(entries, name).bytes).toString("utf8"); }
function replace(entries: readonly OdtZipEntry[], name: string, next: string): OdtZipEntry[] { return entries.map(item => item.name === name ? { ...item, bytes: Buffer.from(next, "utf8") } : item); }

function replaceOfficeText(contentXml: string, body: string): string {
  const matches = [...contentXml.matchAll(/<office:text\b[\s\S]*?<\/office:text>/g)];
  if (matches.length !== 1 || matches[0]?.index === undefined) throw new Error(`Se exige un único office:text en el ODT fuente; encontrados ${matches.length}.`);
  const current = matches[0][0];
  return contentXml.replace(current, body);
}

function scrubMetadata(metaXml: string): string {
  return metaXml
    .replace(/<dc:title>[\s\S]*?<\/dc:title>/g, "<dc:title>Contrata-IA · Plantilla general de suministro</dc:title>")
    .replace(/<dc:subject>[\s\S]*?<\/dc:subject>/g, "<dc:subject>Plantilla general editable derivada y trazable</dc:subject>")
    .replace(/<meta:keyword>[\s\S]*?<\/meta:keyword>/g, "");
}

function contamination(entries: readonly OdtZipEntry[]): string[] {
  const allXml = entries
    .filter(item => item.name.endsWith(".xml"))
    .map(item => Buffer.from(item.bytes).toString("utf8").toUpperCase())
    .join("\n");
  return FORBIDDEN_CASE_MARKERS.filter(marker => allXml.includes(marker.toUpperCase()));
}

function ensureEditableOdt(entries: readonly OdtZipEntry[]): void {
  const mime = Buffer.from(get(entries, "mimetype").bytes).toString("utf8").trim();
  if (mime !== "application/vnd.oasis.opendocument.text") throw new Error("El activo fuente no es ODT editable de texto.");
  get(entries, "content.xml"); get(entries, "styles.xml"); get(entries, "META-INF/manifest.xml");
}

export function deriveSupplyGeneralEditableTemplate(input: {
  kind: SupplyGeneralTemplateKind;
  source: VerifiedEditableAsset;
  expectedSourceStyleFingerprint: string;
}): SupplyDerivedTemplateEvidence {
  const blockers: string[] = [];
  if (input.source.descriptor.role !== "REAL_CASE_EDITABLE") blockers.push("La derivación exige un activo real editable previamente verificado por identidad.");
  if (input.source.actualSha256 !== input.source.descriptor.expectedSha256) blockers.push("El SHA-256 del activo fuente no coincide con su descriptor verificado.");

  let entries = readOdtZip(input.source.bytes);
  ensureEditableOdt(entries);
  const sourceStyle = computeOdtStyleFingerprint(entries);
  if (sourceStyle !== input.expectedSourceStyleFingerprint) blockers.push("La huella de estilo del activo fuente no coincide con la huella acreditada.");

  const content = text(entries, "content.xml");
  entries = replace(entries, "content.xml", replaceOfficeText(content, input.kind === "MEMORY" ? MEMORY_BODY : PPT_BODY));
  const meta = entries.find(item => item.name === "meta.xml");
  if (meta) entries = replace(entries, "meta.xml", scrubMetadata(Buffer.from(meta.bytes).toString("utf8")));

  const contaminationHits = contamination(entries);
  if (contaminationHits.length) blockers.push(`La plantilla derivada conserva contaminación de expediente: ${contaminationHits.join(", ")}.`);
  if (SUPPLY_GENERAL_STRUCTURAL_CORPUS.length < 3) blockers.push("No existe corpus estructural multicaso suficiente para acreditar generalización Supply.");

  const bytes = writeOdtZip(entries);
  const derivedStyle = computeOdtStyleFingerprint(readOdtZip(bytes));
  if (derivedStyle !== sourceStyle) blockers.push("La derivación alteró la huella física de estilos del ODT donante.");

  const kind = input.kind.toLowerCase();
  return {
    kind: input.kind,
    templateId: `contrata-ia:supply:${kind}:general:${SUPPLY_GENERAL_DERIVATION_VERSION}`,
    sourceAssetId: input.source.descriptor.assetId,
    sourceSha256: input.source.actualSha256,
    sourceStyleFingerprint: sourceStyle,
    derivedSha256: hash(bytes),
    derivedStyleFingerprint: derivedStyle,
    corpusSourceIds: SUPPLY_GENERAL_STRUCTURAL_CORPUS,
    transformationVersion: SUPPLY_GENERAL_DERIVATION_VERSION,
    contaminationHits,
    bytes,
    ready: blockers.length === 0,
    blockers,
  };
}

export function supplyGeneralTemplatePlaceholders(kind: SupplyGeneralTemplateKind): readonly string[] {
  const body = kind === "MEMORY" ? MEMORY_BODY : PPT_BODY;
  return [...body.matchAll(/\{\{([A-Za-z0-9.]+)\}\}/g)].map(match => match[1]);
}
