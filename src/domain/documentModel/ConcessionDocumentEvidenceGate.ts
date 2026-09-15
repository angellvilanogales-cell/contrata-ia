import { DocumentType } from "./DocumentType";
import { findDocumentAssets } from "./SourceBackedDocumentAssetCatalogue";

export interface ConcessionDocumentEvidenceResult {
  realCaseEvidenceLocated: boolean;
  editableModelLocated: boolean;
  blockers: readonly string[];
}

/**
 * La cobertura normativa de concesiones no se convierte en cobertura documental.
 * Hasta localizar una fuente real identificable y un activo editable general, el
 * pipeline de producción concesional permanece bloqueado.
 */
export function assessConcessionDocumentEvidence(): ConcessionDocumentEvidenceResult {
  const assets = [
    ...findDocumentAssets("CONCESSION", DocumentType.PCAP),
    ...findDocumentAssets("CONCESSION", DocumentType.MEMORY),
    ...findDocumentAssets("CONCESSION", DocumentType.PPT),
  ];
  const realCaseEvidenceLocated = assets.some(asset => asset.scope === "CASE_PROTECTED" || asset.scope === "STRUCTURAL_REFERENCE");
  const editableModelLocated = assets.some(asset => asset.scope === "GENERAL_OFFICIAL" && asset.verification === "VERIFIED_EDITABLE");
  const blockers: string[] = [];
  if (!realCaseEvidenceLocated) blockers.push("No consta todavía expediente/pliego real de concesión suficientemente identificado para regresión documental.");
  if (!editableModelLocated) blockers.push("No consta modelo general editable verificado de concesión para generación física.");
  return { realCaseEvidenceLocated, editableModelLocated, blockers };
}
