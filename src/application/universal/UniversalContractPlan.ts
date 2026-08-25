import { DocumentType } from "../../domain/documentModel/DocumentType";
import {
  CapabilityCoverage,
  UniversalCapability,
  UniversalCoverageStatus,
  UniversalTargetContractType,
  getContractFamilyCoverage,
} from "../../domain/capabilities/UniversalContractCoverage";

export type UniversalModuleAction = "RUN_EXISTING_COMPONENT" | "COLLECT_AND_VALIDATE_EVIDENCE" | "BLOCK_UNTIL_IMPLEMENTED";
export interface UniversalModuleStep { capability: UniversalCapability; component?: string; action: UniversalModuleAction; coverage: UniversalCoverageStatus; humanValidationRequired: boolean; notes: readonly string[]; }
export interface UniversalContractPlan { contractType: UniversalTargetContractType; requiredDocuments: readonly DocumentType[]; steps: readonly UniversalModuleStep[]; blockers: readonly string[]; canReachDocumentGeneration: boolean; }

const COMPONENT_BY_CAPABILITY: Partial<Record<UniversalCapability, string>> = {
  OBJECT_AND_NEED: "ObjetoEngine",
  CPV: "CPVEngine",
  LOTS: "UniversalLotsEngine",
  ECONOMICS: "UniversalEconomicEngine",
  PROCEDURE: "ProcedimientoEngine",
  SOLVENCY: "SolvenciaEngine",
  PUBLICITY: "PublicidadEngine",
  AWARD_CRITERIA: "UniversalAwardCriteriaEngine",
  GUARANTEES: "UniversalGuaranteeEngine",
  EXECUTION: "UniversalExecutionEngine",
  MODIFICATIONS: "UniversalModificationEngine",
  PRICE_REVISION: "UniversalPriceRevisionEngine",
  REMEDIES: "UniversalRemediesEngine",
  DOCUMENT_MODEL_SELECTION: "CanonicalDocumentProfileSelector",
  EDITABLE_DOCUMENT_GENERATION: "UniversalDocumentGenerationGate",
  CROSS_DOCUMENT_AUDIT: "UniversalCrossDocumentAudit",
};

function actionFor(item: CapabilityCoverage): UniversalModuleAction {
  if (item.status === "NOT_IMPLEMENTED" || item.status === "SOURCE_REFERENCE_ONLY") return "BLOCK_UNTIL_IMPLEMENTED";
  if (item.status === "PARTIAL_SOURCE_BACKED") return "COLLECT_AND_VALIDATE_EVIDENCE";
  return "RUN_EXISTING_COMPONENT";
}

function stepFor(item: CapabilityCoverage): UniversalModuleStep {
  const action = actionFor(item);
  return { capability: item.capability, component: COMPONENT_BY_CAPABILITY[item.capability], action, coverage: item.status, humanValidationRequired: true, notes: item.notes };
}

/** Construye un plan sin convertir falta de cobertura en inferencia jurídica. */
export function buildUniversalContractPlan(contractType: UniversalTargetContractType): UniversalContractPlan {
  const family = getContractFamilyCoverage(contractType);
  const steps = family.capabilities.map(stepFor);
  const blockers = steps.filter(step => step.action === "BLOCK_UNTIL_IMPLEMENTED")
    .map(step => `Cobertura pendiente ${contractType}/${step.capability}: ${step.notes[0] ?? "módulo no implementado"}`);
  const generationStep = steps.find(step => step.capability === "EDITABLE_DOCUMENT_GENERATION");
  const modelStep = steps.find(step => step.capability === "DOCUMENT_MODEL_SELECTION");
  const canReachDocumentGeneration = blockers.length === 0 && generationStep?.action !== "BLOCK_UNTIL_IMPLEMENTED" && modelStep?.action !== "BLOCK_UNTIL_IMPLEMENTED";
  return { contractType, requiredDocuments: family.requiredDocuments, steps, blockers, canReachDocumentGeneration };
}
