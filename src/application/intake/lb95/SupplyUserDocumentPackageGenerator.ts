import { createHash } from "node:crypto";
import type { UniversalEditableTemplateBinaryStore } from "../lb23/UniversalOdtProductionRenderer";
import { readOdtZip } from "../lb23/OdtPackageCodec";
import type { UniversalEvidenceRecord } from "../lb52/UniversalEvidenceWorkspace";
import { generateSupplyGeneralEvidenceDocuments } from "../lb94/SupplyGeneralEvidenceDocumentGenerator";
import { renderSupplyAsaGeneralPcap, type SupplyAsaGeneralPcapResult } from "./SupplyAsaGeneralPcapRenderer";
import { zipStoredFiles } from "./StoredZipPackage";

export interface SupplyUserDocumentPackage {
  ready: boolean;
  fileName: string | null;
  mediaType: "application/zip";
  bytes: Uint8Array | null;
  sha256: string | null;
  manifest: null | {
    caseId: string;
    profile: "SUPPLY_ASA_AUTOFINANCED_LB95";
    generatedAt: string;
    documents: readonly { kind: "PCAP" | "MEMORIA" | "PPT"; fileName: string; sha256: string; provenance: string }[];
    crossDocumentAuditReady: boolean;
    blockers: readonly string[];
    humanAcceptanceRequired: true;
  };
  blockers: readonly string[];
}

export type SupplyPcapRenderer = (input: { record: UniversalEvidenceRecord; templateStore: UniversalEditableTemplateBinaryStore }) => Promise<SupplyAsaGeneralPcapResult>;

function sha256(bytes: Uint8Array): string { return createHash("sha256").update(bytes).digest("hex"); }
function textOf(bytes: Uint8Array): string {
  const entry = readOdtZip(bytes).find(item => item.name === "content.xml");
  if (!entry) return "";
  return Buffer.from(entry.bytes).toString("utf8")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, "\"").replace(/&apos;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\s+/g, " ").trim();
}
function normalized(value: unknown): string { return String(value ?? "").replace(/\s+/g, " ").trim(); }
function euro(cents: unknown): string {
  if (typeof cents !== "number" || !Number.isSafeInteger(cents)) return "";
  return new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
}

function crossAudit(record: UniversalEvidenceRecord, pcap: Uint8Array, memory: Uint8Array, ppt: Uint8Array): string[] {
  const blockers: string[] = [];
  const texts = { PCAP: textOf(pcap), MEMORIA: textOf(memory), PPT: textOf(ppt) };
  const object = normalized(record.fields.object?.value);
  const cpv = normalized(record.fields.cpvMain?.value);
  if (!object) blockers.push("Auditoría cruzada: falta objeto validado.");
  else for (const [kind, text] of Object.entries(texts)) if (!text.includes(object)) blockers.push(`${kind}: el objeto validado no aparece materializado.`);
  if (cpv) {
    if (!texts.PCAP.includes(cpv)) blockers.push("PCAP: el CPV validado no aparece materializado.");
    if (!texts.MEMORIA.includes(cpv)) blockers.push("MEMORIA: el CPV validado no aparece materializado.");
  }
  for (const [path, label] of [["baseTenderBudgetCents", "PBL"], ["economic.legalEstimatedValueCents", "VE"]] as const) {
    const formatted = euro(record.fields[path]?.value);
    if (!formatted) { blockers.push(`Auditoría cruzada: falta ${label} numérico validado.`); continue; }
    if (!texts.PCAP.includes(formatted)) blockers.push(`PCAP: no contiene ${label} ${formatted}.`);
    if (!texts.MEMORIA.includes(formatted)) blockers.push(`MEMORIA: no contiene ${label} ${formatted}.`);
  }
  return blockers;
}

export async function generateSupplyUserDocumentPackage(input: {
  record: UniversalEvidenceRecord;
  templateStore: UniversalEditableTemplateBinaryStore;
  pcapRenderer?: SupplyPcapRenderer;
}): Promise<SupplyUserDocumentPackage> {
  const blockers: string[] = [];
  const renderer = input.pcapRenderer ?? renderSupplyAsaGeneralPcap;
  const pcap = await renderer({ record: input.record, templateStore: input.templateStore });
  if (!pcap.ready || !pcap.document) blockers.push(...pcap.blockers.map(item => `PCAP: ${item}`));
  const general = await generateSupplyGeneralEvidenceDocuments({ record: input.record, templateStore: input.templateStore });
  if (!general.ready) blockers.push(...general.blockers);
  if (blockers.length || !pcap.document || general.documents.length !== 2) return { ready: false, fileName: null, mediaType: "application/zip", bytes: null, sha256: null, manifest: null, blockers };

  const memory = general.documents.find(item => item.kind === "MEMORY");
  const ppt = general.documents.find(item => item.kind === "PPT");
  if (!memory || !ppt) return { ready: false, fileName: null, mediaType: "application/zip", bytes: null, sha256: null, manifest: null, blockers: ["No se han producido Memoria y PPT generales."] };
  const crossBlockers = crossAudit(input.record, pcap.document.bytes, memory.bytes, ppt.bytes);
  blockers.push(...crossBlockers);
  if (blockers.length) return { ready: false, fileName: null, mediaType: "application/zip", bytes: null, sha256: null, manifest: null, blockers };

  const safeId = input.record.caseId.replaceAll("/", "-");
  const documents = [
    { kind: "PCAP" as const, fileName: pcap.document.fileName, bytes: pcap.document.bytes, sha256: pcap.document.sha256, provenance: "OFFICIAL_MODEL:JDA-PCAP-SUPPLY-ASA-AUTOFINANCED-2025-12-17" },
    { kind: "MEMORIA" as const, fileName: `Memoria_${safeId}.odt`, bytes: memory.bytes, sha256: sha256(memory.bytes), provenance: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE" },
    { kind: "PPT" as const, fileName: `PPT_${safeId}.odt`, bytes: ppt.bytes, sha256: sha256(ppt.bytes), provenance: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE" },
  ];
  const generatedAt = new Date().toISOString();
  const manifest = {
    caseId: input.record.caseId,
    profile: "SUPPLY_ASA_AUTOFINANCED_LB95" as const,
    generatedAt,
    documents: documents.map(({ kind, fileName, sha256: hash, provenance }) => ({ kind, fileName, sha256: hash, provenance })),
    crossDocumentAuditReady: true,
    blockers: [] as string[],
    humanAcceptanceRequired: true as const,
  };
  const zip = zipStoredFiles([
    ...documents.map(item => ({ name: item.fileName, bytes: item.bytes })),
    { name: "manifest.json", bytes: Buffer.from(JSON.stringify(manifest, null, 2), "utf8") },
  ]);
  return {
    ready: true,
    fileName: `Contrata-IA_${safeId}_PCAP-Memoria-PPT.zip`,
    mediaType: "application/zip",
    bytes: zip,
    sha256: sha256(zip),
    manifest,
    blockers: [],
  };
}
