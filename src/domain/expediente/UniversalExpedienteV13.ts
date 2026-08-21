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
import {
  UniversalAdministrativeEvidence,
  UniversalCriteriaEvidence,
  UniversalEconomicEvidence,
  UniversalExecutionEvidence,
  UniversalGuaranteeEvidence,
  UniversalLotsEvidence,
  UniversalTechnicalEvidence,
  UniversalTraceability,
} from "./UniversalExpedienteDomains";

export const UNIVERSAL_EXPEDIENTE_SCHEMA_VERSION = "13.0.0-alpha.2" as const;

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

export type UniversalDomainName =
  | "processing"
  | "regulation"
  | "economic"
  | "administrative"
  | "technical"
  | "lots"
  | "guarantees"
  | "execution"
  | "criteria";

export interface UniversalExpedienteV13 {
  schemaVersion: typeof UNIVERSAL_EXPEDIENTE_SCHEMA_VERSION;
  canonical: CanonicalExpedienteState;
  processing: UniversalProcessingEvidence;
  regulation: UniversalRegulationEvidence;
  economic: UniversalEconomicEvidence;
  administrative: UniversalAdministrativeEvidence;
  technical: UniversalTechnicalEvidence;
  lots: UniversalLotsEvidence;
  guarantees: UniversalGuaranteeEvidence;
  execution: UniversalExecutionEvidence;
  criteria: UniversalCriteriaEvidence;
  traceability: UniversalTraceability;
}

export interface UniversalExpedienteEvaluation {
  canonicalPromotable: boolean;
  universallyComplete: boolean;
  domainCompleteness: Readonly<Record<UniversalDomainName, boolean>>;
  blockers: readonly string[];
}

function pendingEconomic(): UniversalEconomicEvidence {
  return {
    vatPercent: createPendingEvidenceField<number>("economic.vatPercent"),
    budgetApplication: createPendingEvidenceField<string>("economic.budgetApplication"),
    annualities: createPendingEvidenceField("economic.annualities"),
    fundingSource: createPendingEvidenceField<string>("economic.fundingSource"),
    priceRevisionRegime: createPendingEvidenceField<string>("economic.priceRevisionRegime"),
    unitPrices: createPendingEvidenceField("economic.unitPrices"),
    referenceConsumption: createPendingEvidenceField<string>("economic.referenceConsumption"),
    projectedConsumption: createPendingEvidenceField<string>("economic.projectedConsumption"),
    maximumApprovedBudgetCents: createPendingEvidenceField<number>("economic.maximumApprovedBudgetCents"),
    legalEstimatedValueCents: createPendingEvidenceField<number>("economic.legalEstimatedValueCents"),
  };
}

function pendingAdministrative(): UniversalAdministrativeEvidence {
  return {
    contractingAuthority: createPendingEvidenceField<string>("administrative.contractingAuthority"),
    promotingUnit: createPendingEvidenceField<string>("administrative.promotingUnit"),
    competentBody: createPendingEvidenceField<string>("administrative.competentBody"),
    administrativeFileNumber: createPendingEvidenceField<string>("administrative.administrativeFileNumber"),
    contractManager: createPendingEvidenceField<string>("administrative.contractManager"),
  };
}

function pendingTechnical(): UniversalTechnicalEvidence {
  return {
    technicalPurpose: createPendingEvidenceField<string>("technical.technicalPurpose"),
    technicalRequirements: createPendingEvidenceField("technical.technicalRequirements"),
    executionLocations: createPendingEvidenceField("technical.executionLocations"),
    subrogationRequired: createPendingEvidenceField<boolean>("technical.subrogationRequired"),
    subrogationRegime: createPendingEvidenceField<string>("technical.subrogationRegime"),
  };
}

function pendingLots(): UniversalLotsEvidence {
  return {
    divisionIntoLots: createPendingEvidenceField<boolean>("lots.divisionIntoLots"),
    lots: createPendingEvidenceField("lots.lots"),
    maxOfferableLots: createPendingEvidenceField<number>("lots.maxOfferableLots"),
    maxAwardableLots: createPendingEvidenceField<number>("lots.maxAwardableLots"),
  };
}

function pendingGuarantees(): UniversalGuaranteeEvidence {
  return {
    provisionalGuaranteeRequired: createPendingEvidenceField<boolean>("guarantees.provisionalGuaranteeRequired"),
    provisionalGuaranteePercent: createPendingEvidenceField<number>("guarantees.provisionalGuaranteePercent"),
    definitiveGuaranteePercent: createPendingEvidenceField<number>("guarantees.definitiveGuaranteePercent"),
    complementaryGuaranteePercent: createPendingEvidenceField<number>("guarantees.complementaryGuaranteePercent"),
  };
}

