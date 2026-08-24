import { createHash } from "node:crypto";
import { OdtZipEntry, readOdtZip, writeOdtZip } from "../lb23/OdtPackageCodec";
import { computeOdtStyleFingerprint } from "../lb23/UniversalOdtProductionRenderer";
import { auditJdaSupplyAsaRenderedOdt } from "../lb35/JuntaSupplyAsaAnexoIResidualAudit";
import { FERRETERIA_ANEXO_I_SECOND_PASS_PROFILE } from "../lb36/FerreteriaAnexoISecondPassProfile";
import { FERRETERIA_CANONICAL_CATALOG_98 } from "../lb43/FerreteriaCanonicalCatalogSourceData";
import { auditFerreteriaCatalogProjectionParity, projectCanonicalCatalogToPcapAnexoI, projectCanonicalCatalogToPcapAnexoV } from "../lb45/FerreteriaCrossDocumentCatalogProjection";

const DEFAULT_CASE_ID = "CONTR/2026/240267";
const DEFAULT_TITLE = "SUMINISTRO DE MATERIALES DE FERRETERÍA PARA LAS INSTALACIONES LOS EDIFICIOS DONDE SE UBICAN LOS SERVICIOS CENTRALES DEL SERVICIO ANDALUZ DE EMPLEO Y SUS OFICINAS ANEXAS";
const PARAGRAPH_PATTERN = /<text:p\b(?![^>]*\/>)[^>]*>[\s\S]*?<\/text:p>/g;

export interface FerreteriaPcapFinalPostProcessResult {
  bytes: Uint8Array;
  sha256: string;
  styleFingerprint: string;
  auditReady: boolean;
  blockers: readonly string[];
  anexoIRows: number;
  anexoVRows: number;
  propagatedAnnexIdentityParagraphs: number;
  materializedSecondPassParagraphs: number;
}

function xmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");
}

function euro(cents: number): string {
  return `${(cents / 100).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false })} €`;
}

function entry(entries: readonly OdtZipEntry[], name: string): OdtZipEntry {
  const found = entries.find(item => item.name === name);
  if (!found) throw new Error(`ODT inválido: falta ${name}.`);
  return found;
}

function text(entries: readonly OdtZipEntry[], name: string): string {
  return Buffer.from(entry(entries, name).bytes).toString("utf8");
}

function replacePart(entries: readonly OdtZipEntry[], name: string, value: string): OdtZipEntry[] {
  return entries.map(item => item.name === name ? { ...item, bytes: Buffer.from(value, "utf8") } : item);
}

function replaceNamedTable(content: string, name: string, replacement: string): string {
  const token = `table:name=\"${name}\"`;
  const anchor = content.indexOf(token);
  if (anchor < 0 || content.indexOf(token, anchor + token.length) >= 0) throw new Error(`La tabla física ${name} debe existir una sola vez.`);
  const start = content.lastIndexOf("<table:table ", anchor);
  const end = content.indexOf("</table:table>", anchor);
  if (start < 0 || end < 0) throw new Error(`No se puede delimitar la tabla física ${name}.`);
  return content.slice(0, start) + replacement + content.slice(end + "</table:table>".length);
}

function visible(xml: string): string {
  return xml.replace(/<text:tab[^>]*\/>/g, "\t").replace(/<text:s(?:\s+text:c="(\d+)")?\s*\/>/g, (_m, count: string | undefined) => " ".repeat(Number(count ?? 1))).replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&apos;/g, "'");
}

function paragraphStartsWithExactVisible(content: string, expected: string): number[] {
  const starts: number[] = [];
  for (const match of content.matchAll(PARAGRAPH_PATTERN)) {
    if (match.index === undefined) continue;
    if (visible(match[0]).trim() === expected) starts.push(match.index);
  }
  return starts;
}

function lastActualAnnexStart(content: string, roman: string): number {
  const expected = `ANEXO ${roman}`;
  const matches = paragraphStartsWithExactVisible(content, expected);
  if (!matches.length) throw new Error(`PCAP: no se localiza el encabezado físico ${expected}.`);
  return matches[matches.length - 1]!;
}

function mapParagraphs(content: string, mapper: (xml: string, visibleText: string) => string): { content: string; changed: number } {
  let changed = 0;
  const next = content.replace(PARAGRAPH_PATTERN, paragraph => {
    const mapped = mapper(paragraph, visible(paragraph));
    if (mapped !== paragraph) changed += 1;
    return mapped;
  });
  return { content: next, changed };
}

