import { UniversalTargetContractType } from "../domain/capabilities/UniversalContractCoverage";
import { TipoProcedimiento } from "../domain/procedimiento/TipoProcedimiento";

export type GuaranteeDecisionState = "DETERMINED_BY_LAW" | "REQUIRES_MOTIVATED_DECISION" | "NOT_APPLICABLE";

export interface UniversalGuaranteeInput {
  contractType: UniversalTargetContractType;
  procedure: TipoProcedimiento;
  contractingEntityIsPublicAdministration: boolean;
  priceUsesUnitPrices?: boolean;
  baseTenderBudgetExVatCents?: number;
  bestOfferPriceExVatCents?: number;
  frameworkAgreementOrDynamicSystem?: boolean;
  reservedContractUnderAdditionalProvisionFour?: boolean;
}

export interface UniversalGuaranteeDecision {
  provisional: {
    state: GuaranteeDecisionState;
    defaultRequired: false;
    exceptionalMaximumPercent?: 3;
    legalBasis: readonly string[];
  };
  definitive: {
    state: GuaranteeDecisionState;
    required?: boolean;
    ordinaryPercent?: 5;
    calculationBasis?: "FINAL_OFFER_EX_VAT" | "BASE_TENDER_BUDGET_EX_VAT" | "CONCESSION_PCAC_DECISION" | "FRAMEWORK_OR_DPS_PCAC_DECISION";
    amountCents?: number;
    legalBasis: readonly string[];
  };
  complementary: {
    state: GuaranteeDecisionState;
    maximumAdditionalPercent?: 5;
    legalBasis: readonly string[];
  };
  blockers: readonly string[];
  humanValidationRequired: true;
}

function validMoney(value: number | undefined): value is number {
  return value !== undefined && Number.isInteger(value) && value >= 0;
}

/**
 * Motor universal conservador para Administraciones Públicas.
 * No utiliza las decisiones del perfil especializado de limpieza como regla general.
 */
export class UniversalGuaranteeEngine {
  public evaluate(input: UniversalGuaranteeInput): UniversalGuaranteeDecision {
    const blockers: string[] = [];

    if (!input.contractingEntityIsPublicAdministration) {
      return {
        provisional: { state: "REQUIRES_MOTIVATED_DECISION", defaultRequired: false, legalBasis: ["art. 114 LCSP"] },
        definitive: { state: "REQUIRES_MOTIVATED_DECISION", legalBasis: ["art. 114 LCSP"] },
        complementary: { state: "REQUIRES_MOTIVATED_DECISION", legalBasis: ["art. 114 LCSP"] },
        blockers: ["La entidad no consta como Administración Pública: debe aplicarse el régimen del artículo 114 y las reglas de la entidad, sin trasladar automáticamente los porcentajes de los artículos 106-107."],
        humanValidationRequired: true,
      };
    }

    const provisional = {
      state: "REQUIRES_MOTIVATED_DECISION" as const,
      defaultRequired: false as const,
      exceptionalMaximumPercent: 3 as const,
      legalBasis: ["art. 106.1-2 LCSP"] as const,
    };

    if (input.reservedContractUnderAdditionalProvisionFour) {
      return {
        provisional,
        definitive: {
          state: "REQUIRES_MOTIVATED_DECISION",
          required: false,
          legalBasis: ["DA 4.3 LCSP", "art. 107 LCSP"],
        },
        complementary: {
          state: "REQUIRES_MOTIVATED_DECISION",
          maximumAdditionalPercent: 5,
          legalBasis: ["art. 107.2 LCSP"],
        },
        blockers: ["Contrato reservado DA 4.ª: la garantía definitiva no procede salvo decisión excepcional motivada del órgano de contratación."],
        humanValidationRequired: true,
      };
    }

    if (input.procedure === TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO) {
      return {
        provisional,
        definitive: {
          state: "DETERMINED_BY_LAW",
          required: false,
          legalBasis: ["art. 159.6.f LCSP"],
        },
        complementary: {
          state: "NOT_APPLICABLE",
          legalBasis: ["art. 159.6.f LCSP"],
        },
        blockers,
        humanValidationRequired: true,
      };
    }

    if (input.contractType === "CONCESSION") {
      return {
        provisional,
        definitive: {
          state: "REQUIRES_MOTIVATED_DECISION",
          calculationBasis: "CONCESSION_PCAC_DECISION",
          legalBasis: ["art. 107.4 LCSP"],
        },
        complementary: {
          state: "REQUIRES_MOTIVATED_DECISION",
          maximumAdditionalPercent: 5,
          legalBasis: ["art. 107.2 LCSP"],
        },
        blockers: ["En concesiones el importe de la garantía definitiva debe fijarse en el PCAP según naturaleza, importancia y duración; el motor no puede imponer el 5% ordinario."],
        humanValidationRequired: true,
      };
    }

    if (input.frameworkAgreementOrDynamicSystem) {
      return {
        provisional,
        definitive: {
          state: "REQUIRES_MOTIVATED_DECISION",
          calculationBasis: "FRAMEWORK_OR_DPS_PCAC_DECISION",
          legalBasis: ["art. 107.5 LCSP"],
        },
        complementary: {
          state: "REQUIRES_MOTIVATED_DECISION",
          maximumAdditionalPercent: 5,
          legalBasis: ["art. 107.2 LCSP"],
        },
        blockers: ["En acuerdos marco/SDA el pliego debe decidir si la garantía es general estimativa o por contrato basado/específico."],
        humanValidationRequired: true,
      };
    }

    const calculationBasis = input.priceUsesUnitPrices ? "BASE_TENDER_BUDGET_EX_VAT" : "FINAL_OFFER_EX_VAT";
    const amountBase = input.priceUsesUnitPrices ? input.baseTenderBudgetExVatCents : input.bestOfferPriceExVatCents;
    let amountCents: number | undefined;
    if (validMoney(amountBase)) amountCents = Math.round(amountBase * 0.05);
    else blockers.push(`Falta la base económica para calcular la garantía definitiva ordinaria (${calculationBasis}).`);

    const exonerationImpossible = input.contractType === "WORKS";
    return {
      provisional,
      definitive: {
        state: exonerationImpossible ? "DETERMINED_BY_LAW" : "REQUIRES_MOTIVATED_DECISION",
        required: true,
        ordinaryPercent: 5,
        calculationBasis,
        amountCents,
        legalBasis: input.priceUsesUnitPrices ? ["art. 107.1 y 107.3 LCSP"] : ["art. 107.1 LCSP"],
      },
      complementary: {
        state: "REQUIRES_MOTIVATED_DECISION",
        maximumAdditionalPercent: 5,
        legalBasis: ["art. 107.2 LCSP"],
      },
      blockers,
      humanValidationRequired: true,
    };
  }
}
