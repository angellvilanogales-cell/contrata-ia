import { DocumentType } from "./DocumentType";
import { TipoProcedimiento } from "../procedimiento/TipoProcedimiento";
import { UniversalTargetContractType } from "../capabilities/UniversalContractCoverage";
import { classifyDocumentAssets } from "./UniversalDocumentAssetClassifier";

export interface UniversalPhysicalModelReadinessInput {
  contractType: UniversalTargetContractType;
  procedure: TipoProcedimiento;
  requiredDocuments?: readonly DocumentType[];
}

export interface UniversalPhysicalModelReadinessResult {
  ready: boolean;
  readyDocuments: readonly DocumentType[];
  blockers: readonly string[];
  humanValidationRequired: true;
}

/**
 * LB91.29 — cobertura física UNIVERSAL significa modelo general editable
 * verificado. Nunca cuenta un activo de caso protegido como cobertura general.
 */
export function assessUniversalPhysicalModelReadiness(input: UniversalPhysicalModelReadinessInput): UniversalPhysicalModelReadinessResult {
  const required = input.requiredDocuments ?? [DocumentType.MEMORY, DocumentType.PCAP, DocumentType.PPT];
  const readyDocuments: DocumentType[] = [];
  const blockers: string[] = [];

  for (const documentType of required) {
    const classified = classifyDocumentAssets({ contractType: input.contractType, documentType, procedure: input.procedure });
    if (classified.some(item => item.usableAsGeneralModel)) readyDocuments.push(documentType);
    else blockers.push(`No existe modelo general editable verificado para ${input.contractType}/${input.procedure}/${documentType}.`);
  }

  return { ready: blockers.length === 0, readyDocuments, blockers, humanValidationRequired: true };
}
