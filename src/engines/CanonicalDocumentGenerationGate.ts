import { CanonicalExpedienteState, evaluateCanonicalPromotion } from "../domain/expediente/CanonicalExpedienteState";
import {
  ContractDocumentModelProfile,
  ContractDocumentModelProfileRegistry,
  DocumentModelCoverage,
} from "../domain/documentModel/ContractDocumentModelProfile";
import { DocumentDefinition } from "../domain/documentModel/DocumentDefinition";
import { DocumentType } from "../domain/documentModel/DocumentType";
import {
  CanonicalDocumentProfileSelection,
  selectCanonicalDocumentProfile,
} from "./CanonicalDocumentProfileSelector";

export interface CanonicalDocumentGenerationGateResult {
  ready: boolean;
  profile?: ContractDocumentModelProfile;
  definition?: DocumentDefinition;
  selection: CanonicalDocumentProfileSelection;
  blockers: readonly string[];
}

export function evaluateCanonicalDocumentGeneration(
  state: CanonicalExpedienteState,
  documentType: DocumentType,
  registry: ContractDocumentModelProfileRegistry,
  requiredCoverage: DocumentModelCoverage = "FULL_MODEL",
): CanonicalDocumentGenerationGateResult {
  const blockers: string[] = [];
  const promotion = evaluateCanonicalPromotion(state);

  if (!promotion.promotable) {
    blockers.push(...promotion.blockers);
  }

  const selection = selectCanonicalDocumentProfile(
    state,
    documentType,
    registry,
    requiredCoverage,
  );

  if (selection.status !== "SELECTED") {
    blockers.push(...selection.blockers);
  }

  if (requiredCoverage === "FULL_MODEL" && !selection.canGenerateFullDocument) {
    blockers.push(`La generación completa de ${documentType} no está habilitada para el perfil seleccionado.`);
  }

  const ready = blockers.length === 0 && Boolean(selection.profile);

  return {
    ready,
    profile: ready ? selection.profile : undefined,
    definition: ready ? selection.profile?.definition : undefined,
    selection,
    blockers,
  };
}
