import {
  CanonicalExpedienteState,
  evaluateCanonicalPromotion,
} from "./CanonicalExpedienteState";
import {
  EvidenceField,
  createPendingEvidenceField,
  isPromotableEvidenceField,
  assertNoSilentConflictResolution,
} from "./EvidenceField";
import { DeadlineDecision } from "../legal/modules/plazos/DeadlineDecision";

export const UNIVERSAL_EXPEDIENTE_SCHEMA_VERSION = "13.0.0-alpha.1" as const;

export interface UniversalProcessingEvidence {
  processingType: EvidenceField<string>;
  urgency: EvidenceField<boolean>;
  emergency: EvidenceField<boolean>;
}

export interface UniversalRegulationEvidence {
  harmonizedRegulation: EvidenceField<boolean>;
  europeanFunding: EvidenceField<boolean>;
  threshold: EvidenceField<number>;
  deadlines: EvidenceField<DeadlineDecision>;
}

export interface UniversalExpedienteV13 {
  schemaVersion: typeof UNIVERSAL_EXPEDIENTE_SCHEMA_VERSION;
  canonical: CanonicalExpedienteState;
  processing: UniversalProcessingEvidence;
  regulation: UniversalRegulationEvidence;
}

export interface UniversalExpedienteEvaluation {
  canonicalPromotable: boolean;
  universallyComplete: boolean;
  blockers: readonly string[];
}

export function createUniversalExpedienteFromCanonical(
  canonical: CanonicalExpedienteState,
): UniversalExpedienteV13 {
  return {
    schemaVersion: UNIVERSAL_EXPEDIENTE_SCHEMA_VERSION,
    canonical,
    processing: {
      processingType: createPendingEvidenceField<string>("processingType"),
      urgency: createPendingEvidenceField<boolean>("urgency"),
      emergency: createPendingEvidenceField<boolean>("emergency"),
    },
    regulation: {
      harmonizedRegulation: createPendingEvidenceField<boolean>("harmonizedRegulation"),
      europeanFunding: createPendingEvidenceField<boolean>("europeanFunding"),
      threshold: createPendingEvidenceField<number>("threshold"),
      deadlines: createPendingEvidenceField<DeadlineDecision>("deadlines"),
    },
  };
}

export function evaluateUniversalExpediente(
  expediente: UniversalExpedienteV13,
): UniversalExpedienteEvaluation {
  const canonical = evaluateCanonicalPromotion(expediente.canonical);
  const blockers = [...canonical.blockers];

  const supplements: Array<EvidenceField<unknown>> = [
    expediente.processing.processingType,
    expediente.processing.urgency,
    expediente.processing.emergency,
    expediente.regulation.harmonizedRegulation,
    expediente.regulation.europeanFunding,
    expediente.regulation.threshold,
    expediente.regulation.deadlines,
  ];

  for (const field of supplements) {
    try {
      assertNoSilentConflictResolution(field);
    } catch (error) {
      blockers.push(error instanceof Error ? error.message : `Conflicto inválido en ${field.key}`);
      continue;
    }

    if (!isPromotableEvidenceField(field)) {
      blockers.push(`Campo universal no promocionable: ${field.key}`);
    }
  }

  return {
    canonicalPromotable: canonical.promotable,
    universallyComplete: blockers.length === 0,
    blockers,
  };
}