function replaceBlankValueInParagraph(xml: string, value: string): string {
  if (xml.includes("_______")) return xml.replace("_______", xmlEscape(value));
  if (xml.includes("______")) return xml.replace("______", xmlEscape(value));
  throw new Error("El párrafo de identidad no contiene el hueco esperado.");
}

function decision(id: string): string {
  const item = FERRETERIA_ANEXO_I_SECOND_PASS_PROFILE.find(value => value.id === id);
  if (!item) throw new Error(`LB73: no existe decisión source-backed ${id}.`);
  return item.value;
}

interface SecondPassRule { id: string; pattern: RegExp; value: string; }

function yesNoFromDecision(id: string): string {
  return /^Sí/i.test(decision(id)) ? "Sí" : "No";
}

function detailAfterYes(id: string): string {
  return decision(id).replace(/^Sí\s*:\s*/i, "").replace(/^Sí\s*;\s*/i, "");
}

const SECOND_PASS_RULES: readonly SecondPassRule[] = [
  { id: "object-specification", pattern: /^Especificaciones del objeto del contrato\s*:\s*$/i, value: decision("object-specification") },
  { id: "lots-description", pattern: /^Descripción de los lotes\s*:\s*$/i, value: decision("lots-description") },
  { id: "lot-1-na", pattern: /^LOTE\s+1\.\s*_{3,}\s*$/i, value: "No procede." },
  { id: "lot-2-na", pattern: /^LOTE\s+2\.\s*_{3,}\s*$/i, value: "No procede." },
  { id: "lots-offer-limit", pattern: /^Número máximo de lotes para los que una misma persona licitadora puede presentar oferta:/i, value: decision("lots-offer-limit") },
  { id: "lots-award-limit", pattern: /^Número máximo de lotes que pueden adjudicarse a cada persona licitadora:/i, value: decision("lots-award-limit") },
  { id: "integrative-offer", pattern: /^Oferta integradora:/i, value: yesNoFromDecision("integrative-offer") },
  { id: "reserved-lots-scope", pattern: /^En caso afirmativo, indicar el ámbito de la reserva:/i, value: "No procede." },
  { id: "price-review-weight", pattern: /^En caso afirmativo, indicar el peso de cada materia prima/i, value: decision("price-review-formula") },
  { id: "price-variation", pattern: /^Variación de precios en función del cumplimiento o incumplimiento/i, value: yesNoFromDecision("price-variation") },
  { id: "partial-deadlines", pattern: /^Plazos parciales \(en meses\):/i, value: decision("partial-deadlines") },
  { id: "contracting-authority", pattern: /^Órgano de contratación:/i, value: decision("contracting-authority") },
  { id: "binding-clarifications", pattern: /^Respuestas vinculantes sobre la aclaración de los pliegos:/i, value: yesNoFromDecision("binding-clarifications") },
  { id: "procurement-board", pattern: /^Constitución de mesa de contratación:/i, value: yesNoFromDecision("procurement-board") },
  { id: "withdrawal-compensation", pattern: /^En caso de renuncia:/i, value: "100, previa justificación de los gastos ocasionados" },
  { id: "desistance-compensation", pattern: /^En caso de desistimiento:/i, value: "100, previa justificación de los gastos ocasionados" },
  { id: "article-129-organisms", pattern: /^Organismos de los que las personas licitadoras pueden obtener la información/i, value: decision("article-129-organisms") },
  { id: "professional-authorisation", pattern: /^Se exige habilitación empresarial o profesional:/i, value: yesNoFromDecision("professional-authorisation") },
  { id: "professional-authorisation-detail", pattern: /^En caso afirmativo, especificar:/i, value: "No procede." },
  { id: "ens", pattern: /^Otros requisitos necesarios para asegurar la conformidad de dichos sistemas con el ENS/i, value: decision("ens") },
  { id: "organisation-requirements-detail", pattern: /^En caso afirmativo, especificar:/i, value: "No procede." },
  { id: "special-condition-penalties", pattern: /^Penalidades por incumplimiento de las condiciones especiales de ejecución del contrato:/i, value: yesNoFromDecision("special-condition-penalties") },
  { id: "special-condition-penalties-detail", pattern: /^En caso afirmativo, indicar las penalidades conforme al artículo 192 de la LCSP:/i, value: detailAfterYes("special-condition-penalties") },
  { id: "critical-subcontracting-detail", pattern: /^En caso afirmativo, indicar dichas partes o trabajos:/i, value: "No procede." },
  { id: "subcontract-documentation-penalty", pattern: /^En caso afirmativo, especificar las penalidades en caso de que el contratista no remita/i, value: "No procede." },
  { id: "delay-penalty", pattern: /^Penalidades por demora en la ejecución parcial o total del plazo de ejecución/i, value: yesNoFromDecision("delay-penalty") },
  { id: "delay-penalty-detail", pattern: /^En caso afirmativo, especificar:/i, value: detailAfterYes("delay-penalty") },
  { id: "defective-performance-penalty", pattern: /^Penalidades por cumplimiento defectuoso:/i, value: yesNoFromDecision("defective-performance-penalty") },
  { id: "defective-performance-detail", pattern: /^En caso afirmativo, especificar:/i, value: "No procede." },
  { id: "partial-performance-penalty", pattern: /^Penalidades por incumplimiento parcial en la ejecución de las prestaciones/i, value: yesNoFromDecision("partial-performance-penalty") },
  { id: "partial-performance-detail", pattern: /^En caso afirmativo, especificar:/i, value: "No procede." },
  { id: "environmental-social-penalty", pattern: /^Penalidades por incumplimiento de las obligaciones en materia medioambiental, social o laboral:/i, value: yesNoFromDecision("environmental-social-penalty") },
  { id: "environmental-social-detail", pattern: /^En caso afirmativo, especificar:/i, value: detailAfterYes("environmental-social-penalty") },
  { id: "warranty", pattern: /^Plazo de garantía:/i, value: decision("warranty") },
  { id: "work-programme", pattern: /^Programa de trabajo:/i, value: yesNoFromDecision("work-programme") },
  { id: "confidentiality-info", pattern: /^Información a la que se le atribuye carácter confidencial:/i, value: decision("confidentiality-info") },
  { id: "confidentiality-term", pattern: /^Plazo durante el que la persona contratista deberá mantener el deber de confidencialidad/i, value: decision("confidentiality-term") },
  { id: "insurance", pattern: /^Obligación de tener suscrito seguro que cubra las responsabilidades/i, value: yesNoFromDecision("insurance") },
  { id: "insurance-detail", pattern: /^En su caso, términos del seguro:/i, value: "No procede." },
  { id: "assignment", pattern: /^Cesión del contrato:/i, value: decision("assignment") },
  { id: "suspension-special-rules", pattern: /^En el supuesto de suspensión del contrato acordada por la Administración/i, value: yesNoFromDecision("suspension-special-rules") },
  { id: "suspension-special-rules-detail", pattern: /^En caso afirmativo, las reglas a aplicar serán las siguientes:/i, value: "No procede." },
  { id: "personal-data-treatment", pattern: /^La ejecución del contrato requiere el tratamiento por la persona contratista de datos personales/i, value: yesNoFromDecision("personal-data-treatment") },
] as const;

