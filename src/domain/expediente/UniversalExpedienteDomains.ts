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

/**
 * Componentes económicos explícitos del valor estimado. No son sinónimos de PBL,
 * presupuesto máximo ni duración temporal; se conservan separados para evitar
 * extrapolaciones o equivalencias jurídicas silenciosas.
 *
 * Los campos opcionales incorporados en LB27 representan decisiones documentales
 * con semántica propia que aparecen en modelos oficiales. Son opcionales para
 * mantener compatibilidad con expedientes universales anteriores, pero cuando un
 * perfil documental los exige deben existir como EvidenceField promocionable.
 */
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
  initialEstimatedValueBaseCents: EvidenceField<number>;
  extensionAmountExVatCents: EvidenceField<number>;
  modificationAmountExVatCents: EvidenceField<number>;
  optionsAmountExVatCents: EvidenceField<number>;
  otherEstimatedValueComponentsCents: EvidenceField<number>;
  legalEstimatedValueCents: EvidenceField<number>;
  initialVatAmountCents?: EvidenceField<number>;
  initialPblVatIncludedCents?: EvidenceField<number>;
  needsBasedContractDa33?: EvidenceField<boolean>;
  budgetCoversEntireContractLife?: EvidenceField<boolean>;
  estimatedValueCalculationMethod?: EvidenceField<string>;
  priceDeterminationRegime?: EvidenceField<string>;
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
  noDivisionJustification?: EvidenceField<string>;
}

export interface UniversalAdministrativeEvidence {
  contractingAuthority: EvidenceField<string>;
  promotingUnit: EvidenceField<string>;
  competentBody: EvidenceField<string>;
  administrativeFileNumber: EvidenceField<string>;
  contractManager: EvidenceField<string>;
  reservedContractDa4?: EvidenceField<boolean>;
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
  extensionStructure?: EvidenceField<string>;
  extensionNoticeMonths?: EvidenceField<number>;
  plannedModificationRegime?: EvidenceField<string>;
}

export interface UniversalCriteriaEvidence {
  awardCriteria: EvidenceField<readonly CriterioAdjudicacion[]>;
  economicSolvency: EvidenceField<readonly CriterioSolvencia[]>;
  technicalSolvency: EvidenceField<readonly CriterioSolvencia[]>;
  judgmentCriteriaExist: EvidenceField<boolean>;
  singleCriterionMotivation?: EvidenceField<string>;
}

export interface UniversalTraceability {
  decisions: readonly DecisionLog[];
  events: readonly EventoExpediente[];
  sourceRegistry: readonly EvidenceReference[];
}
