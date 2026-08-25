import { createHash } from "node:crypto";
import { OdtZipEntry, readOdtZip, writeOdtZip } from "../lb23/OdtPackageCodec";
import { computeOdtStyleFingerprint } from "../lb23/UniversalOdtProductionRenderer";
import { auditJdaSupplyAsaRenderedOdt } from "../lb35/JuntaSupplyAsaAnexoIResidualAudit";
import { FERRETERIA_ANEXO_I_SECOND_PASS_PROFILE } from "../lb36/FerreteriaAnexoISecondPassProfile";
import { FERRETERIA_CANONICAL_CATALOG_98 } from "../lb43/FerreteriaCanonicalCatalogSourceData";
import { auditFerreteriaCatalogProjectionParity, projectCanonicalCatalogToPcapAnexoI, projectCanonicalCatalogToPcapAnexoV } from "../lb45/FerreteriaCrossDocumentCatalogProjection";

const DEFAULT_CASE_ID = "CONTR/2026/240267";
const DEFAULT_TITLE = "SUMINISTRO DE MATERIALES DE FERRETERÍA PARA LAS INSTALACIONES LOS EDIFICIOS DONDE SE UBICAN LOS SERVICIOS CENTRALES DEL SERVICIO ANDALUZ DE EMPLEO Y SUS OFICINAS ANEXAS";

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

interface ParagraphSpan { xml: string; start: number; end: number; }
interface SecondPassRule { id: string; pattern: RegExp; value: string; }

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
  return xml
    .replace(/<text:tab[^>]*\/>/g, "\t")
    .replace(/<text:s(?:\s+text:c="(\d+)")?\s*\/>/g, (_m, count: string | undefined) => " ".repeat(Number(count ?? 1)))
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&apos;/g, "'");
}

/**
 * Los párrafos del modelo contienen notas al pie con otros <text:p> anidados.
 * Una regexp no puede delimitar correctamente esos párrafos. Este lector mínimo
 * conserva el párrafo exterior completo y evita que LB35/LB60 confundan texto
 * de nota con el campo administrativo al que acompaña.
 */
function topLevelParagraphs(content: string): ParagraphSpan[] {
  const spans: ParagraphSpan[] = [];
  let cursor = 0;
  while (cursor < content.length) {
    let start = content.indexOf("<text:p", cursor);
    if (start < 0) break;
    const openEnd = content.indexOf(">", start);
    if (openEnd < 0) break;
    if (/\/\s*>$/.test(content.slice(start, openEnd + 1))) { cursor = openEnd + 1; continue; }
    let depth = 1;
    let scan = openEnd + 1;
    while (depth > 0) {
      const nextOpen = content.indexOf("<text:p", scan);
      const nextClose = content.indexOf("</text:p>", scan);
      if (nextClose < 0) throw new Error("ODT inválido: párrafo sin cierre.");
      if (nextOpen >= 0 && nextOpen < nextClose) {
        const nestedEnd = content.indexOf(">", nextOpen);
        if (nestedEnd < 0) throw new Error("ODT inválido: apertura de párrafo incompleta.");
        if (!/\/\s*>$/.test(content.slice(nextOpen, nestedEnd + 1))) depth += 1;
        scan = nestedEnd + 1;
      } else {
        depth -= 1;
        scan = nextClose + "</text:p>".length;
      }
    }
    spans.push({ xml: content.slice(start, scan), start, end: scan });
    cursor = scan;
  }
  return spans;
}

function paragraphStartsWithExactVisible(content: string, expected: string): number[] {
  return topLevelParagraphs(content).filter(item => visible(item.xml).trim() === expected).map(item => item.start);
}

function lastActualAnnexStart(content: string, roman: string): number {
  const expected = `ANEXO ${roman}`;
  const matches = paragraphStartsWithExactVisible(content, expected);
  if (!matches.length) throw new Error(`PCAP: no se localiza el encabezado físico ${expected}.`);
  return matches[matches.length - 1]!;
}

