import { createHash } from "node:crypto";
import { OdtZipEntry, readOdtZip, writeOdtZip } from "../lb23/OdtPackageCodec";
import { computeOdtStyleFingerprint } from "../lb23/UniversalOdtProductionRenderer";
import { auditJdaSupplyAsaRenderedOdt } from "../lb35/JuntaSupplyAsaAnexoIResidualAudit";
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
  return xml.replace(/<text:tab[^>]*\/>/g, "\t").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&apos;/g, "'");
}

function mapParagraphs(content: string, mapper: (xml: string, visibleText: string) => string): { content: string; changed: number } {
  let changed = 0;
  const next = content.replace(/<text:p\b[^>]*>[\s\S]*?<\/text:p>/g, paragraph => {
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

  const annexIIMarker = content.lastIndexOf("ANEXO II");
  if (annexIIMarker < 0) throw new Error("PCAP: no se localiza el inicio de anexos de licitadores.");
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
  const anexoVIndex = finalText.indexOf("ANEXO V");
  const anexoVIIndex = finalText.indexOf("ANEXO VI", anexoVIndex + 1);
  const anexoVText = anexoVIndex >= 0 ? finalText.slice(anexoVIndex, anexoVIIndex > anexoVIndex ? anexoVIIndex : undefined) : "";
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
  };
}
