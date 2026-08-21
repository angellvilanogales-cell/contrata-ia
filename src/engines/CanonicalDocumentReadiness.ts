import { CanonicalExpedienteState, evaluateCanonicalPromotion } from "../domain/expediente/CanonicalExpedienteState";
import { DocumentModelEngine } from "../domain/documentModel/DocumentModelEngine";
import { DocumentType } from "../domain/documentModel/DocumentType";

export interface CanonicalDocumentReadinessResult {
  ready: boolean;
  modelAvailable: boolean;
  blockers: readonly string[];
}

export function evaluateDocumentReadiness(
  state: CanonicalExpedienteState,
  documentType: DocumentType,
  documentModelEngine: Pick<DocumentModelEngine, "exists">,
): CanonicalDocumentReadinessResult {
  const blockers: string[] = [];
  const promotion = evaluateCanonicalPromotion(state);

  if (!promotion.promotable) {
    blockers.push(...promotion.blockers);
  }

  const modelAvailable = documentModelEngine.exists(documentType);
  if (!modelAvailable) {
    blockers.push(`Modelo documental no registrado: ${documentType}`);
  }

  return {
    ready: blockers.length === 0,
    modelAvailable,
    blockers,
  };
}
