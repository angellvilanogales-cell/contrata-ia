import { CanonicalExpedienteState } from "../../domain/expediente/CanonicalExpedienteState";
import { isPromotableEvidenceField } from "../../domain/expediente/EvidenceField";
import { DocumentType } from "../../domain/documentModel/DocumentType";
import {
  FinancingProfile,
  TechnicalDocumentFamily,
} from "../../domain/documentModel/DocumentarySourceEvidenceCatalogue";
import {
  DocumentarySourceSelection,
  selectUniversalDocumentSource,
} from "../../domain/documentModel/UniversalDocumentSourceSelector";
import { TipoProcedimiento } from "../../domain/procedimiento/TipoProcedimiento";
import { UniversalTargetContractType } from "../../domain/capabilities/UniversalContractCoverage";

export interface CanonicalDocumentSelectionContext {
  financing?: FinancingProfile;
  technicalFamily?: TechnicalDocumentFamily;
}

export interface CanonicalUniversalDocumentSelection {
  readyForSelection: boolean;
  selection?: DocumentarySourceSelection;
  blockers: readonly string[];
}

const TARGET_TYPES = new Set<UniversalTargetContractType>([
  "SUPPLY",
  "SERVICE",
  "WORKS",
  "CONCESSION",
  "MIXED",
]);

const PROCEDURES = new Set<string>(Object.values(TipoProcedimiento));

/**
 * LB91.46 — frontera entre expediente canónico y biblioteca documental.
 * Solo usa tipo contractual y procedimiento cuando ya son promocionables.
 * Financiación y subfamilia se reciben como contexto documental explícito:
 * no se inventan ni se deducen del objeto/CPV.
 */
export function selectDocumentFromCanonicalExpediente(
  state: CanonicalExpedienteState,
  documentType: DocumentType,
  context: CanonicalDocumentSelectionContext = {},
): CanonicalUniversalDocumentSelection {
  const blockers: string[] = [];
  const contractTypeField = state.fields.contractType;
  const procedureField = state.fields.procedure;

  if (!isPromotableEvidenceField(contractTypeField)) blockers.push("El tipo contractual no está validado/promocionable.");
  if (!isPromotableEvidenceField(procedureField)) blockers.push("El procedimiento no está validado/promocionable.");
  if (blockers.length) return { readyForSelection: false, blockers };

  const contractType = contractTypeField.value;
  if (!TARGET_TYPES.has(contractType as UniversalTargetContractType)) {
    return { readyForSelection: false, blockers: [`Tipo contractual sin biblioteca universal: ${String(contractType)}.`] };
  }

  const procedure = String(procedureField.value);
  if (!PROCEDURES.has(procedure)) {
    return { readyForSelection: false, blockers: [`Procedimiento no reconocido por la biblioteca documental: ${procedure}.`] };
  }

  const selection = selectUniversalDocumentSource({
    contractType: contractType as UniversalTargetContractType,
    documentType,
    procedure: procedure as TipoProcedimiento,
    financing: context.financing,
    technicalFamily: context.technicalFamily,
  });

  return {
    readyForSelection: true,
    selection,
    blockers: selection.blockers,
  };
}
