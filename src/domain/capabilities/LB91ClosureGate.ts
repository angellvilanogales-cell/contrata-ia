import { canClaimUniversalOperationalCoverage } from "./UniversalContractCoverage";

export type LB91ExternalBlockerId =
  | "UNIVERSAL_EDITABLE_TEMPLATE_COVERAGE"
  | "CONCESSION_REAL_DOCUMENTARY_CASE"
  | "DEPLOYED_PERSISTENCE_RESTART_RECOVERY"
  | "KNOWLEDGE_PROVENANCE_QUARANTINE"
  | "INSTITUTIONAL_SECURITY_PRIVACY_REVIEW";

export interface LB91ClosureInput {
  coreUniversalEnginesImplemented: boolean;
  familyPreparationImplemented: boolean;
  documentSelectionGuarded: boolean;
  physicalRenderGuarded: boolean;
  crossDocumentAuditImplemented: boolean;
  supplyMultiCaseCorpusImplemented: boolean;
  supplyVariantIsolationImplemented: boolean;
  ciGreen: boolean;
  resolvedExternalBlockers?: readonly LB91ExternalBlockerId[];
}

export interface LB91ClosureAssessment {
  engineeringClosed: boolean;
  productionReady: false;
  universalOperationalCoverage: false;
  unresolvedExternalBlockers: readonly LB91ExternalBlockerId[];
  blockers: readonly string[];
  humanValidationRequired: true;
}

export const LB91_EXTERNAL_BLOCKERS: readonly LB91ExternalBlockerId[] = [
  "UNIVERSAL_EDITABLE_TEMPLATE_COVERAGE",
  "CONCESSION_REAL_DOCUMENTARY_CASE",
  "DEPLOYED_PERSISTENCE_RESTART_RECOVERY",
  "KNOWLEDGE_PROVENANCE_QUARANTINE",
  "INSTITUTIONAL_SECURITY_PRIVACY_REVIEW",
] as const;

/**
 * LB91.94-98 — separa cierre de ingeniería de preparación productiva.
 * LB91 puede cerrarse técnicamente con todas sus guardas verificadas aunque
 * persistan tareas externas/documentales. Nunca transforma esos pendientes en
 * productionReady ni en cobertura universal.
 */
export function assessLB91Closure(input: LB91ClosureInput): LB91ClosureAssessment {
  const blockers: string[] = [];
  if (!input.coreUniversalEnginesImplemented) blockers.push("Faltan motores universales del alcance LB91.");
  if (!input.familyPreparationImplemented) blockers.push("Falta preparación específica por familia contractual.");
  if (!input.documentSelectionGuarded) blockers.push("La selección documental no está protegida por evidencia.");
  if (!input.physicalRenderGuarded) blockers.push("El render físico no está protegido por activo editable verificado.");
  if (!input.crossDocumentAuditImplemented) blockers.push("Falta auditoría cruzada Memoria-PCAP-PPT.");
  if (!input.supplyMultiCaseCorpusImplemented) blockers.push("Falta corpus multicaso real de suministros.");
  if (!input.supplyVariantIsolationImplemented) blockers.push("Falta aislamiento entre subfamilias de suministros.");
  if (!input.ciGreen) blockers.push("La CI del HEAD no está verde.");

  const resolved = new Set(input.resolvedExternalBlockers ?? []);
  const unresolvedExternalBlockers = LB91_EXTERNAL_BLOCKERS.filter(id => !resolved.has(id));

  // Mantener el guardrail global explícito: LB91 no puede autodeclarar universalidad.
  const universalOperationalCoverage = canClaimUniversalOperationalCoverage();
  if (universalOperationalCoverage) {
    throw new Error("Invariante LB91 vulnerada: la cobertura universal no puede declararse automáticamente.");
  }

  return {
    engineeringClosed: blockers.length === 0,
    productionReady: false,
    universalOperationalCoverage: false,
    unresolvedExternalBlockers,
    blockers,
    humanValidationRequired: true,
  };
}
