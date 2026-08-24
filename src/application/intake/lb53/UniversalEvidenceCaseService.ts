import type { EvidenceField } from "../../../domain/expediente/EvidenceField";
import { AdaptiveCaseStore } from "../../../infrastructure/operations/lb7/AdaptiveCaseStore";
import { declareUniversalUiEvidence, validateUniversalUiEvidence, type UniversalUiDraftMutation } from "./UniversalUiEvidenceDraft";

/**
 * Caso de uso de aplicación para la UI universal. Centraliza la escritura de evidencia
 * y evita que las rutas HTTP manipulen directamente JSON o estados de EvidenceField.
 */
export class UniversalEvidenceCaseService {
  constructor(private readonly store: AdaptiveCaseStore) {}

  list(caseId: string): Readonly<Record<string, EvidenceField<unknown>>> {
    return this.store.get(caseId).universalEvidence ?? {};
  }

  declare(caseId: string, mutation: UniversalUiDraftMutation, actorId: string) {
    const field = declareUniversalUiEvidence(mutation, actorId);
    const stored = this.store.saveUniversalEvidence(caseId, field);
    return { field, caseValue: stored } as const;
  }

  validate(caseId: string, fieldPath: string, reviewerId: string) {
    const current = this.list(caseId)[fieldPath];
    if (!current) throw new Error(`No existe evidencia universal declarada para ${fieldPath}.`);
    const field = validateUniversalUiEvidence(current, reviewerId);
    const stored = this.store.saveUniversalEvidence(caseId, field);
    return { field, caseValue: stored } as const;
  }
}
