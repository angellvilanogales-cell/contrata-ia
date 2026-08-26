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
  sourceStructuralStyleFingerprint: string;
  derivedSha256: string;
  derivedStyleFingerprint: string;
  derivedStructuralStyleFingerprint: string;
  corpusSourceIds: readonly string[];
  transformationVersion: string;
  contaminationHits: readonly string[];
  bytes: Uint8Array;
  ready: boolean;
  blockers: readonly string[];
}

export const SUPPLY_GENERAL_DERIVATION_VERSION = "LB94-SUPPLY-GENERAL-ODT-V2" as const;

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

/*
 * Los nombres de estilo se toman de los ODT fuente verificados. De esta forma
 * la plantilla general conserva tipografías, espaciados y jerarquía visual del
 * entorno administrativo, pero no conserva el contenido del expediente donante.
 */
const MEMORY_BODY = `<office:text>
<text:p text:style-name="P25">MEMORIA JUSTIFICATIVA DEL CONTRATO DE SUMINISTRO</text:p>
<text:p text:style-name="P24">EXPEDIENTE: {{caseId}}</text:p>
<text:p text:style-name="P34">1. ANTECEDENTES Y NECESIDAD</text:p>
<text:p text:style-name="P61">{{need}}</text:p>
<text:p text:style-name="P36">2. OBJETO DEL CONTRATO Y CODIFICACIÓN</text:p>
<text:p text:style-name="P51">{{object}}</text:p>
<text:p text:style-name="P61">CPV principal: {{cpvMain}}</text:p>
<text:p text:style-name="P34">3. LOTES</text:p>
<text:p text:style-name="P61">{{lotsRegime}}</text:p>
<text:p text:style-name="P34">4. PRESUPUESTO, PRECIO Y VALOR ESTIMADO</text:p>
<text:p text:style-name="P61">{{economicSummary}}</text:p>
<text:p text:style-name="P34">5. DURACIÓN Y PRÓRROGAS</text:p>
<text:p text:style-name="P61">{{durationSummary}}</text:p>
<text:p text:style-name="P34">6. PROCEDIMIENTO DE ADJUDICACIÓN</text:p>
<text:p text:style-name="P61">{{procedureSummary}}</text:p>
<text:p text:style-name="P34">7. CRITERIOS DE ADJUDICACIÓN</text:p>
<text:p text:style-name="P61">{{awardCriteriaSummary}}</text:p>
<text:p text:style-name="P34">8. EJECUCIÓN, RECEPCIÓN Y MODIFICACIONES</text:p>
<text:p text:style-name="P61">{{executionSummary}}</text:p>
<text:p text:style-name="P61">{{modificationSummary}}</text:p>
<text:p text:style-name="P34">9. VALIDACIÓN</text:p>
<text:p text:style-name="P61">Documento generado por Contrata-IA a partir de datos trazables del expediente. Requiere revisión y validación humana antes de su aprobación o firma.</text:p>
</office:text>`;

