import { UniversalTargetContractType } from "../domain/capabilities/UniversalContractCoverage";

export type LotDecisionIntent = "DIVIDE" | "NO_DIVIDE" | "UNASSESSED";
export type NoDivisionReasonKind = "TECHNICAL_COORDINATION" | "COMPETITION_RISK" | "OTHER_MOTIVATED";

export interface UniversalLotsInput {
  contractType: UniversalTargetContractType;
  concessionSubtype?: "WORKS_CONCESSION" | "SERVICE_CONCESSION";
  natureOrObjectAllowsIndependentParts?: boolean;
  decision: LotDecisionIntent;
  noDivisionReasonKind?: NoDivisionReasonKind;
  noDivisionReasonText?: string;
  competitionAuthorityPriorReportAvailable?: boolean;
  lotCount?: number;
}

export interface UniversalLotsDecision {
  result: "DIVISION_VALIDATABLE" | "NO_DIVISION_VALIDATABLE" | "ASSESS_DIVISION" | "BLOCKED";
  blockers: readonly string[];
  warnings: readonly string[];
  legalBasis: readonly string[];
  humanValidationRequired: true;
}

/**
 * Controla la decisión de lotes sin fabricar una motivación de no división.
 */
export class UniversalLotsEngine {
  public evaluate(input: UniversalLotsInput): UniversalLotsDecision {
    const blockers: string[] = [];
    const warnings: string[] = [];

    if (input.contractType === "CONCESSION" && !input.concessionSubtype) {
      return {
        result: "BLOCKED",
        blockers: ["Debe distinguirse concesión de obras y concesión de servicios antes de aplicar el régimen de lotes."],
        warnings,
        legalBasis: ["arts. 99.3 y 285.1.a LCSP"],
        humanValidationRequired: true,
      };
    }

    if (input.decision === "UNASSESSED") {
      return {
        result: "ASSESS_DIVISION",
        blockers: ["La división en lotes no ha sido evaluada; el sistema no puede rellenar automáticamente la motivación."],
        warnings,
        legalBasis: ["art. 99.3 LCSP"],
        humanValidationRequired: true,
      };
    }

    if (input.decision === "DIVIDE") {
      if (!Number.isInteger(input.lotCount) || (input.lotCount ?? 0) < 2) {
        blockers.push("La decisión de dividir requiere al menos dos lotes identificados.");
      }
      if (input.natureOrObjectAllowsIndependentParts === false) {
        blockers.push("Se ha declarado que la naturaleza/objeto no permite partes independientes, en contradicción con la decisión de dividir.");
      }
      return {
        result: blockers.length ? "BLOCKED" : "DIVISION_VALIDATABLE",
        blockers,
        warnings,
        legalBasis: ["art. 99.3 LCSP"],
        humanValidationRequired: true,
      };
    }

    // NO_DIVIDE
    if (input.concessionSubtype === "WORKS_CONCESSION") {
      warnings.push("El art. 99.3 exceptúa a la concesión de obras de la regla general de motivación allí prevista; deben comprobarse sus reglas especiales y el diseño del contrato antes de cerrar el pliego.");
    } else {
      if (!input.noDivisionReasonKind) blockers.push("La no división requiere identificar un motivo válido; no se genera automáticamente.");
      if (!input.noDivisionReasonText?.trim()) blockers.push("La no división requiere motivación concreta en el expediente.");
      if (input.noDivisionReasonKind === "COMPETITION_RISK" && !input.competitionAuthorityPriorReportAvailable) {
        blockers.push("La motivación por riesgo de restricción injustificada de competencia requiere informe previo de la autoridad de defensa de la competencia.");
      }
    }

    if (input.natureOrObjectAllowsIndependentParts === true && !input.noDivisionReasonKind && input.concessionSubtype !== "WORKS_CONCESSION") {
      blockers.push("El objeto permite partes independientes y no consta motivo válido para apartarse de la división en lotes.");
    }

    return {
      result: blockers.length ? "BLOCKED" : "NO_DIVISION_VALIDATABLE",
      blockers,
      warnings,
      legalBasis: input.concessionSubtype === "SERVICE_CONCESSION" ? ["arts. 99.3 y 285.1.a LCSP"] : ["art. 99.3 LCSP"],
      humanValidationRequired: true,
    };
  }
}
