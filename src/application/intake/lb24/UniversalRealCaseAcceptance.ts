import { UniversalProductionRendererClosureResult } from "../lb23/UniversalProductionRendererClosure";
import { CurrentLawAcceptanceResult } from "./UniversalCurrentLawAcceptance";

export type RealCaseAcceptanceStage =
  | "INTAKE"
  | "UNIVERSAL_EVIDENCE"
  | "HUMAN_VALIDATION"
  | "LEGAL_CLOSURE"
  | "TEMPLATE_SELECTION"
  | "MAPPING"
  | "RENDERING"
  | "DOCUMENT_AUDIT"
  | "PERSISTENCE_RELOAD";

export interface RealCaseAcceptanceCheckpoint {
  stage: RealCaseAcceptanceStage;
  passed: boolean;
  evidenceId: string;
  note?: string;
}

export interface RealCaseAcceptanceEvidence {
  caseId: string;
  sourceCase: string;
  realSourceConfirmed: boolean;
  checkpoints: readonly RealCaseAcceptanceCheckpoint[];
  currentLaw: CurrentLawAcceptanceResult;
  rendererClosure: UniversalProductionRendererClosureResult;
  humanReviewedDocuments: boolean;
  reviewer?: string;
}

export interface RealCaseAcceptanceResult {
  engineeringReady: boolean;
  productionAccepted: boolean;
  blockers: readonly string[];
  completedStages: readonly RealCaseAcceptanceStage[];
}

const REQUIRED_STAGES: readonly RealCaseAcceptanceStage[] = [
  "INTAKE",
  "UNIVERSAL_EVIDENCE",
  "HUMAN_VALIDATION",
  "LEGAL_CLOSURE",
  "TEMPLATE_SELECTION",
  "MAPPING",
  "RENDERING",
  "DOCUMENT_AUDIT",
  "PERSISTENCE_RELOAD",
];

/**
 * LB24.2-LB24.4. Prueba de aceptación de un expediente real. No basta con que
 * las clases existan ni con tests sintéticos: cada fase debe conservar una
 * evidencia identificable y el documento final debe ser revisado humanamente.
 */
export function evaluateRealCaseAcceptance(evidence: RealCaseAcceptanceEvidence): RealCaseAcceptanceResult {
  const blockers: string[] = [];
  if (!evidence.caseId.trim()) blockers.push("Falta caseId del expediente de aceptación.");
  if (!evidence.sourceCase.trim() || !evidence.realSourceConfirmed) blockers.push("El caso de aceptación no está acreditado como expediente/fuente real.");

  const seen = new Set<RealCaseAcceptanceStage>();
  const completed: RealCaseAcceptanceStage[] = [];
  for (const checkpoint of evidence.checkpoints) {
    if (seen.has(checkpoint.stage)) blockers.push(`Checkpoint duplicado: ${checkpoint.stage}.`);
    seen.add(checkpoint.stage);
    if (!checkpoint.evidenceId.trim()) blockers.push(`El checkpoint ${checkpoint.stage} carece de evidenceId.`);
    if (checkpoint.passed) completed.push(checkpoint.stage);
    else blockers.push(`No superado el checkpoint end-to-end: ${checkpoint.stage}.`);
  }
  for (const stage of REQUIRED_STAGES) if (!seen.has(stage)) blockers.push(`Falta checkpoint end-to-end: ${stage}.`);

  if (!evidence.currentLaw.ready) blockers.push(...evidence.currentLaw.blockers.map(item => `Normativa: ${item}`));
  if (!evidence.rendererClosure.engineeringReady) blockers.push(...evidence.rendererClosure.blockers.map(item => `Renderer: ${item}`));

  const engineeringReady = blockers.filter(item => !item.includes("original editable") && !item.includes("producción") && !item.includes("bytes") && !item.includes("SHA-256") && !item.includes("huella de estilo") && !item.includes("bindings físicos")).length === 0;

  if (!evidence.rendererClosure.productionReady) blockers.push(...evidence.rendererClosure.blockers.map(item => `Producción: ${item}`));
  if (!evidence.humanReviewedDocuments || !evidence.reviewer?.trim()) blockers.push("Los documentos finales del caso real no han sido revisados y aceptados humanamente.");

  return {
    engineeringReady,
    productionAccepted: blockers.length === 0,
    blockers: [...new Set(blockers)],
    completedStages: completed,
  };
}
