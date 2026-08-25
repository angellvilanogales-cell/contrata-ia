import { CanonicalExpedienteState } from "../domain/expediente/CanonicalExpedienteState";
import { isPromotableEvidenceField } from "../domain/expediente/EvidenceField";
import {
  ContractDocumentModelProfile,
  ContractDocumentModelProfileRegistry,
  DocumentModelCoverage,
} from "../domain/documentModel/ContractDocumentModelProfile";
import { DocumentType } from "../domain/documentModel/DocumentType";
import { TipoProcedimiento } from "../domain/procedimiento/TipoProcedimiento";

export type CanonicalDocumentProfileSelectionStatus =
  | "SELECTED"
  | "BLOCKED_BY_EVIDENCE"
  | "BLOCKED_BY_PROCEDURE"
  | "BLOCKED_BY_COVERAGE"
  | "NOT_FOUND";

export interface CanonicalDocumentProfileSelection {
  status: CanonicalDocumentProfileSelectionStatus;
  profile?: ContractDocumentModelProfile;
  requiredCoverage: DocumentModelCoverage;
  canGenerateFullDocument: boolean;
  blockers: readonly string[];
}

const COVERAGE_RANK: Record<DocumentModelCoverage, number> = {
  ANNEX_I_ONLY: 1,
  STRUCTURAL_MODEL: 2,
  FULL_MODEL: 3,
};

function meetsCoverage(actual: DocumentModelCoverage, required: DocumentModelCoverage): boolean {
  return COVERAGE_RANK[actual] >= COVERAGE_RANK[required];
}

export function selectCanonicalDocumentProfile(
  state: CanonicalExpedienteState,
  documentType: DocumentType,
  registry: ContractDocumentModelProfileRegistry,
  requiredCoverage: DocumentModelCoverage = "FULL_MODEL",
): CanonicalDocumentProfileSelection {
  const blockers: string[] = [];
  const contractTypeField = state.fields.contractType;
  const procedureField = state.fields.procedure;

  if (!isPromotableEvidenceField(contractTypeField) || !contractTypeField.value) {
    blockers.push("El tipo de contrato no está validado para selección documental.");
  }

  if (!isPromotableEvidenceField(procedureField) || !procedureField.value) {
    blockers.push("El procedimiento no está validado para selección documental.");
  }

  if (blockers.length > 0) {
    return {
      status: "BLOCKED_BY_EVIDENCE",
      requiredCoverage,
      canGenerateFullDocument: false,
      blockers,
    };
  }

  const contractType = contractTypeField.value;
  const procedure = procedureField.value as TipoProcedimiento;
  const candidates = registry.findAll(contractType, documentType);

  if (candidates.length === 0) {
    return {
      status: "NOT_FOUND",
      requiredCoverage,
      canGenerateFullDocument: false,
      blockers: [`No existe perfil documental para ${contractType}/${documentType}.`],
    };
  }

  const procedureCompatible = candidates.filter(profile => {
    if (!profile.applicableProcedures || profile.applicableProcedures.length === 0) return true;
    return profile.applicableProcedures.includes(procedure);
  });

  if (procedureCompatible.length === 0) {
    return {
      status: "BLOCKED_BY_PROCEDURE",
      requiredCoverage,
      canGenerateFullDocument: false,
      blockers: [
        `Existe modelo para ${contractType}/${documentType}, pero no está acreditado para el procedimiento ${procedure}.`,
      ],
    };
  }

  const coverageCompatible = procedureCompatible
    .filter(profile => meetsCoverage(profile.coverage, requiredCoverage))
    .sort((a, b) => COVERAGE_RANK[b.coverage] - COVERAGE_RANK[a.coverage]);

  if (coverageCompatible.length === 0) {
    const available = procedureCompatible.map(profile => `${profile.id}:${profile.coverage}`).join(", ");
    return {
      status: "BLOCKED_BY_COVERAGE",
      requiredCoverage,
      canGenerateFullDocument: false,
      blockers: [
        `La cobertura disponible no alcanza ${requiredCoverage}. Perfiles disponibles: ${available}.`,
      ],
    };
  }

  const profile = coverageCompatible[0];
  const canGenerateFullDocument =
    profile.coverage === "FULL_MODEL" &&
    profile.generationAllowed &&
    requiredCoverage === "FULL_MODEL";

  return {
    status: "SELECTED",
    profile,
    requiredCoverage,
    canGenerateFullDocument,
    blockers: [],
  };
}
