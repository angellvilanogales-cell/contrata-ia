import { UniversalConcessionSubtype } from "./UniversalConcessionPreparationEngine";

export interface UniversalConcessionExecutionInput {
  subtype: UniversalConcessionSubtype;
  operationalRiskRemainsWithConcessionaire: boolean;
  economicFinancialPlanIdentified: boolean;
  tariffOrRemunerationRegimeDefined: boolean;
  inspectionAndControlPowersDefined: boolean;
  breachCatalogueDefined: boolean;
  interventionOrSeizureRegimeAddressed: boolean;
  economicRebalancingRegimeLimitedToLegalGrounds: boolean;
  demandForecastRiskExcludedFromAutomaticRebalancing: boolean;
  reversionRegimeDefined?: boolean;
  includesConstructionPhase?: boolean;
  constructionSubjectToApprovedProject?: boolean;
  completionCheckActDefined?: boolean;
  differentiatedAccountingRequired?: boolean;
}

export interface UniversalConcessionExecutionDecision {
  valid: boolean;
  blockers: readonly string[];
  warnings: readonly string[];
  legalBasis: readonly string[];
  humanValidationRequired: true;
}

/**
 * Controla los elementos estructurales de ejecución concesional.
 * No decide tarifas, equilibrio o intervención: exige que el pliego los configure
 * respetando el riesgo operacional y los supuestos legales.
 */
export class UniversalConcessionExecutionEngine {
  public evaluate(input: UniversalConcessionExecutionInput): UniversalConcessionExecutionDecision {
    const blockers: string[] = [];
    const warnings: string[] = [];

    if (!input.operationalRiskRemainsWithConcessionaire) blockers.push("La ejecución no puede neutralizar la transferencia de riesgo operacional que define la concesión.");
    if (!input.economicFinancialPlanIdentified) blockers.push("No consta identificado el plan/estudio económico-financiero que sirve de referencia a la explotación.");
    if (!input.tariffOrRemunerationRegimeDefined) blockers.push("No consta definido el régimen de tarifas, contraprestaciones o remuneración concesional.");
    if (!input.inspectionAndControlPowersDefined) blockers.push("No constan configuradas las facultades de vigilancia, inspección y control de la Administración concedente.");
    if (!input.breachCatalogueDefined) blockers.push("No consta un catálogo de incumplimientos y consecuencias adecuado al régimen concesional.");
    if (!input.interventionOrSeizureRegimeAddressed) blockers.push("No consta tratado el régimen de intervención/secuestro cuando resulte aplicable.");
    if (!input.economicRebalancingRegimeLimitedToLegalGrounds) blockers.push("El restablecimiento del equilibrio económico no consta limitado a los supuestos legalmente habilitados.");
    if (!input.demandForecastRiskExcludedFromAutomaticRebalancing) blockers.push("Las desviaciones de previsiones de demanda no pueden generar por sí solas un derecho automático al reequilibrio.");

    if (input.subtype === "WORKS_CONCESSION") {
      if (input.includesConstructionPhase !== true) warnings.push("La concesión de obras debe conservar trazabilidad de la fase de construcción aunque parte de la obra preexista.");
      if (input.includesConstructionPhase && !input.constructionSubjectToApprovedProject) blockers.push("La construcción concesional no consta sometida al proyecto aprobado.");
      if (input.includesConstructionPhase && !input.completionCheckActDefined) blockers.push("No consta definida el acta de comprobación de las obras al finalizar la construcción concesional.");
    }

    if (input.subtype === "SERVICE_CONCESSION") {
      if (!input.reversionRegimeDefined) blockers.push("No consta definido el régimen de reversión de bienes/medios afectos cuando proceda en la concesión de servicios.");
      if (!input.differentiatedAccountingRequired) blockers.push("No consta exigida la contabilidad diferenciada de ingresos y gastos de la concesión cuando resulta aplicable al régimen económico configurado.");
    }

    return {
      valid: blockers.length === 0,
      blockers,
      warnings,
      legalBasis: input.subtype === "WORKS_CONCESSION"
        ? ["arts. 251-270 LCSP"]
        : ["arts. 286-297 LCSP"],
      humanValidationRequired: true,
    };
  }
}
