import { UniversalTargetContractType } from "../domain/capabilities/UniversalContractCoverage";

export interface UniversalRemediesInput {
  contractType: UniversalTargetContractType;
  estimatedValueExVatCents: number;
  contractingEntityIsContractingAuthority: boolean;
  mixedPrincipalContractType?: Exclude<UniversalTargetContractType, "MIXED">;
  frameworkAgreementOrDynamicPurchasingSystem?: boolean;
  frameworkOrDpsObjectFallsWithinArticle44_1a?: boolean;
}

export interface UniversalRemediesDecision {
  effectiveContractType?: Exclude<UniversalTargetContractType, "MIXED">;
  specialProcurementAppealContractScope: boolean | "PENDING";
  thresholdExVatCents?: number;
  thresholdComparison?: "STRICTLY_GREATER_THAN";
  legalBasis: readonly string[];
  blockers: readonly string[];
  notes: readonly string[];
  humanValidationRequired: true;
}

function requireValidCents(value: number): void {
  if (!Number.isInteger(value) || value < 0) throw new Error("estimatedValueExVatCents debe ser un entero no negativo.");
}

/**
 * Determina únicamente si el contrato entra, por tipo/VE, en el ámbito contractual
 * del recurso especial del art. 44.1 LCSP. No decide si un acto concreto es recurrible
 * (art. 44.2), la legitimación, el plazo ni el órgano competente.
 */
export class UniversalRemediesEngine {
  public evaluate(input: UniversalRemediesInput): UniversalRemediesDecision {
    requireValidCents(input.estimatedValueExVatCents);

    if (!input.contractingEntityIsContractingAuthority) {
      return {
        specialProcurementAppealContractScope: "PENDING",
        legalBasis: ["art. 44.1 LCSP"],
        blockers: ["No consta que la entidad tenga condición de poder adjudicador; el motor no presume la aplicación del recurso especial."],
        notes: [],
        humanValidationRequired: true,
      };
    }

    if (input.frameworkAgreementOrDynamicPurchasingSystem) {
      if (input.frameworkOrDpsObjectFallsWithinArticle44_1a === undefined) {
        return {
          specialProcurementAppealContractScope: "PENDING",
          legalBasis: ["art. 44.1.b LCSP"],
          blockers: ["Acuerdo marco/SDA sin acreditar que su objeto comprende contratos de los tipificados en el artículo 44.1.a."],
          notes: [],
          humanValidationRequired: true,
        };
      }
      return {
        specialProcurementAppealContractScope: input.frameworkOrDpsObjectFallsWithinArticle44_1a,
        legalBasis: ["art. 44.1.b LCSP"],
        blockers: [],
        notes: ["La conclusión se limita al ámbito contractual del acuerdo marco/SDA y conserva como hecho la clasificación de su objeto."],
        humanValidationRequired: true,
      };
    }

    const effectiveContractType = input.contractType === "MIXED"
      ? input.mixedPrincipalContractType
      : input.contractType;

    if (!effectiveContractType) {
      return {
        specialProcurementAppealContractScope: "PENDING",
        legalBasis: ["arts. 18 y 44.1 LCSP"],
        blockers: ["Contrato mixto sin prestación principal jurídicamente determinada: no puede seleccionarse el umbral del recurso especial."],
        notes: [],
        humanValidationRequired: true,
      };
    }

    const thresholdExVatCents = effectiveContractType === "SUPPLY" || effectiveContractType === "SERVICE"
      ? 10_000_000
      : 300_000_000;

    const specialProcurementAppealContractScope = input.estimatedValueExVatCents > thresholdExVatCents;
    const legalBasis = effectiveContractType === "CONCESSION"
      ? ["art. 44.1.c LCSP"]
      : ["art. 44.1.a LCSP"];

    return {
      effectiveContractType,
      specialProcurementAppealContractScope,
      thresholdExVatCents,
      thresholdComparison: "STRICTLY_GREATER_THAN",
      legalBasis,
      blockers: [],
      notes: [
        "Esta decisión solo cubre el ámbito contractual por tipo y valor estimado.",
        "Antes de informar un recurso concreto deben analizarse acto recurrible (art. 44.2), legitimación, plazo, suspensión y órgano competente.",
      ],
      humanValidationRequired: true,
    };
  }
}
