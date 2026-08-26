import { EditableTemplateCandidateVersion } from "./EditableTemplateCandidateRegistry";

export interface EditableTemplatePromotionAssessment {
  promotable: boolean;
  blockers: readonly string[];
}

/** LB91.52 — una plantilla no pasa a producción sin binario aislado, procedencia, SHA y huella de estilo. */
export function assessEditableTemplatePromotion(candidate: EditableTemplateCandidateVersion): EditableTemplatePromotionAssessment {
  const blockers: string[] = [];
  if (candidate.status === "REJECTED") blockers.push("El candidato fue rechazado.");
  if (!candidate.isolatedBinaryVerified) blockers.push("El binario editable original no está aislado/verificado.");
  if (!candidate.provenanceVerified) blockers.push("La procedencia administrativa no está verificada.");
  if (!candidate.sha256?.trim()) blockers.push("Falta SHA-256 del binario verificado.");
  if (!candidate.styleFingerprint?.trim()) blockers.push("Falta huella de estilo del modelo editable.");
  if (candidate.status !== "PROMOTABLE") blockers.push("El estado del candidato no es PROMOTABLE.");
  return { promotable: blockers.length === 0, blockers };
}
