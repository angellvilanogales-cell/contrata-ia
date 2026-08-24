import {
  FERRETERIA_MEMORY_REQUIRED_CORRECTIONS,
  FERRETERIA_MEMORY_V12_EDITABLE_SOURCE,
  FERRETERIA_MEMORY_V13_CORRECTED_CANDIDATE,
} from "../lb40/FerreteriaMemoryEditableActivation";

export type FerreteriaMemoryPipelineStage =
  | "NEEDS_SOURCE_BYTES"
  | "NEEDS_CORRECTED_CANDIDATE"
  | "READY_FOR_MAPPING_INVENTORY"
  | "AWAITING_HUMAN_ACCEPTANCE";

export interface FerreteriaMemoryPipelineReadiness {
  ready: boolean;
  stage: FerreteriaMemoryPipelineStage;
  blockers: readonly string[];
  sourceHash: string;
  candidateHash: string;
}

/**
 * LB42 — puerta protegida de la Memoria justificativa real.
 *
 * La V13 corregida es una salida real y editable, pero todavía no equivale a un
 * renderer universal. Antes de automatizarla se exige que runtime pueda verificar
 * tanto el ODT V12 auténtico como la V13 corregida y que el inventario físico de
 * campos se construya sobre esos bytes, manteniendo la huella de estilos.
 */
export function evaluateFerreteriaMemoryPipelineReadiness(args: {
  sourceBytesVerified: boolean;
  correctedCandidateBytesVerified: boolean;
  physicalMappingInventoryReady: boolean;
}): FerreteriaMemoryPipelineReadiness {
  if (!args.sourceBytesVerified) {
    return {
      ready: false,
      stage: "NEEDS_SOURCE_BYTES",
      blockers: [`Runtime debe verificar ${FERRETERIA_MEMORY_V12_EDITABLE_SOURCE.contentHash} antes de usar la Memoria V12 como activo editable.`],
      sourceHash: FERRETERIA_MEMORY_V12_EDITABLE_SOURCE.contentHash,
      candidateHash: FERRETERIA_MEMORY_V13_CORRECTED_CANDIDATE.generatedCandidateHash,
    };
  }
  if (!args.correctedCandidateBytesVerified) {
    return {
      ready: false,
      stage: "NEEDS_CORRECTED_CANDIDATE",
      blockers: [`Runtime debe verificar la candidata corregida ${FERRETERIA_MEMORY_V13_CORRECTED_CANDIDATE.generatedCandidateHash}.`],
      sourceHash: FERRETERIA_MEMORY_V12_EDITABLE_SOURCE.contentHash,
      candidateHash: FERRETERIA_MEMORY_V13_CORRECTED_CANDIDATE.generatedCandidateHash,
    };
  }
  if (!args.physicalMappingInventoryReady) {
    return {
      ready: false,
      stage: "READY_FOR_MAPPING_INVENTORY",
      blockers: ["Debe inventariarse la correspondencia física entre evidencia universal y párrafos/tablas reales de la Memoria antes de crear un renderer productivo."],
      sourceHash: FERRETERIA_MEMORY_V12_EDITABLE_SOURCE.contentHash,
      candidateHash: FERRETERIA_MEMORY_V13_CORRECTED_CANDIDATE.generatedCandidateHash,
    };
  }
  return {
    ready: true,
    stage: "AWAITING_HUMAN_ACCEPTANCE",
    blockers: [],
    sourceHash: FERRETERIA_MEMORY_V12_EDITABLE_SOURCE.contentHash,
    candidateHash: FERRETERIA_MEMORY_V13_CORRECTED_CANDIDATE.generatedCandidateHash,
  };
}

export const FERRETERIA_MEMORY_PROTECTED_PROFILE = {
  caseId: "CONTR/2026/240267",
  documentKind: "MEMORIA",
  source: FERRETERIA_MEMORY_V12_EDITABLE_SOURCE,
  correctedCandidate: FERRETERIA_MEMORY_V13_CORRECTED_CANDIDATE,
  mandatoryCorrectionIds: FERRETERIA_MEMORY_REQUIRED_CORRECTIONS.map(item => item.id),
  exactStylePreservationRequired: true,
  humanAcceptanceRequired: true,
  legacyFallbackAllowed: false,
} as const;