function isUnresolvedVisible(value: string): boolean {
  if (/(?:Sí\s*\/\s*No|_{3,})/i.test(value)) return true;
  const colon = value.indexOf(":");
  return colon >= 0 && value.slice(colon + 1).trim().length === 0;
}

function materializeParagraphValue(xml: string, currentVisible: string, value: string): string {
  const escaped = xmlEscape(value);
  if (/Sí\s*\/\s*No/i.test(currentVisible)) {
    const replaced = xml.replace(/Sí\s*\/\s*No/i, escaped);
    if (replaced !== xml) return replaced;
    const opening = xml.match(/^<text:p\b(?![^>]*\/>)[^>]*>/)?.[0];
    if (!opening) throw new Error("LB77: párrafo ODF real sin apertura.");
    const finalVisible = currentVisible.replace(/Sí\s*\/\s*No/i, value);
    return `${opening}${xmlEscape(finalVisible)}</text:p>`;
  }
  const placeholder = xml.match(/_{3,}/)?.[0];
  if (placeholder) return xml.replace(placeholder, escaped);
  const closing = xml.lastIndexOf("</text:p>");
  if (closing < 0) throw new Error("LB73: párrafo ODF sin cierre.");
  if (currentVisible.includes(":")) return `${xml.slice(0, closing)} ${escaped}${xml.slice(closing)}`;
  throw new Error(`LB73: no se sabe materializar «${currentVisible}».`);
}

