import { createHash } from "node:crypto";
import type { UniversalEditableTemplateBinaryStore } from "../lb23/UniversalOdtProductionRenderer";
import { readOdtZip, writeOdtZip, type OdtZipEntry } from "../lb23/OdtPackageCodec";
import { computeOdtStyleFingerprint } from "../lb23/UniversalOdtProductionRenderer";
import { gateServiceGeneralTemplate } from "./ServiceGeneralTemplatePhysicalGate";
import { getServiceGeneralTemplate, type ServiceGeneralTemplateKind } from "./ServiceGeneralTemplateManifest";

export interface ServiceTemplateValue { slotId: string; value: string; }
export interface ServiceRenderedEditableDocument {
  kind: ServiceGeneralTemplateKind;
  templateId: string;
  fileName: string;
  mediaType: "application/vnd.oasis.opendocument.text";
  bytes: Uint8Array;
  sourceTemplateSha256: string;
  renderedSha256: string;
  styleFingerprint: string;
  appliedSlots: readonly string[];
  provenance: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE";
  officialModel: false;
  humanValidationRequired: true;
}

function hash(bytes: Uint8Array): string { return createHash("sha256").update(bytes).digest("hex"); }
function xmlEscape(value: string): string { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;"); }
function getEntry(entries: readonly OdtZipEntry[], name: string): OdtZipEntry { const found = entries.find(item => item.name === name); if (!found) throw new Error(`ODT Service inválido: falta ${name}.`); return found; }
function replaceEntry(entries: readonly OdtZipEntry[], name: string, value: string): OdtZipEntry[] { return entries.map(item => item.name === name ? { ...item, bytes: Buffer.from(value, "utf8") } : item); }

export async function renderServiceGeneralEditableTemplate(input: {
  kind: ServiceGeneralTemplateKind;
  values: readonly ServiceTemplateValue[];
  templateStore: UniversalEditableTemplateBinaryStore;
  caseId: string;
}): Promise<ServiceRenderedEditableDocument> {
  const manifest = getServiceGeneralTemplate(input.kind);
  const source = await input.templateStore.get(manifest.templateId);
  if (!source) throw new Error(`No está persistida la plantilla ${input.kind} Service ${manifest.templateId}.`);
  const physical = gateServiceGeneralTemplate(input.kind, source.bytes);
  if (!physical.ready) throw new Error(`Gate físico Service rechazado para ${input.kind}: ${physical.blockers.join(" | ")}`);

  let entries = readOdtZip(source.bytes);
  const initialStyle = computeOdtStyleFingerprint(entries);
  let content = Buffer.from(getEntry(entries, "content.xml").bytes).toString("utf8");
  const values = new Map(input.values.map(item => [item.slotId, item.value] as const));
  values.set("caseId", input.caseId);
  const applied: string[] = [];

  for (const slot of manifest.slots) {
    if (!values.has(slot)) throw new Error(`Falta valor documental Service para el slot obligatorio ${slot}.`);
    const token = `{{${slot}}}`;
    const occurrences = content.split(token).length - 1;
    if (occurrences !== 1) throw new Error(`El slot ${slot} aparece ${occurrences} veces en ${input.kind}; se exige una única ancla física.`);
    const value = values.get(slot) ?? "";
    if (!value.trim()) throw new Error(`El slot obligatorio ${slot} no puede materializarse vacío.`);
    content = content.replace(token, xmlEscape(value));
    applied.push(slot);
  }
  if (/\{\{[A-Za-z0-9.]+\}\}/.test(content)) throw new Error(`El render ${input.kind} deja slots Service pendientes.`);
  entries = replaceEntry(entries, "content.xml", content);
  const renderedStyle = computeOdtStyleFingerprint(entries);
  if (renderedStyle !== initialStyle) throw new Error(`El render ${input.kind} alteró la huella física de estilos.`);
  const bytes = writeOdtZip(entries);
  const safeId = input.caseId.replace(/[^A-Za-z0-9._-]+/g, "-");
  const suffix = input.kind === "MEMORY" ? "Memoria_Justificativa" : input.kind === "PCAP" ? "PCAP" : "PPT";
  return {
    kind: input.kind,
    templateId: manifest.templateId,
    fileName: `${safeId}_${suffix}_Service_Contrata-IA.odt`,
    mediaType: manifest.mediaType,
    bytes,
    sourceTemplateSha256: manifest.expectedSha256,
    renderedSha256: hash(bytes),
    styleFingerprint: renderedStyle,
    appliedSlots: applied,
    provenance: manifest.provenance,
    officialModel: false,
    humanValidationRequired: true,
  };
}
