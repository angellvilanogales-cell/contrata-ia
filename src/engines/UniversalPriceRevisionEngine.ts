import { UniversalTargetContractType } from "../domain/capabilities/UniversalContractCoverage";

export interface UniversalPriceRevisionInput {
  contractType: UniversalTargetContractType;
  provisionalPrice: boolean;
  manufacturingArmamentOrPublicEquipmentSupply?: boolean;
  energySupply?: boolean;
  investmentRecoveryPeriodYears?: number;
  rawMaterialsIntermediateGoodsAndEnergySharePercent?: number;
  executedPercent?: number;
  monthsSinceFormalization?: number;
}

export type PriceRevisionEligibility = "ELIGIBLE_IN_PRINCIPLE" | "NOT_ELIGIBLE" | "PENDING_FACTS";

export interface UniversalPriceRevisionDecision {
  eligibility: PriceRevisionEligibility;
  canAccrueNow: boolean | "PENDING";
  formulaMustBePredeterminedAndFixed: boolean;
  blockers: readonly string[];
  notes: readonly string[];
  legalBasis: readonly string[];
  humanValidationRequired: true;
}

function validPercent(value: number | undefined): boolean {
  return value !== undefined && Number.isFinite(value) && value >= 0 && value <= 100;
}

/**
 * Evalúa la procedencia abstracta y las guardas temporales del art. 103 LCSP.
 * No genera una fórmula de revisión ni selecciona índices oficiales.
 */
export class UniversalPriceRevisionEngine {
  public evaluate(input: UniversalPriceRevisionInput): UniversalPriceRevisionDecision {
    const blockers: string[] = [];
    const notes: string[] = [];

    if (input.provisionalPrice) {
      return {
        eligibility: "NOT_ELIGIBLE",
        canAccrueNow: false,
        formulaMustBePredeterminedAndFixed: true,
        blockers: [],
        notes: ["Los contratos celebrados con precios provisionales no admiten revisión de precios."],
        legalBasis: ["arts. 102.7 y 103 LCSP"],
        humanValidationRequired: true,
      };
    }

    const recovery = input.investmentRecoveryPeriodYears;
    const materialsShare = input.rawMaterialsIntermediateGoodsAndEnergySharePercent;
    if (recovery !== undefined && (!Number.isFinite(recovery) || recovery < 0)) throw new Error("investmentRecoveryPeriodYears inválido.");
    if (materialsShare !== undefined && !validPercent(materialsShare)) throw new Error("rawMaterialsIntermediateGoodsAndEnergySharePercent inválido.");

    let eligibility: PriceRevisionEligibility;
    if (input.contractType === "WORKS" || input.manufacturingArmamentOrPublicEquipmentSupply || input.energySupply) {
      eligibility = "ELIGIBLE_IN_PRINCIPLE";
    } else if (recovery !== undefined && recovery >= 5) {
      eligibility = "ELIGIBLE_IN_PRINCIPLE";
    } else if (materialsShare !== undefined && materialsShare > 20) {
      eligibility = "ELIGIBLE_IN_PRINCIPLE";
      notes.push("La revisión solo puede afectar a la fracción del precio representada por materias primas, bienes intermedios y energía; el pliego debe identificar pesos e índices oficiales en los términos del art. 103.2.");
    } else if (recovery === undefined && materialsShare === undefined) {
      eligibility = "PENDING_FACTS";
      blockers.push("Faltan hechos sobre período de recuperación de la inversión y/o participación de materias primas, bienes intermedios y energía para decidir la procedencia de revisión.");
    } else {
      eligibility = "NOT_ELIGIBLE";
    }

    let canAccrueNow: boolean | "PENDING" = false;
    if (eligibility === "ELIGIBLE_IN_PRINCIPLE") {
      if (input.energySupply) {
        canAccrueNow = "PENDING";
        notes.push("El suministro de energía queda exceptuado de la guarda general conjunta del 20% ejecutado y un año; debe aplicarse su régimen específico.");
      } else if (!validPercent(input.executedPercent) || input.monthsSinceFormalization === undefined) {
        canAccrueNow = "PENDING";
        blockers.push("Para determinar si la revisión puede devengarse ahora faltan porcentaje ejecutado y/o tiempo desde la formalización.");
      } else if (!Number.isFinite(input.monthsSinceFormalization) || input.monthsSinceFormalization < 0) {
        throw new Error("monthsSinceFormalization inválido.");
      } else {
        canAccrueNow = input.executedPercent! >= 20 && input.monthsSinceFormalization >= 12;
      }
    }

    return {
      eligibility,
      canAccrueNow,
      formulaMustBePredeterminedAndFixed: true,
      blockers,
      notes,
      legalBasis: ["arts. 103-105 LCSP", "Ley 2/2015 de desindexación"],
      humanValidationRequired: true,
    };
  }
}