function applySecondPassMaterialization(content: string): { content: string; changed: number } {
  let cursor = lastActualAnnexStart(content, "I");
  let changed = 0;
  for (const rule of SECOND_PASS_RULES) {
    const annexIIStart = lastActualAnnexStart(content, "II");
    const section = content.slice(cursor, annexIIStart);
    let found: RegExpMatchArray | undefined;
    for (const match of section.matchAll(PARAGRAPH_PATTERN)) {
      const value = visible(match[0]).trim();
      if (rule.pattern.test(value) && isUnresolvedVisible(value)) { found = match; break; }
    }
    if (!found || found.index === undefined) throw new Error(`LB73: no se localiza de forma ordenada el campo residual ${rule.id}.`);
    const absoluteStart = cursor + found.index;
    const oldXml = found[0];
    const oldVisible = visible(oldXml).trim();
    const newXml = materializeParagraphValue(oldXml, oldVisible, rule.value);
    content = content.slice(0, absoluteStart) + newXml + content.slice(absoluteStart + oldXml.length);
    cursor = absoluteStart + newXml.length;
    changed += 1;
  }
  return { content, changed };
}

function buildAnexoITable(): string {
  const rows = projectCanonicalCatalogToPcapAnexoI();
  const body = rows.map(row => `<table:table-row table:style-name="Tabla4.2"><table:table-cell table:style-name="Tabla4.A2" office:value-type="string"><text:p text:style-name="P26">Lote único</text:p></table:table-cell><table:table-cell table:style-name="Tabla4.B2" office:value-type="string"><text:p text:style-name="P26">${xmlEscape(row.description)}</text:p></table:table-cell><table:table-cell table:style-name="Tabla4.C2" office:value-type="string"><text:p text:style-name="P26">${row.estimatedAnnualUnits}</text:p></table:table-cell><table:table-cell table:style-name="Tabla4.D2" office:value-type="string"><text:p text:style-name="P26">${euro(row.annualReferenceAmountCentsExVat)}</text:p></table:table-cell></table:table-row>`).join("");
  return `<table:table table:name="Tabla4" table:style-name="Tabla4"><table:table-column table:style-name="Tabla4.A"/><table:table-column table:style-name="Tabla4.B"/><table:table-column table:style-name="Tabla4.C"/><table:table-column table:style-name="Tabla4.D"/><table:table-row><table:table-cell table:style-name="Tabla4.A1" office:value-type="string"><text:p text:style-name="P25">Nº de Lote:</text:p></table:table-cell><table:table-cell table:style-name="Tabla4.A1" office:value-type="string"><text:p text:style-name="P26">Denominación del artículo:</text:p></table:table-cell><table:table-cell table:style-name="Tabla4.A1" office:value-type="string"><text:p text:style-name="P26">N.º de unidades:</text:p></table:table-cell><table:table-cell table:style-name="Tabla4.D1" office:value-type="string"><text:p text:style-name="P25">Importe total en euros:</text:p></table:table-cell></table:table-row>${body}<table:table-row><table:table-cell table:style-name="Tabla4.A2" office:value-type="string"><text:p text:style-name="P26"/></table:table-cell><table:table-cell table:style-name="Tabla4.B3" office:value-type="string"><text:p text:style-name="P26"/></table:table-cell><table:table-cell table:style-name="Tabla4.C3" office:value-type="string"><text:p text:style-name="P26">Total: cantidades estimadas por referencia</text:p></table:table-cell><table:table-cell table:style-name="Tabla4.D3" office:value-type="string"><text:p text:style-name="P26">Total: 10.552,44 euros</text:p></table:table-cell></table:table-row></table:table>`;
}

function buildAnexoVTable(): string {
  const rows = projectCanonicalCatalogToPcapAnexoV();
  const body = rows.map(row => `<table:table-row><table:table-cell table:style-name="Tabla11.A2" office:value-type="string"><text:p text:style-name="P267">${xmlEscape(row.description)}</text:p></table:table-cell><table:table-cell table:style-name="Tabla11.A2" office:value-type="string"><text:p text:style-name="P267">${row.estimatedAnnualUnits}</text:p></table:table-cell><table:table-cell table:style-name="Tabla11.A2" office:value-type="string"><text:p text:style-name="P267">${euro(row.maxUnitPriceCentsExVat)}</text:p></table:table-cell><table:table-cell table:style-name="Tabla11.A2" office:value-type="string"><text:p text:style-name="P267"/></table:table-cell><table:table-cell table:style-name="Tabla11.D2" office:value-type="string"><text:p text:style-name="P267"/></table:table-cell></table:table-row>`).join("");
  return `<table:table table:name="Tabla11" table:style-name="Tabla11"><table:table-column table:style-name="Tabla11.A" table:number-columns-repeated="4"/><table:table-column table:style-name="Tabla11.D"/><table:table-row><table:table-cell table:style-name="Tabla11.A1" office:value-type="string"><text:p text:style-name="P430">Descripción</text:p></table:table-cell><table:table-cell table:style-name="Tabla11.A1" office:value-type="string"><text:p text:style-name="P430">Uds. (Estimadas)</text:p></table:table-cell><table:table-cell table:style-name="Tabla11.A1" office:value-type="string"><text:p text:style-name="P430">Coste unitario máx por artículo (IVA excluido)</text:p></table:table-cell><table:table-cell table:style-name="Tabla11.A1" office:value-type="string"><text:p text:style-name="P430">Coste unitario máx por artículo (IVA excluido) OFERTA LICITADOR</text:p></table:table-cell><table:table-cell table:style-name="Tabla11.D1" office:value-type="string"><text:p text:style-name="P430">Coste TOTAL sin IVA OFERTA LICITADOR</text:p></table:table-cell></table:table-row>${body}</table:table>`;
}

