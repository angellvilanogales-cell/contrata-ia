import { RealTemplateSourceEvidence } from "../lb22/UniversalRealTemplateMappingRegistry";

export interface UniversalProductionRendererEvidence {
  source: RealTemplateSourceEvidence;
  binaryAcquired: boolean;
  contentHashVerified: boolean;
  styleFingerprintVerified: boolean;
  physicalBindingsVerified: boolean;
  rendererAuditPassed: boolean;
}

export interface UniversalProductionRendererClosureResult {
  engineeringReady: boolean;
  productionReady: boolean;
  blockers: readonly string[];
}

/**
 * LB23.5. Distingue renderer implementado/auditado de activación real de un
 * modelo. No permite declarar producción por disponer únicamente de URL, PDF,
 * copia derivada o tests sintéticos.
 */
export function evaluateUniversalProductionRendererClosure(
  evidence: UniversalProductionRendererEvidence,
): UniversalProductionRendererClosureResult {
  const blockers: string[] = [];
  const engineeringReady = evidence.rendererAuditPassed;
  if (!engineeringReady) blockers.push("El renderer de producción no ha superado todavía su auditoría técnica.");

  if (evidence.source.qualification !== "OFFICIAL_EDITABLE_ORIGINAL") {
    blockers.push(`La fuente ${evidence.source.sourceId} no está cualificada como original editable oficial.`);
  }
  if (!evidence.source.humanValidated || !evidence.source.validatedBy?.trim()) {
    blockers.push(`La procedencia/versionado de ${evidence.source.sourceId} no ha sido validada humanamente.`);
  }
  if (!evidence.binaryAcquired) blockers.push(`No se han incorporado los bytes del original editable ${evidence.source.sourceId}.`);
  if (!evidence.contentHashVerified) blockers.push(`No se ha verificado el SHA-256 del original ${evidence.source.sourceId}.`);
  if (!evidence.styleFingerprintVerified) blockers.push(`No se ha verificado la huella de estilo del original ${evidence.source.sourceId}.`);
  if (!evidence.physicalBindingsVerified) blockers.push(`Los bindings físicos de slots no se han contrastado sobre el XML del original ${evidence.source.sourceId}.`);

  return { engineeringReady, productionReady: engineeringReady && blockers.length === 0, blockers };
}
