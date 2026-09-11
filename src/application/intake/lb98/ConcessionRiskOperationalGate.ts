export interface ConcessionRiskOperationalInput {
  subtype: "SERVICE_CONCESSION" | "WORKS_CONCESSION" | null;
  viabilityStudyApproved: boolean;
  viabilityStudyConcludesViable: boolean | null;
  demandRiskTransferred: boolean;
  supplyRiskTransferred: boolean;
  marketExposureReal: boolean;
  recoveryOfInvestmentGuaranteed: boolean | null;
  recoveryOfCostsGuaranteed: boolean | null;
  estimatedPotentialLossMoreThanNominal: boolean;
  concessionRevenueModelDefined: boolean;
  netPresentValueAnalysisAvailable: boolean;
  stateAidRelevant: boolean | null;
  stateAidCompatibilityAddressed: boolean;
}

export interface ConcessionRiskOperationalResult {
  concessionQualificationSupported: boolean;
  viabilityReady: boolean;
  operationalRiskTransferred: boolean;
  blockers: readonly string[];
  legalBasis: readonly string[];
  humanValidationRequired: true;
}

/**
 * Gate conservador arts. 14.4, 15, 247 y 285 LCSP. Riesgo y ventura ordinario
 * no equivale a riesgo operacional. Se exige exposición real a incertidumbre
 * de mercado y que la pérdida potencial no sea meramente nominal/despreciable.
 */
export function evaluateConcessionRiskOperational(input: ConcessionRiskOperationalInput): ConcessionRiskOperationalResult {
  const blockers: string[] = [];
  if (!input.subtype) blockers.push("Debe determinarse si se trata de concesión de servicios o de obras.");
  if (!input.viabilityStudyApproved) blockers.push("Falta estudio de viabilidad o económico-financiero aprobado antes de tramitar la concesión.");
  if (input.viabilityStudyConcludesViable !== true) blockers.push(input.viabilityStudyConcludesViable === false ? "El estudio concluye inviabilidad y su conclusión impide continuar por esta vía concesional." : "Falta conclusión acreditada de viabilidad.");
  const demandOrSupply = input.demandRiskTransferred || input.supplyRiskTransferred;
  if (!demandOrSupply) blockers.push("No consta transferencia de riesgo de demanda ni de suministro/oferta.");
  if (!input.marketExposureReal) blockers.push("No consta exposición real del concesionario a incertidumbres del mercado fuera del mero riesgo y ventura ordinario.");
  if (input.recoveryOfInvestmentGuaranteed === true || input.recoveryOfCostsGuaranteed === true) blockers.push("La recuperación garantizada de inversión o costes contradice, salvo análisis específico, la transferencia real de riesgo operacional.");
  if (!input.estimatedPotentialLossMoreThanNominal) blockers.push("La pérdida potencial estimada debe ser real y no meramente nominal o desdeñable.");
  if (!input.concessionRevenueModelDefined) blockers.push("Falta modelo de ingresos/retribución/tarifas de la concesión.");
  if (!input.netPresentValueAnalysisAvailable) blockers.push("Falta análisis de valor actual neto de inversiones, costes e ingresos para evaluar el riesgo operacional.");
  if (input.stateAidRelevant === null) blockers.push("Debe determinarse si existen ayudas a construcción/explotación relevantes para la viabilidad.");
  if (input.stateAidRelevant === true && !input.stateAidCompatibilityAddressed) blockers.push("El estudio debe pronunciarse sobre posible ayuda de Estado y compatibilidad con el TFUE.");

  const viabilityReady = input.viabilityStudyApproved && input.viabilityStudyConcludesViable === true && !(input.stateAidRelevant === true && !input.stateAidCompatibilityAddressed);
  const operationalRiskTransferred = demandOrSupply && input.marketExposureReal && input.recoveryOfInvestmentGuaranteed !== true && input.recoveryOfCostsGuaranteed !== true && input.estimatedPotentialLossMoreThanNominal && input.concessionRevenueModelDefined && input.netPresentValueAnalysisAvailable;
  return {
    concessionQualificationSupported: Boolean(input.subtype) && viabilityReady && operationalRiskTransferred && blockers.length === 0,
    viabilityReady,
    operationalRiskTransferred,
    blockers,
    legalBasis: input.subtype === "WORKS_CONCESSION" ? ["arts. 14.4, 247-250 LCSP"] : ["arts. 15, 284-285 LCSP", "art. 14.4 LCSP por remisión"],
    humanValidationRequired: true,
  };
}
