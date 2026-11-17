import { DocumentType } from "./DocumentType";
import { TipoProcedimiento } from "../procedimiento/TipoProcedimiento";
import { UniversalTargetContractType } from "../capabilities/UniversalContractCoverage";
import { SOURCE_BACKED_DOCUMENT_ASSETS, SourceBackedDocumentAsset } from "./SourceBackedDocumentAssetCatalogue";

export interface DocumentAssetQuery {
  contractType: UniversalTargetContractType;
  documentType: DocumentType;
  procedure: TipoProcedimiento;
  caseId?: string;
}

export interface ClassifiedDocumentAsset {
  asset: SourceBackedDocumentAsset;
  usableForCase: boolean;
  usableAsGeneralModel: boolean;
  blockers: readonly string[];
}

/** LB91.27 — impide que coincidencias de familia/procedimiento borren el alcance del activo. */
export function classifyDocumentAssets(query: DocumentAssetQuery): readonly ClassifiedDocumentAsset[] {
  return SOURCE_BACKED_DOCUMENT_ASSETS
    .filter(asset => asset.contractType === query.contractType && asset.documentType === query.documentType)
    .map(asset => {
      const blockers: string[] = [];
      if (!asset.applicableProcedures.includes(query.procedure)) blockers.push(`El activo ${asset.id} no está acreditado para ${query.procedure}.`);
      if (asset.scope === "CASE_PROTECTED" && asset.caseId !== query.caseId) blockers.push(`El activo ${asset.id} pertenece al expediente protegido ${asset.caseId}.`);
      const usableForCase = blockers.length === 0 && asset.verification === "VERIFIED_EDITABLE" && asset.generationCandidate;
      const usableAsGeneralModel = blockers.length === 0
        && asset.scope === "GENERAL_OFFICIAL"
        && asset.verification === "VERIFIED_EDITABLE"
        && asset.generationCandidate;
      return { asset, usableForCase, usableAsGeneralModel, blockers };
    });
}

export function hasVerifiedGeneralEditableModel(query: Omit<DocumentAssetQuery, "caseId">): boolean {
  return classifyDocumentAssets(query).some(item => item.usableAsGeneralModel);
}
