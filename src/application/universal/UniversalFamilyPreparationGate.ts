import { UniversalTargetContractType } from "../../domain/capabilities/UniversalContractCoverage";
import { UniversalWorksPreparationEngine, UniversalWorksPreparationInput } from "../../engines/UniversalWorksPreparationEngine";
import { UniversalConcessionPreparationEngine, UniversalConcessionPreparationInput } from "../../engines/UniversalConcessionPreparationEngine";
import { UniversalMixedContractEngine, UniversalMixedContractInput } from "../../engines/UniversalMixedContractEngine";

export interface UniversalFamilyPreparationInput {
  contractType: UniversalTargetContractType;
  works?: UniversalWorksPreparationInput;
  concession?: UniversalConcessionPreparationInput;
  mixed?: UniversalMixedContractInput;
}

export interface UniversalFamilyPreparationResult {
  contractType: UniversalTargetContractType;
  ready: boolean;
  appliedGate: "TRANSVERSAL_ONLY" | "WORKS" | "CONCESSION" | "MIXED";
  blockers: readonly string[];
  warnings: readonly string[];
  humanValidationRequired: true;
}

/**
 * LB91.13 - frontera única para activar hechos específicos de familia.
 * SUPPLY y SERVICE continúan por módulos transversales; WORKS, CONCESSION y MIXED
 * no pueden continuar si falta su evidencia estructural específica.
 */
export class UniversalFamilyPreparationGate {
  public evaluate(input: UniversalFamilyPreparationInput): UniversalFamilyPreparationResult {
    if (input.contractType === "SUPPLY" || input.contractType === "SERVICE") {
      return {
        contractType: input.contractType,
        ready: true,
        appliedGate: "TRANSVERSAL_ONLY",
        blockers: [],
        warnings: ["La preparación familiar no sustituye los gates transversales, documentales ni de evidencia."],
        humanValidationRequired: true,
      };
    }

    if (input.contractType === "WORKS") {
      if (!input.works) return this.missing(input.contractType, "WORKS", "Faltan hechos específicos de preparación del contrato de obras.");
      const result = new UniversalWorksPreparationEngine().evaluate(input.works);
      return { contractType: input.contractType, ready: result.preparationReady, appliedGate: "WORKS", blockers: result.blockers, warnings: result.warnings, humanValidationRequired: true };
    }

    if (input.contractType === "CONCESSION") {
      if (!input.concession) return this.missing(input.contractType, "CONCESSION", "Faltan hechos específicos de riesgo operacional y preparación de la concesión.");
      const result = new UniversalConcessionPreparationEngine().evaluate(input.concession);
      return { contractType: input.contractType, ready: result.preparationReady, appliedGate: "CONCESSION", blockers: result.blockers, warnings: result.warnings, humanValidationRequired: true };
    }

    if (!input.mixed) return this.missing(input.contractType, "MIXED", "Faltan hechos para determinar la estructura y prestación principal del contrato mixto.");
    const result = new UniversalMixedContractEngine().evaluate(input.mixed);
    return { contractType: input.contractType, ready: result.mixedContractSupported, appliedGate: "MIXED", blockers: result.blockers, warnings: result.warnings, humanValidationRequired: true };
  }

  private missing(
    contractType: UniversalTargetContractType,
    appliedGate: "WORKS" | "CONCESSION" | "MIXED",
    blocker: string,
  ): UniversalFamilyPreparationResult {
    return { contractType, ready: false, appliedGate, blockers: [blocker], warnings: [], humanValidationRequired: true };
  }
}