function mapParagraphs(content: string, mapper: (xml: string, visibleText: string) => string): { content: string; changed: number } {
  const spans = topLevelParagraphs(content);
  let result = "";
  let cursor = 0;
  let changed = 0;
  for (const span of spans) {
    result += content.slice(cursor, span.start);
    const mapped = mapper(span.xml, visible(span.xml));
    if (mapped !== span.xml) changed += 1;
    result += mapped;
    cursor = span.end;
  }
  result += content.slice(cursor);
  return { content: result, changed };
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

function yesNoFromDecision(id: string): string { return /^Sí/i.test(decision(id)) ? "Sí" : "No"; }
function detailAfterYes(id: string): string { return decision(id).replace(/^Sí\s*:\s*/i, "").replace(/^Sí\s*;\s*/i, ""); }

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

const FINAL_AUTHORITY_RULES: readonly SecondPassRule[] = [
  { id: "anexo-i-title", pattern: /^TÍTULO DEL CONTRATO:\s*_{3,}\s*$/i, value: DEFAULT_TITLE },
  { id: "anexo-i-file", pattern: /^EXPEDIENTE:\s*_{3,}\s*$/i, value: DEFAULT_CASE_ID },
  { id: "anexo-i-locality", pattern: /^LOCALIDAD:\s*_{3,}\s*$/i, value: "SEVILLA" },
  { id: "extra-lot-1", pattern: /^_{3,}$/i, value: "No procede." },
  { id: "extra-lot-2", pattern: /^_{3,}$/i, value: "No procede." },
  { id: "lot-objective-extra", pattern: /^-\s*_{3,}$/i, value: "No procede." },
  { id: "integrative-combinations", pattern: /^En caso afirmativo, combinación o combinaciones de lotes o grupos de lotes admitidas:/i, value: "No procede." },
  { id: "reserved-lots", pattern: /^Uno o varios lotes\. En este caso, indicar lotes reservados:/i, value: "No procede." },
  { id: "specific-legal-regime-final", pattern: /^1\.D\. RÉGIMEN JURÍDICO ESPECÍFICO POR RAZÓN DEL OBJETO DEL CONTRATO:/i, value: "No procede." },
  { id: "direct-cost", pattern: /^-\s*_{3,}$/i, value: "Costes directos: 8.019,85 € (76,00 %)." },
  { id: "indirect-cost-profit", pattern: /^-\s*_{3,}$/i, value: "Costes indirectos: 1.899,44 € (18,00 %) y beneficio industrial: 633,15 € (6,00 %)." },
  { id: "formula-long-recovery", pattern: /^Fórmula:\s*_{3,}$/i, value: "No procede." },
  { id: "formula-short-recovery", pattern: /^Fórmula:\s*_{3,}$/i, value: "No procede." },
  { id: "price-variation-rules", pattern: /^Supuestos y reglas para su determinación:/i, value: "No procede." },
  { id: "goods-as-payment-final", pattern: /^Entrega de otros bienes de la misma clase como pago de parte del precio:/i, value: "No" },
  { id: "ten-percent-final", pattern: /^Posibilidad de incremento del número de unidades a suministrar de hasta el 10% del precio/i, value: "No" },
  { id: "urgent-date", pattern: /^Urgente,?\s+según Resolución de fecha:/i, value: "No procede." },
  { id: "variants-final", pattern: /^Posibilidad de variantes/i, value: "No" },
  { id: "variants-detail", pattern: /^En caso afirmativo, indicar/i, value: "No procede." },
  { id: "organisation-requirements", pattern: /^Requisitos relativos a la organización, destino de sus beneficios, sistemas de financiación/i, value: "No" },
  { id: "criterion-2", pattern: /^2\.\s*_{3,}$/i, value: "No procede." },
  { id: "criterion-3", pattern: /^3\.\s*_{3,}$/i, value: "No procede." },
  { id: "criterion-doc-2", pattern: /^2\.\s*_{3,}$/i, value: "No procede." },
  { id: "criterion-doc-3", pattern: /^3\.\s*_{3,}$/i, value: "No procede." },
  { id: "abnormal-parameters", pattern: /^7\.B\. PARÁMETROS OBJETIVOS PARA CONSIDERAR UNA OFERTA ANORMALMENTE BAJA/i, value: "Artículo 85 del RGLCAP, de conformidad con el artículo 149.2 de la LCSP." },
  { id: "tie-3", pattern: /^3\.\s*_{3,}$/i, value: "No procede." },
  { id: "tie-4", pattern: /^4\.\s*_{3,}$/i, value: "No procede." },
  { id: "other-special-condition", pattern: /^Otras:\s*_{3,}$/i, value: "No procede." },
  { id: "essential-extra-1", pattern: /^-\s*_{3,}$/i, value: "No procede." },
  { id: "essential-extra-2", pattern: /^-\s*_{3,}$/i, value: "No procede." },
  { id: "grave-extra-1", pattern: /^-\s*_{3,}$/i, value: "No procede." },
  { id: "grave-extra-2", pattern: /^-\s*_{3,}$/i, value: "No procede." },
  { id: "critical-subcontracting-final", pattern: /^Determinadas tareas críticas, partes o trabajos/i, value: "No" },
  { id: "subcontract-offer-final", pattern: /^La persona licitadora debe indicar en la oferta/i, value: "No" },
  { id: "subcontract-servers-final", pattern: /^La persona contratista debe indicar si tiene previsto subcontratar los servidores/i, value: "No procede." },
  { id: "subcontract-security-final", pattern: /^La ejecución del contrato debe ir acompañada de medidas de seguridad especiales/i, value: "No" },
  { id: "subcontract-penalty-percent", pattern: /^Penalidad del\s+_{3,}\s*% del importe del subcontrato/i, value: "20" },
  { id: "direct-subcontractor-payments-final", pattern: /^Se prevén pagos directos a subcontratistas:/i, value: "No" },
  { id: "direct-subcontractor-regime", pattern: /^a\) Régimen de abono del precio:/i, value: "No procede." },
  { id: "direct-subcontractor-periodicity", pattern: /^b\) Periodicidad del pago:/i, value: "No procede." },
  { id: "direct-subcontractor-register", pattern: /^c\) Registro para presentación de facturas:/i, value: "No procede." },
  { id: "strict-subcontractor-payment-check", pattern: /^Comprobación por el órgano de contratación del estricto cumplimiento de los pagos/i, value: "No" },
  { id: "protected-employment-reserve", pattern: /^Reserva de un porcentaje mínimo de la ejecución de contratos en el marco de programas de empleo protegido:/i, value: "No" },
  { id: "protected-employment-percent", pattern: /^Porcentaje reservado:/i, value: "No procede." },
  { id: "protected-employment-controls", pattern: /^Mecanismos de control:/i, value: "No procede." },
  { id: "defective-light", pattern: /^a\) Incumplimientos leves:/i, value: "No procede." },
  { id: "defective-grave", pattern: /^b\) Incumplimientos graves:/i, value: "No procede." },
  { id: "defective-very-grave", pattern: /^c\) Incumplimientos muy graves:/i, value: "No procede." },
  { id: "payment-mode", pattern: /^Pago Único \/Pagos parciales:/i, value: "Pagos parciales" },
  { id: "payment-periodicity", pattern: /^En caso de pagos parciales, periodicidad:/i, value: "En función de los pedidos realizados y conformados." },
  { id: "conformity-deadline-final", pattern: /^Plazo para aprobar los documentos que acrediten la conformidad de la realización del objeto del contrato:/i, value: "Máximo 30 días naturales desde la entrega y recepción material." },
  { id: "preparatory-a", pattern: /^Operaciones preparatorias susceptibles de abonos a cuenta:/i, value: "No procede." },
  { id: "preparatory-b", pattern: /^Exigencia, en su caso, de un programa de trabajo:/i, value: "No procede." },
  { id: "preparatory-c", pattern: /^Criterios y forma de valoración de las operaciones preparatorias:/i, value: "No procede." },
  { id: "preparatory-d", pattern: /^Plan de amortización de los abonos a cuenta:/i, value: "No procede." },
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
    const openingEnd = xml.indexOf(">");
    if (openingEnd < 0) throw new Error("LB84: párrafo ODF real sin apertura.");
    const suffix = xml.endsWith("</text:p>") ? "</text:p>" : "";
    return `${xml.slice(0, openingEnd + 1)}${xmlEscape(currentVisible.replace(/Sí\s*\/\s*No/i, value))}${suffix}`;
  }
  const placeholder = xml.match(/_{3,}/)?.[0];
  if (placeholder) return xml.replace(placeholder, escaped);
  const closing = xml.lastIndexOf("</text:p>");
  if (closing < 0) throw new Error("LB84: párrafo ODF sin cierre.");
  if (currentVisible.includes(":")) return `${xml.slice(0, closing)} ${escaped}${xml.slice(closing)}`;
  throw new Error(`LB84: no se sabe materializar «${currentVisible}».`);
}

