import { UniversalTargetContractType } from "../domain/capabilities/UniversalContractCoverage";

export interface UniversalExecutionConditionInput {
  id: string;
  linkedToObject: boolean;
  nonDiscriminatory: boolean;
  euLawCompatible: boolean;
  statedInNoticeAndPliegos: boolean;
  family: "ENVIRONMENTAL" | "SOCIAL" | "EMPLOYMENT" | "ETHICAL" | "INNOVATION" | "ECONOMIC" | "DATA_PROTECTION" | "OTHER";
  appliesToSubcontractors: boolean;
}

export interface UniversalPenaltyInput {
  id: string;
  individualMaximumPercentOfContractPriceExVat: number;
  aggregateMaximumPercentOfContractPriceExVat: number;
  proportionalToBreach: boolean;
}

export interface UniversalExecutionInput {
  contractType: UniversalTargetContractType;
  specialConditions: readonly UniversalExecutionConditionInput[];
  publicBodyTransfersPersonalDataToContractor: boolean;
  penalties: readonly UniversalPenaltyInput[];
  subcontractingAllowed?: boolean;
  subcontractingRestrictionMayRestrictCompetition?: boolean;
  criticalTasksReservedToMainContractor?: boolean;
  criticalTasksJustifiedInFile?: boolean;
  foodServiceInPublicInstitution?: boolean;
  foodWasteConditionIncluded?: boolean;
}

export interface UniversalExecutionDecision {
  valid: boolean;
  blockers: readonly string[];
  warnings: readonly string[];
  legalBasis: readonly string[];
  humanValidationRequired: true;
}

function validPercent(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

/**
 * Valida hechos de ejecución ya definidos por el expediente.
 * No redacta automáticamente condiciones especiales, penalidades ni restricciones
 * de subcontratación.
 */
export class UniversalExecutionEngine {
  public evaluate(input: UniversalExecutionInput): UniversalExecutionDecision {
    const blockers: string[] = [];
    const warnings: string[] = [];

    if (input.specialConditions.length < 1) {
      blockers.push("El PCAP debe incluir al menos una condición especial de ejecución de las previstas en el artículo 202.2 LCSP.");
    }

    const ids = new Set<string>();
    for (const condition of input.specialConditions) {
      if (!condition.id.trim()) blockers.push("Existe una condición especial de ejecución sin identificador.");
      if (ids.has(condition.id)) blockers.push(`Condición especial duplicada: ${condition.id}.`);
      ids.add(condition.id);
      if (!condition.linkedToObject) blockers.push(`La condición ${condition.id} no consta vinculada al objeto.`);
      if (!condition.nonDiscriminatory) blockers.push(`La condición ${condition.id} presenta riesgo de discriminación directa o indirecta.`);
      if (!condition.euLawCompatible) blockers.push(`La condición ${condition.id} no consta compatible con el Derecho de la Unión Europea.`);
      if (!condition.statedInNoticeAndPliegos) blockers.push(`La condición ${condition.id} debe constar en el anuncio y en los pliegos.`);
      if (!condition.appliesToSubcontractors) blockers.push(`La condición ${condition.id} debe exigirse también a los subcontratistas que participen en la ejecución.`);
    }

    if (input.publicBodyTransfersPersonalDataToContractor) {
      const hasDataProtection = input.specialConditions.some(item => item.family === "DATA_PROTECTION");
      if (!hasDataProtection) blockers.push("La cesión de datos personales al contratista exige una condición especial de ejecución de sometimiento a la normativa nacional y de la Unión en protección de datos, con carácter de obligación contractual esencial.");
    }

    if (input.foodServiceInPublicInstitution && !input.foodWasteConditionIncluded) {
      blockers.push("Los servicios de alimentación en instituciones públicas deben incorporar la condición especial de ejecución sobre prevención de pérdidas y desperdicio alimentario cuando concurran las condiciones del artículo 202.1 LCSP.");
    }

    for (const penalty of input.penalties) {
      if (!penalty.id.trim()) blockers.push("Existe una penalidad sin identificador.");
      if (!validPercent(penalty.individualMaximumPercentOfContractPriceExVat) || penalty.individualMaximumPercentOfContractPriceExVat > 10) {
        blockers.push(`La penalidad ${penalty.id} supera o no acredita el límite individual del 10% del precio del contrato sin IVA.`);
      }
      if (!validPercent(penalty.aggregateMaximumPercentOfContractPriceExVat) || penalty.aggregateMaximumPercentOfContractPriceExVat > 50) {
        blockers.push(`La configuración de penalidades ${penalty.id} supera o no acredita el límite agregado del 50% del precio del contrato sin IVA.`);
      }
      if (!penalty.proportionalToBreach) blockers.push(`La penalidad ${penalty.id} no consta proporcional a la gravedad del incumplimiento.`);
    }

    if (input.subcontractingAllowed === false && input.subcontractingRestrictionMayRestrictCompetition) {
      blockers.push("Una limitación de la subcontratación no puede producir una restricción efectiva de la competencia fuera de los supuestos legalmente exceptuados.");
    }
    if (input.criticalTasksReservedToMainContractor && !input.criticalTasksJustifiedInFile) {
      blockers.push("Las tareas críticas reservadas al contratista principal deben justificarse en el expediente conforme al artículo 215.2.e LCSP.");
    }

    if (!input.penalties.length) {
      warnings.push("No constan penalidades específicas aportadas. Debe comprobarse si el expediente necesita tipificar incumplimientos o si resultan aplicables las penalidades legales de demora y demás consecuencias previstas en la LCSP.");
    }

    if (input.contractType === "CONCESSION") {
      warnings.push("Las concesiones tienen reglas específicas de efectos, incumplimientos, secuestro/intervención y penalidades; este módulo transversal no sustituye el módulo concesional específico.");
    }

    return {
      valid: blockers.length === 0,
      blockers,
      warnings,
      legalBasis: ["arts. 192-202 y 215 LCSP"],
      humanValidationRequired: true,
    };
  }
}
