import { DocumentType } from "./DocumentType";
import { SOURCE_BACKED_DOCUMENT_ASSETS, SourceBackedDocumentAsset } from "./SourceBackedDocumentAssetCatalogue";

export interface ProtectedEditableAssetManifestResult {
  caseId: string;
  ready: boolean;
  assets: readonly SourceBackedDocumentAsset[];
  blockers: readonly string[];
  humanAcceptanceRequired: true;
}

const REQUIRED = [DocumentType.MEMORY, DocumentType.PCAP, DocumentType.PPT] as const;

/** LB91.28 — manifiesto físico mínimo del expediente protegido. */
export function assessProtectedEditableAssetManifest(caseId: string): ProtectedEditableAssetManifestResult {
  const assets = SOURCE_BACKED_DOCUMENT_ASSETS.filter(asset => asset.scope === "CASE_PROTECTED" && asset.caseId === caseId);
  const blockers: string[] = [];

  for (const documentType of REQUIRED) {
    const candidates = assets.filter(asset => asset.documentType === documentType);
    if (candidates.length !== 1) blockers.push(`El expediente ${caseId} debe tener exactamente un activo protegido ${documentType}; encontrados ${candidates.length}.`);
    const asset = candidates[0];
    if (!asset) continue;
    if (asset.verification !== "VERIFIED_EDITABLE") blockers.push(`${asset.id} no consta como editable verificado.`);
    if (asset.mediaType !== "ODT" && asset.mediaType !== "DOCX") blockers.push(`${asset.id} no utiliza un formato editable admitido.`);
    if (!asset.sha256 || !/^[a-f0-9]{64}$/i.test(asset.sha256)) blockers.push(`${asset.id} carece de SHA-256 válido.`);
    if (!asset.styleFingerprint || !/^sha256:[a-f0-9]{64}$/i.test(asset.styleFingerprint)) blockers.push(`${asset.id} carece de huella de estilo válida.`);
    if (!asset.templateId || !asset.sourceId) blockers.push(`${asset.id} carece de identidad trazable de plantilla/fuente.`);
    if (!asset.generationCandidate) blockers.push(`${asset.id} no está habilitado ni siquiera como candidato del caso protegido.`);
  }

  return { caseId, ready: blockers.length === 0, assets, blockers, humanAcceptanceRequired: true };
}