function applyStrictOrderedRules(content: string, rules: readonly SecondPassRule[]): { content: string; changed: number } {
  let cursor = lastActualAnnexStart(content, "I");
  let changed = 0;
  for (const rule of rules) {
    const annexIIStart = lastActualAnnexStart(content, "II");
    const section = content.slice(cursor, annexIIStart);
    const found = topLevelParagraphs(section).find(item => rule.pattern.test(visible(item.xml).trim()) && isUnresolvedVisible(visible(item.xml).trim()));
    if (!found) throw new Error(`LB73: no se localiza de forma ordenada el campo residual ${rule.id}.`);
    const absoluteStart = cursor + found.start;
    const newXml = materializeParagraphValue(found.xml, visible(found.xml).trim(), rule.value);
    content = content.slice(0, absoluteStart) + newXml + content.slice(absoluteStart + found.xml.length);
    cursor = absoluteStart + newXml.length;
    changed += 1;
  }
  return { content, changed };
}

function applyResidualRules(content: string, rules: readonly SecondPassRule[]): { content: string; changed: number } {
  let changed = 0;
  for (const rule of rules) {
    const annexIStart = lastActualAnnexStart(content, "I");
    const annexIIStart = lastActualAnnexStart(content, "II");
    const section = content.slice(annexIStart, annexIIStart);
    const found = topLevelParagraphs(section).find(item => rule.pattern.test(visible(item.xml).trim()) && isUnresolvedVisible(visible(item.xml).trim()));
    if (!found) continue;
    const absoluteStart = annexIStart + found.start;
    const newXml = materializeParagraphValue(found.xml, visible(found.xml).trim(), rule.value);
    content = content.slice(0, absoluteStart) + newXml + content.slice(absoluteStart + found.xml.length);
    changed += 1;
  }
  return { content, changed };
}

