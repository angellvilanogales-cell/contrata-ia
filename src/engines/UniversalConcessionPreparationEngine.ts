export type UniversalConcessionSubtype = "WORKS_CONCESSION" | "SERVICE_CONCESSION";

export interface UniversalConcessionPreparationInput {
  subtype: UniversalConcessionSubtype;
  operationalRiskTransferred: boolean | "UNKNOWN";
  demandRiskTransferred?: boolean;
  supplyRiskTransferred?: boolean;
  viabilityStudyApproved: boolean;
  viabilityStudyKind?: "FULL" | "ECONOMIC_FINANCIAL";
  durationYears: number;
  durationRecoveryJustified?: boolean;
  includesWorks?: boolean;
  worksAnteprojectPrepared?: boolean;
  worksProjectPreparedApprovedReplanted?: boolean;
  publicServiceLegalRegimeEstablished?: boolean;
  serviceReservedToAdministration?: boolean;
}

export interface UniversalConcessionPreparationDecision {
  preparationReady: boolean;
  operationalRiskReady: boolean;
  blockers: readonly string[];
  warnings: readonly string[];
  legalBasis: readonly string[];
  humanValidationRequired: true;
}

/** Guarda hechos estructurales de concesiones sin presumir riesgo operacional ni viabilidad. */
export class UniversalConcessionPreparationEngine {
  public evaluate(input: UniversalConcessionPreparationInput): UniversalConcessionPreparationDecision {
    if (!Number.isFinite(input.durationYears) || input.durationYears <= 0) throw new Error("durationYears debe ser positivo.");
    const blockers: string[] = [];
    const warnings: string[] = [];

    const operationalRiskReady = input.operationalRiskTransferred === true
      && (input.demandRiskTransferred === true || input.supplyRiskTransferred === true);
    if (!operationalRiskReady) blockers.push("No consta acreditada una transferencia efectiva del riesgo operacional de demanda, de suministro o de ambos.");

    if (!input.viabilityStudyApproved) blockers.push("No consta aprobado el estudio de viabilidad o, cuando proceda, el estudio de viabilidad económico-financiera.");
    if (input.viabilityStudyApproved && !input.viabilityStudyKind) warnings.push("Debe conservarse trazabilidad del tipo de estudio de viabilidad aprobado.");

    if (input.durationYears > 5 && input.durationRecoveryJustified !== true) {
      blockers.push("La duración superior a cinco años no consta justificada por el tiempo razonable de recuperación de inversiones y rendimiento del capital.");
    }

    if (input.subtype === "WORKS_CONCESSION") {
      if (input.includesWorks === false) blockers.push("Una concesión de obras requiere obras comprendidas en su objeto.");
      if (input.worksAnteprojectPrepared !== true && input.worksProjectPreparedApprovedReplanted !== true) {
        blockers.push("No consta anteproyecto o proyecto con el grado de preparación exigible para la concesión de obras.");
      }
    }

    if (input.subtype === "SERVICE_CONCESSION") {
      if (input.serviceReservedToAdministration === true) blockers.push("La prestación declarada no puede canalizarse mediante concesión de servicios.");
      if (input.publicServiceLegalRegimeEstablished === false) blockers.push("Tratándose de un servicio público, no consta establecido previamente su régimen jurídico.");
      if (input.includesWorks && input.worksProjectPreparedApprovedReplanted !== true) blockers.push("La concesión de servicios incluye obras y no consta preparada la documentación de obra exigible.");
    }

    return {
      preparationReady: blockers.length === 0,
      operationalRiskReady,
      blockers,
      warnings,
      legalBasis: input.subtype === "WORKS_CONCESSION"
        ? ["arts. 14, 29.6 y 247-250 LCSP"]
        : ["arts. 15, 29.6, 284 y 285 LCSP"],
      humanValidationRequired: true,
    };
  }
}