const PPT_BODY = `<office:text>
<text:p text:style-name="P15">PLIEGO DE PRESCRIPCIONES TÉCNICAS DEL CONTRATO DE SUMINISTRO</text:p>
<text:p text:style-name="P15">EXPEDIENTE: {{caseId}}</text:p>
<text:p text:style-name="P42">1. OBJETO DEL PLIEGO</text:p>
<text:p text:style-name="P18">{{object}}</text:p>
<text:p text:style-name="P26">2. UNIDAD GESTORA Y RESPONSABLE DEL CONTRATO</text:p>
<text:p text:style-name="P20">{{contractManagement}}</text:p>
<text:p text:style-name="P30">3. DURACIÓN, LUGAR Y CONDICIONES DE ENTREGA</text:p>
<text:p text:style-name="P38">{{durationSummary}}</text:p>
<text:p text:style-name="P20">{{executionLocations}}</text:p>
<text:p text:style-name="P27">4. PRESCRIPCIONES TÉCNICAS ESENCIALES</text:p>
<text:p text:style-name="P22">{{technicalRequirements}}</text:p>
<text:p text:style-name="P26">5. ALCANCE SEGÚN SUBFAMILIA DEL SUMINISTRO</text:p>
<text:p text:style-name="P20">{{supplyVariantRequirements}}</text:p>
<text:p text:style-name="P26">6. CONTROL DE CALIDAD, RECEPCIÓN Y CONFORMIDAD</text:p>
<text:p text:style-name="P20">{{receiptAndAcceptanceRegime}}</text:p>
<text:p text:style-name="P26">7. OBLIGACIONES TÉCNICAS DE EJECUCIÓN</text:p>
<text:p text:style-name="P20">{{specialExecutionConditions}}</text:p>
<text:p text:style-name="P26">8. VALIDACIÓN</text:p>
<text:p text:style-name="P20">Documento generado por Contrata-IA. Las prescripciones concretas proceden del expediente y deben ser revisadas y validadas humanamente antes de su aprobación o firma.</text:p>
</office:text>`;

function hash(bytes: Uint8Array | string): string { return `sha256:${createHash("sha256").update(bytes).digest("hex")}`; }
function bareHash(bytes: Uint8Array): string { return createHash("sha256").update(bytes).digest("hex"); }
function get(entries: readonly OdtZipEntry[], name: string): OdtZipEntry { const found = entries.find(item => item.name === name); if (!found) throw new Error(`ODT inválido: falta ${name}.`); return found; }
function text(entries: readonly OdtZipEntry[], name: string): string { return Buffer.from(get(entries, name).bytes).toString("utf8"); }
function replace(entries: readonly OdtZipEntry[], name: string, next: string): OdtZipEntry[] { return entries.map(item => item.name === name ? { ...item, bytes: Buffer.from(next, "utf8") } : item); }

function automaticStyles(contentXml: string): string {
  return contentXml.match(/<office:automatic-styles\b[\s\S]*?<\/office:automatic-styles>/)?.[0] ?? "";
}

/**
 * Huella estructural que excluye únicamente el contenido del master-page.
 * Permite sanear textos de cabecera/pie específicos del expediente sin afirmar
 * que el hash completo de styles.xml permanece idéntico. Fuentes, estilos y
 * automatic-styles deben seguir siendo exactamente los mismos.
 */
export function computeSupplyStructuralStyleFingerprint(entries: readonly OdtZipEntry[]): string {
  const styles = text(entries, "styles.xml").replace(/<office:master-styles\b[\s\S]*?<\/office:master-styles>/, "<office:master-styles/>");
  const content = text(entries, "content.xml");
  const settings = entries.find(item => item.name === "settings.xml");
  const settingsText = settings ? Buffer.from(settings.bytes).toString("utf8") : "";
  return hash([styles, automaticStyles(content), settingsText].join("\n--CONTRATA-IA-SUPPLY-STRUCTURAL-STYLE--\n"));
}

function replaceOfficeText(contentXml: string, body: string): string {
  const matches = [...contentXml.matchAll(/<office:text\b[\s\S]*?<\/office:text>/g)];
  if (matches.length !== 1 || matches[0]?.index === undefined) throw new Error(`Se exige un único office:text en el ODT fuente; encontrados ${matches.length}.`);
  return contentXml.replace(matches[0][0], body);
}

function scrubMetadata(metaXml: string): string {
  return metaXml
    .replace(/<dc:title>[\s\S]*?<\/dc:title>/g, "<dc:title>Contrata-IA · Plantilla general de suministro</dc:title>")
    .replace(/<dc:subject>[\s\S]*?<\/dc:subject>/g, "<dc:subject>Plantilla general editable derivada y trazable</dc:subject>")
    .replace(/<meta:keyword>[\s\S]*?<\/meta:keyword>/g, "");
}