export function finalizeFerreteriaPcapRenderedOdt(args: { bytes: Uint8Array; caseId?: string; title?: string }): FerreteriaPcapFinalPostProcessResult {
  const caseId = args.caseId ?? DEFAULT_CASE_ID;
  const title = args.title ?? DEFAULT_TITLE;
  let entries = readOdtZip(args.bytes);
  const sourceStyle = computeOdtStyleFingerprint(entries);
  let content = text(entries, "content.xml");
  content = replaceNamedTable(content, "Tabla4", buildAnexoITable());
  content = replaceNamedTable(content, "Tabla11", buildAnexoVTable());
  const secondPass = applySecondPassMaterialization(content);
  content = secondPass.content;

  const annexIIMarker = lastActualAnnexStart(content, "II");
  const prefix = content.slice(0, annexIIMarker);
  let annexes = content.slice(annexIIMarker);
  const expediente = mapParagraphs(annexes, (xml, value) => /^EXPEDIENTE:\s*_+\s*$/.test(value.trim()) ? replaceBlankValueInParagraph(xml, caseId) : xml);
  annexes = expediente.content;
  const titles = mapParagraphs(annexes, (xml, value) => /^TÍTULO:\s*_+\s*$/.test(value.trim()) ? replaceBlankValueInParagraph(xml, title) : xml);
  annexes = titles.content;
  const lotLine = mapParagraphs(annexes, (xml, value) => /^LOTE\d*:\s*_+\s*$/.test(value.trim()) ? "" : xml);
  annexes = lotLine.content;
  content = prefix + annexes;
  entries = replacePart(entries, "content.xml", content);

  const blockers: string[] = [];
  const parity = auditFerreteriaCatalogProjectionParity();
  if (!parity.ready) blockers.push(...parity.blockers);
  const finalText = visible(content);
  const canonicalDescriptions = FERRETERIA_CANONICAL_CATALOG_98.map(item => item.description);
  const anexoICount = canonicalDescriptions.filter(description => finalText.includes(description)).length;
  if (anexoICount !== 98) blockers.push(`PCAP: no están presentes las 98 descripciones canónicas; se detectan ${anexoICount}.`);
  const anexoVStart = lastActualAnnexStart(content, "V");
  const anexoVIStart = lastActualAnnexStart(content, "VI");
  if (anexoVIStart <= anexoVStart) throw new Error("PCAP: la secuencia física Anexo V/VI es inválida.");
  const anexoVText = visible(content.slice(anexoVStart, anexoVIStart));
  const anexoVCount = canonicalDescriptions.filter(description => anexoVText.includes(description)).length;
  if (anexoVCount !== 98) blockers.push(`PCAP Anexo V: no están presentes las 98 referencias; se detectan ${anexoVCount}.`);
  if (/EXPEDIENTE:\s*_+/.test(visible(annexes))) blockers.push("PCAP: quedan expedientes sin propagar en anexos II-XIII.");
  if (/TÍTULO:\s*_+/.test(visible(annexes))) blockers.push("PCAP: quedan títulos sin propagar en anexos II-XIII.");
  if (computeOdtStyleFingerprint(entries) !== sourceStyle) blockers.push("PCAP: el cierre final alteró la huella de estilos del original renderizado.");
  const residual = auditJdaSupplyAsaRenderedOdt(writeOdtZip(entries));
  if (!residual.ready) blockers.push(...residual.blockers);
  const bytes = writeOdtZip(entries);
  return {
    bytes,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    styleFingerprint: computeOdtStyleFingerprint(entries),
    auditReady: blockers.length === 0,
    blockers,
    anexoIRows: 98,
    anexoVRows: anexoVCount,
    propagatedAnnexIdentityParagraphs: expediente.changed + titles.changed,
    materializedSecondPassParagraphs: secondPass.changed,
  };
}
