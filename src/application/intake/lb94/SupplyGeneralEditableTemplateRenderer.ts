import { createHash } from "node:crypto";
import { readOdtZip, writeOdtZip, type OdtZipEntry } from "../lb23/OdtPackageCodec";
import { computeOdtStyleFingerprint } from "../lb23/UniversalOdtProductionRenderer";
import type { SupplyDerivedTemplateEvidence, SupplyGeneralTemplateKind } from "./SupplyGeneralEditableTemplateDerivation";

export interface SupplyGeneralTemplateValue {
  slotId: string;
  value: unknown;
}

export interface SupplyGeneralTableValue {
  kind: "ODT_TABLE";
  name: string;
  headers: readonly string[];
  rows: readonly (readonly string[])[];
}

export interface SupplyGeneralRenderedDocument {
  kind: SupplyGeneralTemplateKind;
  templateId: string;
  fileName: string;
  mediaType: "application/vnd.oasis.opendocument.text";
  bytes: Uint8Array;
  sourceTemplateSha256: string;
  renderedSha256: string;
  styleFingerprint: string;
  appliedSlots: readonly string[];
  humanValidationRequired: true;
}

export type SupplyGeneralValueFormatter = (value: unknown) => string;

function hash(bytes: Uint8Array): string { return createHash("sha256").update(bytes).digest("hex"); }
function xmlEscape(value: string): string { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;"); }
function entry(entries: readonly OdtZipEntry[], name: string): OdtZipEntry { const found = entries.find(item => item.name === name); if (!found) throw new Error(`ODT inválido: falta ${name}.`); return found; }
function replace(entries: readonly OdtZipEntry[], name: string, text: string): OdtZipEntry[] { return entries.map(item => item.name === name ? { ...item, bytes: Buffer.from(text, "utf8") } : item); }
function count(text: string, token: string): number { if (!token) return 0; let total = 0; let cursor = 0; while ((cursor = text.indexOf(token, cursor)) >= 0) { total += 1; cursor += token.length; } return total; }

function isTableValue(value: unknown): value is SupplyGeneralTableValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const table = value as Partial<SupplyGeneralTableValue>;
  return table.kind === "ODT_TABLE" && typeof table.name === "string" && Array.isArray(table.headers) && Array.isArray(table.rows);
}

function tableXml(value: SupplyGeneralTableValue, slotId: string): string {
  if (!value.headers.length || value.headers.length > 8) throw new Error(`La tabla ${slotId} debe tener entre una y ocho columnas.`);
  if (!value.rows.length) throw new Error(`La tabla ${slotId} no contiene filas.`);
  if (value.rows.some(row => row.length !== value.headers.length)) throw new Error(`La tabla ${slotId} contiene filas con un número de columnas incoherente.`);
  const cell = (text: string, header = false) => `<table:table-cell office:value-type="string"><text:p${header ? ' text:style-name="CI_LB105_Heading2"' : ' text:style-name="CI_LB105_Body"'}>${xmlEscape(text)}</text:p></table:table-cell>`;
  const row = (values: readonly string[], header = false) => `<table:table-row>${values.map(item => cell(item, header)).join("")}</table:table-row>`;
  return `<table:table table:name="${xmlEscape(value.name)}"><table:table-header-rows>${row(value.headers, true)}</table:table-header-rows><table:table-rows>${value.rows.map(item => row(item)).join("")}</table:table-rows></table:table>`;
}

function formatDefault(value: unknown, slotId: string): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`El slot ${slotId} contiene un número no finito.`);
    return String(value);
  }
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (Array.isArray(value) && value.every(item => ["string", "number", "boolean"].includes(typeof item))) {
    return value.map(item => typeof item === "boolean" ? (item ? "Sí" : "No") : String(item)).join("; ");
  }
  throw new Error(`El slot estructurado ${slotId} exige formateador documental explícito.`);
}

export function renderSupplyGeneralEditableTemplate(input: {
  template: SupplyDerivedTemplateEvidence;
  values: readonly SupplyGeneralTemplateValue[];
  formatters?: Readonly<Record<string, SupplyGeneralValueFormatter>>;
  caseId: string;
}): SupplyGeneralRenderedDocument {
  if (!input.template.ready) throw new Error(`La plantilla derivada ${input.template.templateId} no está acreditada: ${input.template.blockers.join("; ")}`);
  if (!input.caseId.trim()) throw new Error("El render Supply exige identificador de expediente.");
  let entries = readOdtZip(input.template.bytes);
  const initialStyle = computeOdtStyleFingerprint(entries);
  if (initialStyle !== input.template.derivedStyleFingerprint) throw new Error("La huella de estilo de la plantilla derivada no coincide con su acreditación.");
  let content = Buffer.from(entry(entries, "content.xml").bytes).toString("utf8");

  const bySlot = new Map(input.values.map(item => [item.slotId, item.value] as const));
  bySlot.set("caseId", input.caseId);
  const placeholders: string[] = [...content.matchAll(/\{\{([A-Za-z0-9.]+)\}\}/g)].map(match => match[1]!);
  const unique: string[] = [...new Set(placeholders)];
  if (unique.length !== placeholders.length) throw new Error("La plantilla general contiene slots físicos duplicados; cada slot debe tener un anclaje único.");

  const applied: string[] = [];
  for (const slotId of unique) {
    if (!bySlot.has(slotId)) throw new Error(`Falta valor documental para el slot obligatorio ${slotId}.`);
    const token = `{{${slotId}}}`;
    if (count(content, token) !== 1) throw new Error(`El slot ${slotId} no tiene anclaje físico único.`);
    const rawValue = bySlot.get(slotId);
    if (isTableValue(rawValue)) {
      const paragraphPattern = new RegExp(`<text:p\\b[^>]*>\\s*${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*</text:p>`);
      if (!paragraphPattern.test(content)) throw new Error(`El slot tabular ${slotId} debe ocupar un párrafo físico independiente.`);
      content = content.replace(paragraphPattern, tableXml(rawValue, slotId));
    } else {
      const formatter = input.formatters?.[slotId];
      const formatted = formatter ? formatter(rawValue) : formatDefault(rawValue, slotId);
      content = content.replace(token, xmlEscape(formatted));
    }
    applied.push(slotId);
  }

  if (/\{\{[A-Za-z0-9.]+\}\}/.test(content)) throw new Error("El render deja slots documentales pendientes.");
  entries = replace(entries, "content.xml", content);
  const renderedStyle = computeOdtStyleFingerprint(entries);
  if (renderedStyle !== initialStyle) throw new Error("El render Supply alteró la huella física de estilos de la plantilla.");
  const bytes = writeOdtZip(entries);
  const safeId = input.caseId.replace(/[^A-Za-z0-9._-]+/g, "-");
  return {
    kind: input.template.kind,
    templateId: input.template.templateId,
    fileName: `${safeId}_${input.template.kind === "MEMORY" ? "Memoria_Justificativa" : "PPT"}_Contrata-IA.odt`,
    mediaType: "application/vnd.oasis.opendocument.text",
    bytes,
    sourceTemplateSha256: input.template.derivedSha256,
    renderedSha256: hash(bytes),
    styleFingerprint: renderedStyle,
    appliedSlots: applied,
    humanValidationRequired: true,
  };
}
