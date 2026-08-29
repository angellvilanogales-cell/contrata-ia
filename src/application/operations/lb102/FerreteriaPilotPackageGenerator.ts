import { createHash } from "node:crypto";
import type { UniversalEditableTemplateBinaryStore } from "../../intake/lb23/UniversalOdtProductionRenderer";
import { readOdtZip } from "../../intake/lb23/OdtPackageCodec";
import { renderFerreteriaProtectedMemory, renderFerreteriaProtectedPpt } from "../../intake/lb59/FerreteriaSourceBackedProtectedRenderers";
import { zipStoredFiles } from "../../intake/lb95/StoredZipPackage";
import { renderFerreteriaPilotPcap } from "./FerreteriaPilotPcapRenderer";
import { LB102_SUPPLY_FERRETERIA } from "./RealSupplyPilotSnapshots";

export interface FerreteriaPilotPackageResult {
  ready: boolean;
  fileName: string | null;
  bytes: Uint8Array | null;
  sha256: string | null;
  blockers: readonly string[];
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function textOf(bytes: Uint8Array): string {
  const content = readOdtZip(bytes).find(item => item.name === "content.xml");
  if (!content) return "";
  return Buffer.from(content.bytes).toString("utf8")
    .replace(/<text:tab[^>]*\/>/g, " ")
    .replace(/<text:line-break[^>]*\/>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/\s+/g, " ").trim();
}

function crossAudit(pcap: Uint8Array, memory: Uint8Array, ppt: Uint8Array): string[] {
  const blockers: string[] = [];
  const pcapText = textOf(pcap);
  const memoryText = textOf(memory);
  const pptText = textOf(ppt);
  const all = [pcapText, memoryText, pptText];
  for (const required of ["CONTR/2026/240267", "44316400-2"]) {
    for (const [index, value] of all.entries()) if (!value.includes(required)) blockers.push(`${["PCAP","MEMORIA","PPT"][index]}: falta identidad común ${required}.`);
  }
  for (const required of ["21.793,15", "18.160,96"]) {
    if (!pcapText.includes(required)) blockers.push(`PCAP: falta magnitud económica protegida ${required}.`);
    if (!memoryText.includes(required)) blockers.push(`MEMORIA: falta magnitud económica protegida ${required}.`);
  }
  if (memoryText.includes("25.325,86")) blockers.push("MEMORIA: persiste el valor estimado histórico descartado 25.325,86 €.");
  if (/no exhaustivo ni limitativo/i.test(memoryText) || /no exhaustivo ni limitativo/i.test(pptText)) blockers.push("MEMORIA/PPT: persiste una formulación incompatible con el catálogo cerrado.");
  if (!pptText.includes("ABRAZADERAS MANGUERA") || !pptText.includes("TALADRO PERCUTOR 2 BATERIAS 18V")) blockers.push("PPT: no se acredita materialización física del catálogo protegido de 98 referencias.");
  if (!pptText.includes("24 meses")) blockers.push("PPT: falta duración inicial protegida de 24 meses.");
  return blockers;
}

/**
 * Paquete físico del golden case Ferretería.
 * Nunca cae a plantillas generales: si faltan los ODT fuente exactos de Memoria
 * o PPT, devuelve MISSING_SOURCE y bloquea la aceptación humana.
 */
export async function generateFerreteriaPilotPackage(templateStore: UniversalEditableTemplateBinaryStore): Promise<FerreteriaPilotPackageResult> {
  try {
    const pcap = await renderFerreteriaPilotPcap({ record: LB102_SUPPLY_FERRETERIA, templateStore });
    if (!pcap.ready || !pcap.document) return { ready: false, fileName: null, bytes: null, sha256: null, blockers: pcap.blockers };

    let memory;
    let ppt;
    try {
      memory = await renderFerreteriaProtectedMemory(templateStore);
      ppt = await renderFerreteriaProtectedPpt(templateStore);
    } catch (error) {
      return {
        ready: false,
        fileName: null,
        bytes: null,
        sha256: null,
        blockers: [`MISSING_SOURCE: ${error instanceof Error ? error.message : String(error)}`],
      };
    }
    const blockers = [
      ...(!memory.auditReady ? memory.auditBlockers.map(item => `MEMORIA: ${item}`) : []),
      ...(!ppt.auditReady ? ppt.auditBlockers.map(item => `PPT: ${item}`) : []),
      ...crossAudit(pcap.document.bytes, memory.bytes, ppt.bytes),
    ];
    if (blockers.length) return { ready: false, fileName: null, bytes: null, sha256: null, blockers };

    const documents = [
      { kind: "PCAP" as const, fileName: pcap.document.fileName, bytes: pcap.document.bytes, sha256: pcap.document.sha256, provenance: "OFFICIAL_MODEL+FERRETERIA_LB60_SOURCE_BACKED_FINALIZATION" },
      { kind: "MEMORIA" as const, fileName: memory.fileName, bytes: memory.bytes, sha256: memory.renderedSha256, provenance: "FERRETERIA_SOURCE_V12+LB59_PROTECTED_RENDER" },
      { kind: "PPT" as const, fileName: ppt.fileName, bytes: ppt.bytes, sha256: ppt.renderedSha256, provenance: "FERRETERIA_SOURCE_V6+LB59_PROTECTED_RENDER" },
    ];
    const manifest = {
      caseId: "CONTR/2026/240267",
      profile: "FERRETERIA_SUPPLY_ASA_DA33_LB102_PROTECTED",
      generatedAt: new Date().toISOString(),
      documents: documents.map(({ kind, fileName, sha256: hash, provenance }) => ({ kind, fileName, sha256: hash, provenance, auditReady: true, blockers: [] })),
      crossDocumentAuditReady: true,
      blockers: [] as string[],
      humanAcceptanceRequired: true,
      productionReady: false,
    };
    const bytes = zipStoredFiles([
      ...documents.map(item => ({ name: item.fileName, bytes: item.bytes })),
      { name: "manifest.json", bytes: Buffer.from(JSON.stringify(manifest, null, 2), "utf8") },
    ]);
    return {
      ready: true,
      fileName: "Contrata-IA_CONTR-2026-240267_PCAP-Memoria-PPT.zip",
      bytes,
      sha256: sha256(bytes),
      blockers: [],
    };
  } catch (error) {
    return { ready: false, fileName: null, bytes: null, sha256: null, blockers: [error instanceof Error ? error.message : String(error)] };
  }
}
