import { CriterioAdjudicacion } from "./CriterioAdjudicacion";
import { CriterioSolvencia } from "./CriterioSolvencia";
import { DecisionLog } from "./DecisionLog";
import { EvidenceField, EvidenceReference } from "./EvidenceField";
import { EventoExpediente } from "./ExpedienteJournal";

export interface UniversalAnnuality {
  year: number;
  amountCents: number;
  vatIncluded: boolean;
}

export interface UniversalUnitPrice {
  concept: string;
  unit: string;
  unitPriceCents: number;
}

export interface UniversalEconomicEvidence {
  vatPercent: EvidenceField<number>;
  budgetApplication: EvidenceField<string>;
  annualities: EvidenceField<readonly UniversalAnnuality[]>;
  fundingSource: EvidenceField<string>;
  priceRevisionRegime: EvidenceField<string>;
  unitPrices: EvidenceField<readonly UniversalUnitPrice[]>;
  referenceConsumption: EvidenceField<string>;
  projectedConsumption: EvidenceField<string>;
  maximumApprovedBudgetCents: EvidenceField<number>;
  legalEstimatedValueCents: EvidenceField<number>;
}

export interface UniversalLot {
  id: string;
  name: EvidenceField<string>;
  cpv: EvidenceField<string>;
  baseTenderBudgetCents: EvidenceField<number>;
  estimatedValueCents: EvidenceField<number>;
}

export interface UniversalLotsEvidence {
  divisionIntoLots: EvidenceField<boolean>;
  lots: EvidenceField<readonly UniversalLot[]>;
  maxOfferableLots: EvidenceField<number>;
  maxAwardableLots: EvidenceField<number>;
}

export interface UniversalAdministrativeEvidence {
  contractingAuthority: EvidenceField<string>;
  promotingUnit: EvidenceField<string>;
  competentBody: EvidenceField<string>;
  administrativeFileNumber: EvidenceField<string>;
  contractManager: EvidenceField<string>;
}

export interface UniversalTechnicalEvidence {
  technicalPurpose: EvidenceField<string>;
  technicalRequirements: EvidenceField<readonly string[]>;
  executionLocations: EvidenceField<readonly string[]>;
  subrogationRequired: EvidenceField<boolean>;
  subrogationRegime: EvidenceField<string>;
}

export interface UniversalGuaranteeEvidence {
  provisionalGuaranteeRequired: EvidenceField<boolean>;
  provisionalGuaranteePercent: EvidenceField<number>;
  definitiveGuaranteePercent: EvidenceField<number>;
  complementaryGuaranteePercent: EvidenceField<number>;
}

export interface UniversalExecutionEvidence {
  specialExecutionConditions: EvidenceField<readonly string[]>;
  specificPenalties: EvidenceField<readonly string[]>;
  subcontractingRegime: EvidenceField<string>;
  assignmentRegime: EvidenceField<string>;
  paymentRegime: EvidenceField<string>;
  receiptAndAcceptanceRegime: EvidenceField<string>;
}

export interface UniversalCriteriaEvidence {
  awardCriteria: EvidenceField<readonly CriterioAdjudicacion[]>;
  economicSolvency: EvidenceField<readonly CriterioSolvencia[]>;
  technicalSolvency: EvidenceField<readonly CriterioSolvencia[]>;
  judgmentCriteriaExist: EvidenceField<boolean>;
}

export interface UniversalTraceability {
  decisions: readonly DecisionLog[];
  events: readonly EventoExpediente[];
  sourceRegistry: readonly EvidenceReference[];
}
