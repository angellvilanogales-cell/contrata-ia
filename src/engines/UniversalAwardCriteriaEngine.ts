import { UniversalTargetContractType } from "../domain/capabilities/UniversalContractCoverage";

export type AwardCriterionEvaluation = "FORMULA" | "JUDGMENT";
export type AwardCriterionKind = "COST" | "QUALITY" | "SOCIAL" | "ENVIRONMENTAL" | "OTHER";

export interface UniversalAwardCriterionInput {
  id: string;
  weightPercent: number;
  evaluation: AwardCriterionEvaluation;
  kind: AwardCriterionKind;
  linkedToObject: boolean;
  objectivelyDefined: boolean;
  verifiable: boolean;
  isImprovement?: boolean;
}

export interface UniversalAwardCriteriaInput {
  contractType: UniversalTargetContractType;
  criteria: readonly UniversalAwardCriterionInput[];
  intellectualService?: boolean;
  annexIVService?: boolean;
  labourIntensiveService?: boolean;
  privateSecurityService?: boolean;
  supplyOrServicePerfectlyDefinedForPriceOnlyException?: boolean;
}

export interface UniversalAwardCriteriaDecision {
  totalWeightPercent: number;
  criteriaCount: number;
  qualityWeightPercent: number;
  costWeightPercent: number;
  formulaWeightPercent: number;
  judgmentWeightPercent: number;
  valid: boolean;
  blockers: readonly string[];
  warnings: readonly string[];
  legalBasis: readonly string[];
  humanValidationRequired: true;
}

function finitePercent(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

/**
 * Valida criterios que ya han sido definidos por el expediente.
 * No inventa criterios, ponderaciones ni fórmulas.
 */
export class UniversalAwardCriteriaEngine {
  public evaluate(input: UniversalAwardCriteriaInput): UniversalAwardCriteriaDecision {
    const blockers: string[] = [];
    const warnings: string[] = [];

    if (!input.criteria.length) blockers.push("Debe definirse al menos un criterio de adjudicación antes de cerrar el PCAP.");

    const ids = new Set<string>();
    for (const criterion of input.criteria) {
      if (!criterion.id.trim()) blockers.push("Existe un criterio sin identificador.");
      if (ids.has(criterion.id)) blockers.push(`Criterio duplicado: ${criterion.id}.`);
      ids.add(criterion.id);
      if (!finitePercent(criterion.weightPercent)) blockers.push(`Ponderación inválida en ${criterion.id}.`);
      if (!criterion.linkedToObject) blockers.push(`El criterio ${criterion.id} no consta vinculado al objeto del contrato.`);
      if (!criterion.objectivelyDefined) blockers.push(`El criterio ${criterion.id} no consta formulado de manera objetiva.`);
      if (!criterion.verifiable) blockers.push(`El criterio ${criterion.id} no incorpora una base verificable para comprobar la oferta.`);
      if (criterion.isImprovement && criterion.evaluation === "JUDGMENT" && criterion.weightPercent > 2.5) {
        blockers.push(`La mejora ${criterion.id} supera el 2,5% cuando se valora mediante juicio de valor.`);
      }
    }

    const totalWeightPercent = input.criteria.reduce((sum, criterion) => sum + criterion.weightPercent, 0);
    const roundedTotal = Math.round(totalWeightPercent * 1000) / 1000;
    if (input.criteria.length > 1 && Math.abs(roundedTotal - 100) > 0.001) {
      blockers.push(`La suma de ponderaciones es ${roundedTotal}% y debe cerrar en 100%.`);
    }

    const qualityKinds = new Set<AwardCriterionKind>(["QUALITY", "SOCIAL", "ENVIRONMENTAL"]);
    const qualityWeightPercent = input.criteria.filter(item => qualityKinds.has(item.kind)).reduce((sum, item) => sum + item.weightPercent, 0);
    const costWeightPercent = input.criteria.filter(item => item.kind === "COST").reduce((sum, item) => sum + item.weightPercent, 0);
    const formulaWeightPercent = input.criteria.filter(item => item.evaluation === "FORMULA").reduce((sum, item) => sum + item.weightPercent, 0);
    const judgmentWeightPercent = input.criteria.filter(item => item.evaluation === "JUDGMENT").reduce((sum, item) => sum + item.weightPercent, 0);

    if (input.criteria.length > 1 && costWeightPercent <= 0) {
      blockers.push("La pluralidad de criterios cualitativos debe acompañarse de un criterio relacionado con los costes.");
    }

    const priceOnly = input.criteria.length === 1 && input.criteria[0]?.kind === "COST";
    if (priceOnly) {
      if (input.contractType === "CONCESSION") blockers.push("Las concesiones requieren más de un criterio de adjudicación.");
      if (input.intellectualService || input.annexIVService || input.labourIntensiveService || input.privateSecurityService) {
        blockers.push("Para esta clase de servicio el precio no puede ser el único factor determinante de la adjudicación.");
      }
      if ((input.contractType === "SUPPLY" || input.contractType === "SERVICE") && !input.supplyOrServicePerfectlyDefinedForPriceOnlyException) {
        blockers.push("No consta acreditada la excepción que permite precio único en suministros/servicios perfectamente definidos sin variación de plazos ni modificaciones.");
      }
    }

    if ((input.intellectualService || input.annexIVService) && qualityWeightPercent < 51) {
      blockers.push("Los criterios relacionados con la calidad deben representar al menos el 51% en servicios del Anexo IV o prestaciones intelectuales.");
    }

    if (input.criteria.length > 1 && formulaWeightPercent < judgmentWeightPercent) {
      warnings.push("Los criterios sometidos a juicio de valor pesan más que los evaluables mediante fórmulas; debe comprobarse el régimen de evaluación del artículo 146.2 y, en su caso, el comité de expertos.");
    }

    return {
      totalWeightPercent: roundedTotal,
      criteriaCount: input.criteria.length,
      qualityWeightPercent,
      costWeightPercent,
      formulaWeightPercent,
      judgmentWeightPercent,
      valid: blockers.length === 0,
      blockers,
      warnings,
      legalBasis: ["arts. 145 y 146 LCSP"],
      humanValidationRequired: true,
    };
  }
}
