import { createHash } from "node:crypto";
import { readOdtZip, type OdtZipEntry } from "../lb23/OdtPackageCodec";
import { computeOdtStyleFingerprint } from "../lb23/UniversalOdtProductionRenderer";
import { getServiceGeneralTemplate, type ServiceGeneralTemplateKind, type ServiceGeneralTemplateManifestRecord } from "./ServiceGeneralTemplateManifest";

export interface ServiceGeneralTemplatePhysicalGateResult {
  kind: ServiceGeneralTemplateKind;
  templateId: string;
  ready: boolean;
  actualSha256: string;
  actualStyleFingerprint: string | null;
  byteLength: number;
  discoveredSlots: readonly string[];
  blockers: readonly string[];
  provenance: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE";
  officialModel: false;
  humanValidationRequired: true;
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function entry(entries: readonly OdtZipEntry[], name: string): OdtZipEntry {
  const found = entries.find(item => item.name === name);
  if (!found) throw new Error(`ODT inválido: falta ${name}.`);
  return found;
}

function text(entries: readonly OdtZipEntry[], name: string): string {
  return Buffer.from(entry(entries, name).bytes).toString("utf8");
}

function slots(contentXml: string): string[] {
  return [...contentXml.matchAll(/\{\{([A-Za-z0-9.]+)\}\}/g)].map(match => match[1]!).sort();
}

function sameStrings(a: readonly string[], b: readonly string[]): boolean {
  return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
}

/**
 * Gate físico LB96. No confía en nombre de fichero ni en metadatos externos:
 * valida el paquete ODT, SHA-256, huella de estilo y el inventario exacto de
 * slots contra el manifiesto Service previamente acreditado.
 */
export function evaluateServiceGeneralTemplateBytes(
  manifest: ServiceGeneralTemplateManifestRecord,
  bytes: Uint8Array,
): ServiceGeneralTemplatePhysicalGateResult {
  const blockers: string[] = [];
  const actualSha256 = sha256(bytes);
  let actualStyleFingerprint: string | null = null;
  let discoveredSlots: string[] = [];

  if (bytes.byteLength < 100 || bytes.byteLength > 2_000_000) {
    blockers.push("El tamaño del activo Service está fuera del rango físico permitido.");
  }
  if (actualSha256 !== manifest.expectedSha256) {
    blockers.push(`El SHA-256 del ${manifest.kind} Service no coincide con el manifiesto LB96.`);
  }

  try {
    const entries = readOdtZip(bytes);
    const mime = text(entries, "mimetype").trim();
    if (mime !== manifest.mediaType) blockers.push(`El media type físico del ${manifest.kind} Service no es ODT editable de texto.`);
    entry(entries, "content.xml");
    entry(entries, "styles.xml");
    entry(entries, "META-INF/manifest.xml");
    const content = text(entries, "content.xml");
    discoveredSlots = slots(content);
    if (!sameStrings(discoveredSlots, manifest.slots)) {
      blockers.push(`El inventario físico de slots del ${manifest.kind} Service no coincide con el manifiesto LB96.`);
    }
    for (const slot of manifest.slots) {
      const token = `{{${slot}}}`;
      const occurrences = content.split(token).length - 1;
      if (occurrences !== 1) blockers.push(`El slot ${slot} debe aparecer exactamente una vez en el ${manifest.kind} Service; aparecen ${occurrences}.`);
    }
    actualStyleFingerprint = computeOdtStyleFingerprint(entries);
    if (actualStyleFingerprint !== manifest.expectedStyleFingerprint) {
      blockers.push(`La huella de estilo del ${manifest.kind} Service no coincide con el manifiesto LB96.`);
    }
  } catch (error) {
    blockers.push(error instanceof Error ? error.message : String(error));
  }

  if (manifest.provenance !== "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE" || manifest.officialModel !== false || manifest.humanValidationRequired !== true) {
    blockers.push("La procedencia declarada del activo Service no respeta la política LB96.");
  }

  return {
    kind: manifest.kind,
    templateId: manifest.templateId,
    ready: blockers.length === 0,
    actualSha256,
    actualStyleFingerprint,
    byteLength: bytes.byteLength,
    discoveredSlots,
    blockers,
    provenance: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",
    officialModel: false,
    humanValidationRequired: true,
  };
}

export function gateServiceGeneralTemplate(kind: ServiceGeneralTemplateKind, bytes: Uint8Array): ServiceGeneralTemplatePhysicalGateResult {
  return evaluateServiceGeneralTemplateBytes(getServiceGeneralTemplate(kind), bytes);
}
