import { createHash } from "node:crypto";
import {
  FERRETERIA_MEMORY_REQUIRED_CORRECTIONS,
  FERRETERIA_MEMORY_V12_EDITABLE_SOURCE,
  FERRETERIA_MEMORY_V13_CORRECTED_CANDIDATE,
} from "../lb40/FerreteriaMemoryEditableActivation";

export type FerreteriaMemoryReadinessStage =
  | "NEEDS_SOURCE_BYTES"
  | "SOURCE_IDENTITY_MISMATCH"
  | "NEEDS_CORRECTED_BYTES"
  | "CORRECTED_IDENTITY_MISMATCH"
  | "READY_FOR_PHYSICAL_MAPPING";

export interface FerreteriaMemoryReadiness {
  ready: boolean;
  stage: FerreteriaMemoryReadinessStage;
  blockers: readonly string[];
}

function sha256(bytes: Uint8Array): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

/**
 * LB44 — puerta de identidad binaria para la Memoria real.
 *
 * La V13 corregida es un candidato source-backed, no un modelo universal todavía.
 * Antes de mapear físicamente sus campos se exige demostrar que runtime contiene
 * tanto el V12 auténtico como el V13 corregido exacto que conserva sus estilos.
 */
export function evaluateFerreteriaMemoryProtectedReadiness(args: {
  sourceV12Bytes: Uint8Array | null;
  correctedV13Bytes: Uint8Array | null;
}): FerreteriaMemoryReadiness {
  if (!args.sourceV12Bytes) {
    return { ready: false, stage: "NEEDS_SOURCE_BYTES", blockers: ["No están disponibles los bytes del ODT auténtico V12 de la Memoria."] };
  }
  const sourceHash = sha256(args.sourceV12Bytes);
  if (sourceHash !== FERRETERIA_MEMORY_V12_EDITABLE_SOURCE.contentHash) {
    return { ready: false, stage: "SOURCE_IDENTITY_MISMATCH", blockers: [`Hash V12 inesperado: ${sourceHash}.`] };
  }
  if (!args.correctedV13Bytes) {
    return { ready: false, stage: "NEEDS_CORRECTED_BYTES", blockers: ["No están disponibles los bytes del candidato V13 corregido."] };
  }
  const correctedHash = sha256(args.correctedV13Bytes);
  if (correctedHash !== FERRETERIA_MEMORY_V13_CORRECTED_CANDIDATE.generatedCandidateHash) {
    return { ready: false, stage: "CORRECTED_IDENTITY_MISMATCH", blockers: [`Hash V13 inesperado: ${correctedHash}.`] };
  }
  return { ready: true, stage: "READY_FOR_PHYSICAL_MAPPING", blockers: [] };
}

export const FERRETERIA_MEMORY_PHYSICAL_MAPPING_SCOPE = {
  caseId: "CONTR/2026/240267",
  sections: [
    "cabecera-y-expediente",
    "1-antecedentes-y-sedes",
    "2-objeto-cpv-y-no-lotes",
    "3-necesidad-e-idoneidad",
    "4-plazo-pbl-desglose-ve-y-anualidades",
    "5-procedimiento-y-criterio-precio",
    "6-solvencia-exencion",
    "7-condicion-social-ambiental",
    "8-unidad-responsable-y-firma",
  ],
  correctionsThatMustRemainProtected: FERRETERIA_MEMORY_REQUIRED_CORRECTIONS.map(item => item.id),
  candidateStyleFingerprint: FERRETERIA_MEMORY_V13_CORRECTED_CANDIDATE.sourceStyleFingerprint,
  humanAcceptanceRequired: true,
} as const;