function scrubMasterPageCaseText(stylesXml: string): string {
  return stylesXml
    .replace("C/ Leonardo Da Vinci n.º 19 B.", "Servicio Andaluz de Empleo.")
    .replace("41092. Isla de la Cartuja. Sevilla.", "Junta de Andalucía.")
    .replace("Teléfono: 955 033 100. Fax: 955 693 295.", "");
}

function removeManifestPrefix(manifestXml: string, prefix: string): string {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<manifest:file-entry\\b[^>]*manifest:full-path="${escaped}[^\"]*"[^>]*/>`, "g");
  return manifestXml.replace(pattern, "");
}

function pruneUnreferencedEmbeddedObjects(entries: readonly OdtZipEntry[]): OdtZipEntry[] {
  const references = ["content.xml", "styles.xml", "settings.xml"]
    .map(name => entries.find(item => item.name === name))
    .filter((item): item is OdtZipEntry => Boolean(item))
    .map(item => Buffer.from(item.bytes).toString("utf8"))
    .join("\n");
  const prefixes = [...new Set(entries.map(item => /^((?:Object) \d+\/)/.exec(item.name)?.[1]).filter((item): item is string => Boolean(item)))];
  let result = [...entries];
  let manifest = result.find(item => item.name === "META-INF/manifest.xml") ? text(result, "META-INF/manifest.xml") : "";
  for (const prefix of prefixes) {
    const href = `./${prefix.slice(0, -1)}`;
    if (references.includes(href) || references.includes(prefix.slice(0, -1))) continue;
    result = result.filter(item => !item.name.startsWith(prefix));
    if (manifest) manifest = removeManifestPrefix(manifest, prefix);
  }
  if (manifest) result = replace(result, "META-INF/manifest.xml", manifest);
  return result;
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
  const sourceStructuralStyle = computeSupplyStructuralStyleFingerprint(entries);
  if (sourceStyle !== input.expectedSourceStyleFingerprint) blockers.push("La huella de estilo del activo fuente no coincide con la huella acreditada.");

  entries = replace(entries, "content.xml", replaceOfficeText(text(entries, "content.xml"), input.kind === "MEMORY" ? MEMORY_BODY : PPT_BODY));
  entries = replace(entries, "styles.xml", scrubMasterPageCaseText(text(entries, "styles.xml")));
  const meta = entries.find(item => item.name === "meta.xml");
  if (meta) entries = replace(entries, "meta.xml", scrubMetadata(Buffer.from(meta.bytes).toString("utf8")));
  entries = pruneUnreferencedEmbeddedObjects(entries);

  const contaminationHits = contamination(entries);
  if (contaminationHits.length) blockers.push(`La plantilla derivada conserva contaminación de expediente: ${contaminationHits.join(", ")}.`);
  if (SUPPLY_GENERAL_STRUCTURAL_CORPUS.length < 3) blockers.push("No existe corpus estructural multicaso suficiente para acreditar generalización Supply.");

  const bytes = writeOdtZip(entries);
  const derivedEntries = readOdtZip(bytes);
  const derivedStyle = computeOdtStyleFingerprint(derivedEntries);
  const derivedStructuralStyle = computeSupplyStructuralStyleFingerprint(derivedEntries);
  if (derivedStructuralStyle !== sourceStructuralStyle) blockers.push("La derivación alteró fuentes/estilos estructurales del ODT donante más allá del master-page saneado.");

  const kind = input.kind.toLowerCase();
  return {
    kind: input.kind,
    templateId: `contrata-ia:supply:${kind}:general:${SUPPLY_GENERAL_DERIVATION_VERSION}`,
    sourceAssetId: input.source.descriptor.assetId,
    sourceSha256: input.source.actualSha256,
    sourceStyleFingerprint: sourceStyle,
    sourceStructuralStyleFingerprint: sourceStructuralStyle,
    derivedSha256: bareHash(bytes),
    derivedStyleFingerprint: derivedStyle,
    derivedStructuralStyleFingerprint: derivedStructuralStyle,
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
