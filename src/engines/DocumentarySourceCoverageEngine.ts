import { DocumentType } from "../domain/documentModel/DocumentType";
import {
  DocumentarySourceEvidence,
  findDocumentarySourceEvidence,
} from "../domain/documentModel/DocumentarySourceEvidenceCatalogue";
import { UniversalTargetContractType } from "../domain/capabilities/UniversalContractCoverage";

export type DocumentarySourceCoverageStatus =
  | "GENERAL_EDITABLE"
  | "CASE_EDITABLE"
  | "MULTI_SOURCE_STRUCTURAL"
  | "SOURCE_ONLY"
  | "MISSING";

export interface DocumentarySourceCoverageResult {
  contractType: UniversalTargetContractType;
  documentType: DocumentType;
  status: DocumentarySourceCoverageStatus;
  evidence: readonly DocumentarySourceEvidence[];
  physicalUniversalGenerationReady: boolean;
  blockers: readonly string[];
}

export function evaluateDocumentarySourceCoverage(
  contractType: UniversalTargetContractType,
  documentType: DocumentType,
): DocumentarySourceCoverageResult {
  const evidence = findDocumentarySourceEvidence(contractType, documentType);
  const blockers: string[] = [];

  if (evidence.length === 0) {
    return {
      contractType,
      documentType,
      status: "MISSING",
      evidence,
      physicalUniversalGenerationReady: false,
      blockers: [`No existe fuente documental acreditada para ${contractType}/${documentType}.`],
    };
  }

  const generalEditable = evidence.find(item => item.generalizable && item.editableBinaryVerified);
  if (generalEditable) {
    return {
      contractType,
      documentType,
      status: "GENERAL_EDITABLE",
      evidence,
      physicalUniversalGenerationReady: true,
      blockers: [],
    };
  }

  const editableCaseSources = evidence.filter(item => item.editableBinaryVerified);
  if (editableCaseSources.length > 0) {
    blockers.push("Solo existen activos editables de expediente o subfamilia concreta; falta acreditar un modelo general reutilizable.");
    return {
      contractType,
      documentType,
      status: "CASE_EDITABLE",
      evidence,
      physicalUniversalGenerationReady: false,
      blockers,
    };
  }

  if (evidence.length >= 2) {
    blockers.push("Existen varias fuentes reales suficientes para contraste estructural, pero ninguna plantilla general editable verificada.");
    return {
      contractType,
      documentType,
      status: "MULTI_SOURCE_STRUCTURAL",
      evidence,
      physicalUniversalGenerationReady: false,
      blockers,
    };
  }

  blockers.push("Existe fuente real, pero no un activo general editable verificado.");
  return {
    contractType,
    documentType,
    status: "SOURCE_ONLY",
    evidence,
    physicalUniversalGenerationReady: false,
    blockers,
  };
}

export interface DocumentaryPackageSourceReadiness {
  contractType: UniversalTargetContractType;
  documents: readonly DocumentarySourceCoverageResult[];
  physicalUniversalPackageReady: boolean;
  blockers: readonly string[];
}

export function evaluateDocumentaryPackageSourceReadiness(
  contractType: UniversalTargetContractType,
): DocumentaryPackageSourceReadiness {
  const required = [DocumentType.MEMORY, DocumentType.PCAP, DocumentType.PPT] as const;
  const documents = required.map(documentType => evaluateDocumentarySourceCoverage(contractType, documentType));
  const blockers = documents.flatMap(result => result.blockers.map(item => `${result.documentType}: ${item}`));
  return {
    contractType,
    documents,
    physicalUniversalPackageReady: documents.every(result => result.physicalUniversalGenerationReady),
    blockers,
  };
}
