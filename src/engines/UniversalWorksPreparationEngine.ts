export interface UniversalWorksPreparationInput {
  projectPrepared: boolean;
  projectApproved: boolean;
  projectReplanted: boolean;
  jointDesignAndBuild?: boolean;
  baseTenderBudgetExVatCents: number;
  affectsStabilitySafetyOrWatertightness?: boolean;
  supervisionReportAvailable?: boolean;
  landAvailabilityConfirmed?: boolean;
  landAvailabilityException?: "HYDRAULIC_TRANSPORT_ROAD_INFRASTRUCTURE" | "PUBLIC_ENTITY_TRANSFER";
}

export interface UniversalWorksPreparationDecision {
  preparationReady: boolean;
  supervisionRequired: boolean;
  blockers: readonly string[];
  warnings: readonly string[];
  legalBasis: readonly string[];
  humanValidationRequired: true;
}

function requireMoney(value: number): void {
  if (!Number.isInteger(value) || value < 0) throw new Error("baseTenderBudgetExVatCents debe ser un entero no negativo.");
}

/**
 * Guarda de preparación del contrato de obras.
 * No genera proyecto, acta de replanteo, disponibilidad de terrenos ni informe de supervisión.
 */
export class UniversalWorksPreparationEngine {
  public evaluate(input: UniversalWorksPreparationInput): UniversalWorksPreparationDecision {
    requireMoney(input.baseTenderBudgetExVatCents);
    const blockers: string[] = [];
    const warnings: string[] = [];

    if (!input.projectPrepared) blockers.push("No consta proyecto de obras elaborado.");
    if (!input.projectApproved) blockers.push("No consta proyecto de obras aprobado.");

    if (input.jointDesignAndBuild) {
      if (!input.projectReplanted) blockers.push("En adjudicación conjunta proyecto-obra, la ejecución no puede habilitarse sin supervisión, aprobación y replanteo del proyecto resultante.");
    } else if (!input.projectReplanted) {
      blockers.push("No consta el replanteo previo del proyecto exigible antes de aprobar el expediente de contratación de obras.");
    }

    const supervisionRequired = input.baseTenderBudgetExVatCents >= 50_000_000 || input.affectsStabilitySafetyOrWatertightness === true;
    if (supervisionRequired && input.supervisionReportAvailable !== true) {
      blockers.push("El proyecto requiere informe preceptivo de supervisión y no consta incorporado.");
    }
    if (!supervisionRequired && input.supervisionReportAvailable !== true) {
      warnings.push("El informe de supervisión no es preceptivo por los hechos declarados; puede resultar facultativo o venir exigido por normativa técnica específica.");
    }

    const landSatisfied = input.landAvailabilityConfirmed === true
      || input.landAvailabilityException === "HYDRAULIC_TRANSPORT_ROAD_INFRASTRUCTURE"
      || input.landAvailabilityException === "PUBLIC_ENTITY_TRANSFER";
    if (!landSatisfied) blockers.push("No consta disponibilidad de los terrenos ni excepción legal acreditada para el replanteo.");

    return {
      preparationReady: blockers.length === 0,
      supervisionRequired,
      blockers,
      warnings,
      legalBasis: ["arts. 231, 235 y 236 LCSP"],
      humanValidationRequired: true,
    };
  }
}