function applyFinalAuthorityClosure(content: string, caseId: string, title: string): { content: string; changed: number } {
  const runtimeRules = FINAL_AUTHORITY_RULES.map(rule => rule.id === "anexo-i-title" ? { ...rule, value: title } : rule.id === "anexo-i-file" ? { ...rule, value: caseId } : rule);
  let next = applyResidualRules(content, runtimeRules);
  const annexIStart = lastActualAnnexStart(next.content, "I");
  const annexIIStart = lastActualAnnexStart(next.content, "II");
  const before = next.content.slice(annexIStart, annexIIStart);
  const fixed = before.replace("Tramitación del gasto: Ordinaria/Anticipada.", "Tramitación del gasto: Ordinaria.");
  if (fixed !== before) next = { content: next.content.slice(0, annexIStart) + fixed + next.content.slice(annexIIStart), changed: next.changed + 1 };
  return next;
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
  const secondPass = applyStrictOrderedRules(content, SECOND_PASS_RULES);
  const finalClosure = applyFinalAuthorityClosure(secondPass.content, caseId, title);
  content = finalClosure.content;

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

  const anexoIStart = lastActualAnnexStart(content, "I");
  const anexoIIStart = lastActualAnnexStart(content, "II");
  const anexoIParagraphs = topLevelParagraphs(content.slice(anexoIStart, anexoIIStart));
  const section15Index = anexoIParagraphs.findIndex(item => /^15\.\s+TRATAMIENTO DE DATOS/i.test(visible(item.xml).trim()));
  const authorityParagraphs = section15Index >= 0 ? anexoIParagraphs.slice(0, section15Index) : anexoIParagraphs;
  const unresolvedAuthority = authorityParagraphs.map(item => visible(item.xml).trim()).filter(value => /(?:Sí\s*\/\s*No|_{3,})/i.test(value));
  if (unresolvedAuthority.length) blockers.push(`PCAP: quedan ${unresolvedAuthority.length} decisiones administrativas sin materializar antes del apartado 15 del Anexo I (primera: ${unresolvedAuthority[0]}).`);
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
    materializedSecondPassParagraphs: secondPass.changed + finalClosure.changed,
  };
}