function pendingExecution(): UniversalExecutionEvidence {
  return {
    specialExecutionConditions: createPendingEvidenceField("execution.specialExecutionConditions"),
    specificPenalties: createPendingEvidenceField("execution.specificPenalties"),
    subcontractingRegime: createPendingEvidenceField<string>("execution.subcontractingRegime"),
    assignmentRegime: createPendingEvidenceField<string>("execution.assignmentRegime"),
    paymentRegime: createPendingEvidenceField<string>("execution.paymentRegime"),
    receiptAndAcceptanceRegime: createPendingEvidenceField<string>("execution.receiptAndAcceptanceRegime"),
  };
}

function pendingCriteria(): UniversalCriteriaEvidence {
  return {
    awardCriteria: createPendingEvidenceField("criteria.awardCriteria"),
    economicSolvency: createPendingEvidenceField("criteria.economicSolvency"),
    technicalSolvency: createPendingEvidenceField("criteria.technicalSolvency"),
    judgmentCriteriaExist: createPendingEvidenceField<boolean>("criteria.judgmentCriteriaExist"),
  };
}

export function createUniversalExpedienteFromCanonical(
  canonical: CanonicalExpedienteState,
): UniversalExpedienteV13 {
  return {
    schemaVersion: UNIVERSAL_EXPEDIENTE_SCHEMA_VERSION,
    canonical,
    processing: {
      processingType: createPendingEvidenceField<string>("processing.processingType"),
      urgency: createPendingEvidenceField<boolean>("processing.urgency"),
      emergency: createPendingEvidenceField<boolean>("processing.emergency"),
    },
    regulation: {
      harmonizedRegulation: createPendingEvidenceField<boolean>("regulation.harmonizedRegulation"),
      europeanFunding: createPendingEvidenceField<boolean>("regulation.europeanFunding"),
      threshold: createPendingEvidenceField<number>("regulation.threshold"),
      deadlines: createPendingEvidenceField<DeadlineDecision>("regulation.deadlines"),
    },
    economic: pendingEconomic(),
    administrative: pendingAdministrative(),
    technical: pendingTechnical(),
    lots: pendingLots(),
    guarantees: pendingGuarantees(),
    execution: pendingExecution(),
    criteria: pendingCriteria(),
    traceability: {
      decisions: [],
      events: [],
      sourceRegistry: [],
    },
  };
}

function domainFields(expediente: UniversalExpedienteV13): Record<UniversalDomainName, EvidenceField<unknown>[]> {
  return {
    processing: Object.values(expediente.processing),
    regulation: Object.values(expediente.regulation),
    economic: Object.values(expediente.economic),
    administrative: Object.values(expediente.administrative),
    technical: Object.values(expediente.technical),
    lots: Object.values(expediente.lots),
    guarantees: Object.values(expediente.guarantees),
    execution: Object.values(expediente.execution),
    criteria: Object.values(expediente.criteria),
  } as Record<UniversalDomainName, EvidenceField<unknown>[]>;
}

function evaluateField(field: EvidenceField<unknown>, blockers: string[]): boolean {
  try {
    assertNoSilentConflictResolution(field);
  } catch (error) {
    blockers.push(error instanceof Error ? error.message : `Conflicto inválido en ${field.key}`);
    return false;
  }

  if (!isPromotableEvidenceField(field)) {
    blockers.push(`Campo universal no promocionable: ${field.key}`);
    return false;
  }
  return true;
}

export function evaluateUniversalExpediente(
  expediente: UniversalExpedienteV13,
): UniversalExpedienteEvaluation {
  const canonical = evaluateCanonicalPromotion(expediente.canonical);
  const blockers = [...canonical.blockers];
  const fieldsByDomain = domainFields(expediente);
  const domainCompleteness = {} as Record<UniversalDomainName, boolean>;

  for (const [domain, fields] of Object.entries(fieldsByDomain) as Array<[UniversalDomainName, EvidenceField<unknown>[]]>) {
    domainCompleteness[domain] = fields.every(field => evaluateField(field, blockers));
  }

  if (isPromotableEvidenceField(expediente.lots.lots) && expediente.lots.lots.value) {
    for (const lot of expediente.lots.lots.value) {
      for (const field of [lot.name, lot.cpv, lot.baseTenderBudgetCents, lot.estimatedValueCents]) {
        if (!evaluateField(field, blockers)) domainCompleteness.lots = false;
      }
    }
  }

  return {
    canonicalPromotable: canonical.promotable,
    universallyComplete: canonical.promotable && Object.values(domainCompleteness).every(Boolean),
    domainCompleteness,
    blockers,
  };
}
