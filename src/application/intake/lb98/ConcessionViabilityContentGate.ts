export interface ConcessionViabilityContentInput {
  subtype: "SERVICE_CONCESSION" | "WORKS_CONCESSION" | null;
  concessionChoiceJustification: boolean;
  demandForecast: boolean;
  investmentAndFinancingPlan: boolean;
  operatingCostRevenueModel: boolean;
  netPresentValueAndDiscountRate: boolean;
  riskAllocationMatrix: boolean;
  stateAidResolved: boolean;
  planningAndUrbanContext?: boolean;
  environmentalAnalysis?: boolean;
  healthAndSafetyStudy?: boolean;
}

export interface ConcessionViabilityContentResult {
  complete: boolean;
  blockers: readonly string[];
  legalBasis: readonly string[];
  humanValidationRequired: true;
}

/**
 * Gate de contenido material del estudio de viabilidad. Para concesión de obras
 * incorpora los elementos específicos del art. 247 LCSP. Para concesión de
 * servicios exige el núcleo económico y de riesgo necesario para que el art.
 * 285.2 y la calificación concesional puedan ser revisados de forma trazable.
 */
export function evaluateConcessionViabilityContent(input: ConcessionViabilityContentInput): ConcessionViabilityContentResult {
  const blockers: string[] = [];
  if (!input.subtype) blockers.push("Falta determinar el subtipo concesional.");
  if (!input.concessionChoiceJustification) blockers.push("Falta justificar la elección de la concesión frente a otras formas de prestación o contratación.");
  if (!input.demandForecast) blockers.push("Falta previsión de demanda o uso suficientemente documentada.");
  if (!input.investmentAndFinancingPlan) blockers.push("Falta plan de inversiones y sistema de financiación.");
  if (!input.operatingCostRevenueModel) blockers.push("Falta modelo de costes de explotación e ingresos/retribución.");
  if (!input.netPresentValueAndDiscountRate) blockers.push("Falta VAN de inversiones, costes e ingresos y criterios de tasa de descuento.");
  if (!input.riskAllocationMatrix) blockers.push("Falta matriz de distribución de riesgos relevantes, incluido el riesgo operacional.");
  if (!input.stateAidResolved) blockers.push("Falta resolver expresamente la incidencia de ayudas de Estado en la viabilidad.");

  if (input.subtype === "WORKS_CONCESSION") {
    if (!input.planningAndUrbanContext) blockers.push("La concesión de obras requiere valoración del planeamiento sectorial, territorial o urbanístico aplicable.");
    if (!input.environmentalAnalysis) blockers.push("La concesión de obras requiere estudio de impacto ambiental cuando proceda o análisis ambiental de alternativas y medidas.");
    if (!input.healthAndSafetyStudy) blockers.push("La concesión de obras requiere estudio o estudio básico de seguridad y salud en los términos legalmente aplicables.");
  }

  return {
    complete: blockers.length === 0,
    blockers,
    legalBasis: input.subtype === "WORKS_CONCESSION" ? ["art. 247 LCSP"] : ["arts. 15 y 285.2 LCSP", "art. 14.4 LCSP por remisión"],
    humanValidationRequired: true,
  };
}
