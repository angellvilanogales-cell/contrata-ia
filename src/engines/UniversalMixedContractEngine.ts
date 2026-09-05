import { UniversalTargetContractType } from "../domain/capabilities/UniversalContractCoverage";

export type MixedNonMixedContractType = Exclude<UniversalTargetContractType, "MIXED">;

export interface MixedComponentInput {
  contractType: MixedNonMixedContractType;
  estimatedValueExVatCents?: number;
  functionallyLinked: boolean;
  complementaryRelationship: boolean;
}

export interface UniversalMixedContractInput {
  components: readonly MixedComponentInput[];
  declaredPrincipalContractType?: MixedNonMixedContractType;
  includesConcessionComponent?: boolean;
  objectivelySeparable?: boolean;
}

export interface UniversalMixedContractDecision {
  mixedContractSupported: boolean;
  principalContractType?: MixedNonMixedContractType;
  blockers: readonly string[];
  warnings: readonly string[];
  legalBasis: readonly string[];
  humanValidationRequired: true;
}

/**
 * Comprueba la estructura mínima de un contrato mixto.
 * No usa porcentajes o valores ausentes para fabricar una prestación principal.
 */
export class UniversalMixedContractEngine {
  public evaluate(input: UniversalMixedContractInput): UniversalMixedContractDecision {
    const blockers: string[] = [];
    const warnings: string[] = [];
    if (input.components.length < 2) blockers.push("Un contrato mixto exige al menos dos prestaciones correspondientes a clases contractuales distintas.");

    const types = new Set(input.components.map(item => item.contractType));
    if (types.size < 2) blockers.push("Las prestaciones declaradas pertenecen a una sola clase contractual; no se acredita contrato mixto.");

    for (const component of input.components) {
      if (!component.functionallyLinked || !component.complementaryRelationship) {
        blockers.push(`La prestación ${component.contractType} no consta directamente vinculada y complementaria respecto del objeto conjunto.`);
      }
      if (component.estimatedValueExVatCents !== undefined && (!Number.isInteger(component.estimatedValueExVatCents) || component.estimatedValueExVatCents < 0)) {
        throw new Error("estimatedValueExVatCents debe ser un entero no negativo cuando se informe.");
      }
    }

    let principalContractType = input.declaredPrincipalContractType;
    const onlySupplyService = types.size === 2 && types.has("SUPPLY") && types.has("SERVICE");
    if (onlySupplyService) {
      const supply = input.components.find(item => item.contractType === "SUPPLY");
      const service = input.components.find(item => item.contractType === "SERVICE");
      if (supply?.estimatedValueExVatCents !== undefined && service?.estimatedValueExVatCents !== undefined) {
        const derived = supply.estimatedValueExVatCents > service.estimatedValueExVatCents ? "SUPPLY" : "SERVICE";
        if (supply.estimatedValueExVatCents === service.estimatedValueExVatCents) {
          blockers.push("Los valores estimados de suministro y servicio son iguales; no puede determinarse automáticamente el objeto principal por valor.");
        } else if (principalContractType && principalContractType !== derived) {
          blockers.push(`La prestación principal declarada (${principalContractType}) contradice el mayor valor estimado entre servicios y suministros (${derived}).`);
        } else {
          principalContractType = derived;
        }
      } else if (!principalContractType) {
        blockers.push("Faltan valores estimados separados o una determinación validada de la prestación principal para el mixto suministro-servicio.");
      }
    } else if (!principalContractType) {
      blockers.push("No consta determinada y validada la prestación principal del contrato mixto.");
    }

    if (input.includesConcessionComponent) {
      warnings.push("La presencia de una concesión exige aplicar además las reglas específicas del artículo 18 LCSP sobre prestaciones separables/no separables y conservar la transferencia del riesgo operacional.");
      if (input.objectivelySeparable === undefined) blockers.push("Falta determinar si las prestaciones con componente concesional son objetivamente separables.");
    }

    return {
      mixedContractSupported: blockers.length === 0,
      principalContractType,
      blockers,
      warnings,
      legalBasis: ["arts. 18 y 34.2 LCSP"],
      humanValidationRequired: true,
    };
  }
}
