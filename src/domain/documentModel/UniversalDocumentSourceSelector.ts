import { DocumentType } from "./DocumentType";
import { TipoProcedimiento } from "../procedimiento/TipoProcedimiento";
import { UniversalTargetContractType } from "../capabilities/UniversalContractCoverage";
import {
  DocumentarySourceEvidence,
  FinancingProfile,
  TechnicalDocumentFamily,
  findDocumentarySourcesByDimensions,
} from "./DocumentarySourceEvidenceCatalogue";

export type DocumentarySourceSelectionStatus =
  | "GENERAL_EDITABLE_SELECTED"
  | "CASE_EDITABLE_REFERENCE"
  | "STRUCTURAL_REFERENCE_ONLY"
  | "ISOLATION_REQUIRED"
  | "NO_MATCH";

export interface DocumentarySourceSelection {
  status: DocumentarySourceSelectionStatus;
  selected?: DocumentarySourceEvidence;
  candidates: readonly DocumentarySourceEvidence[];
  blockers: readonly string[];
}

/**
 * Selección conservadora por naturaleza, documento, procedimiento, financiación
 * y subfamilia técnica. Nunca promueve una fuente de expediente a plantilla general.
 */
export function selectUniversalDocumentSource(input: {
  contractType: UniversalTargetContractType;
  documentType: DocumentType;
  procedure?: TipoProcedimiento;
  financing?: FinancingProfile;
  technicalFamily?: TechnicalDocumentFamily;
}): DocumentarySourceSelection {
  const candidates = findDocumentarySourcesByDimensions(input);
  if (candidates.length === 0) {
    return { status: "NO_MATCH", candidates, blockers: ["No existe fuente documental acreditada para la combinación solicitada."] };
  }

  const general = candidates.find(item => item.generalizable && item.editableBinaryVerified && item.role === "GENERAL_MODEL");
  if (general) return { status: "GENERAL_EDITABLE_SELECTED", selected: general, candidates, blockers: [] };

  const pendingIsolation = candidates.find(item => item.role === "ISOLATION_PENDING");
  if (pendingIsolation) {
    return {
      status: "ISOLATION_REQUIRED",
      selected: pendingIsolation,
      candidates,
      blockers: ["La fuente potencialmente reutilizable debe aislarse y verificarse antes de habilitar generación física."],
    };
  }

  const caseEditable = candidates.find(item => item.editableBinaryVerified && item.role === "CASE_SOURCE");
  if (caseEditable) {
    return {
      status: "CASE_EDITABLE_REFERENCE",
      selected: caseEditable,
      candidates,
      blockers: ["Existe activo editable de expediente, pero no está acreditado como plantilla general."],
    };
  }

  return {
    status: "STRUCTURAL_REFERENCE_ONLY",
    selected: candidates[0],
    candidates,
    blockers: ["Las fuentes disponibles sirven para estructura/regresión, no para generación física universal."],
  };
}
