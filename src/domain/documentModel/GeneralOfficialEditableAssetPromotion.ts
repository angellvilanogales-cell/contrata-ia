import { SourceBackedDocumentAsset } from "./SourceBackedDocumentAssetCatalogue";

export interface GeneralOfficialAssetPromotionResult {
  promotable: boolean;
  blockers: readonly string[];
}

function validSha256(value?: string): boolean {
  return !!value && /^(sha256:)?[a-f0-9]{64}$/i.test(value.trim());
}

/**
 * Gate de promoción a biblioteca general. Evita que PDF, referencias estructurales
 * o activos ligados a un expediente concreto se presenten como plantilla universal.
 */
export function assessGeneralOfficialAssetPromotion(asset: SourceBackedDocumentAsset): GeneralOfficialAssetPromotionResult {
  const blockers: string[] = [];
  if (asset.scope !== "GENERAL_OFFICIAL") blockers.push("El activo no tiene alcance de modelo administrativo general.");
  if (asset.caseId) blockers.push("Un activo ligado a caseId no puede promocionarse como modelo general.");
  if (asset.verification !== "VERIFIED_EDITABLE") blockers.push("El activo general no consta verificado como editable.");
  if (asset.mediaType !== "ODT" && asset.mediaType !== "DOCX") blockers.push("La promoción general exige ODT o DOCX editable.");
  if (!asset.templateId?.trim()) blockers.push("Falta templateId estable del modelo general.");
  if (!validSha256(asset.sha256)) blockers.push("Falta SHA-256 válido del binario editable.");
  if (!validSha256(asset.styleFingerprint)) blockers.push("Falta huella de estilo válida del modelo editable.");
  if (!asset.generationCandidate) blockers.push("El activo no está habilitado como candidato de generación.");
  if (asset.applicableProcedures.length === 0) blockers.push("Debe delimitarse al menos un procedimiento acreditado.");
  return { promotable: blockers.length === 0, blockers };
}
