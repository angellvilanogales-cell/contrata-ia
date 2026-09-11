import { UniversalTargetContractType } from "../domain/capabilities/UniversalContractCoverage";

export type ModificationRoute = "PLANNED_ART_204" | "UNPLANNED_ART_205" | "DA33_HIGHER_REAL_NEEDS";

export interface UniversalModificationInput {
  contractType: UniversalTargetContractType;
  route: ModificationRoute;
  initialPriceExVatCents: number;
  maximumModificationPercent?: number;
  expresslyForeseenInPcap?: boolean;
  clauseClearPreciseAndUnambiguous?: boolean;
  scopeLimitsAndNatureDefined?: boolean;
  objectiveTriggerConditionsDefined?: boolean;
  procedureDefined?: boolean;
  createsNewUnitPrices?: boolean;
  changesGlobalNature?: boolean;
  strictlyIndispensableVariation?: boolean;
  article205Ground?: "ADDITIONAL_PRESTATIONS" | "UNFORESEEABLE_CIRCUMSTANCES" | "NON_SUBSTANTIAL";
  successiveUnitPriceNeedsContract?: boolean;
  maximumBudgetApprovedCents?: number;
  maximumBudgetAlreadyExhausted?: boolean;
  creditReservedForHigherNeeds?: boolean;
}

export interface UniversalModificationDecision {
  route: ModificationRoute;
  legallyClosable: boolean;
  maximumAmountExVatCents?: number;
  blockers: readonly string[];
  warnings: readonly string[];
  legalBasis: readonly string[];
  humanValidationRequired: true;
}

function validCents(value: number | undefined): value is number {
  return value !== undefined && Number.isInteger(value) && value >= 0;
}

function validPercent(value: number | undefined): value is number {
  return value !== undefined && Number.isFinite(value) && value >= 0 && value <= 100;
}

/**
 * Valida las guardas estructurales de modificaciones contractuales.
 * No declara automáticamente cumplido el art. 205: sus causas requieren examen
 * jurídico individualizado y documentación del expediente.
 */
export class UniversalModificationEngine {
  public evaluate(input: UniversalModificationInput): UniversalModificationDecision {
    if (!validCents(input.initialPriceExVatCents)) throw new Error("initialPriceExVatCents debe ser un entero no negativo.");
    const blockers: string[] = [];
    const warnings: string[] = [];

    if (input.route === "PLANNED_ART_204") {
      if (!validPercent(input.maximumModificationPercent)) blockers.push("La modificación prevista requiere porcentaje máximo determinado.");
      else if (input.maximumModificationPercent > 20) blockers.push("La modificación prevista del artículo 204 no puede superar el 20% del precio inicial.");
      if (!input.expresslyForeseenInPcap) blockers.push("La posibilidad de modificación no consta advertida expresamente en el PCAP.");
      if (!input.clauseClearPreciseAndUnambiguous) blockers.push("La cláusula no consta formulada de forma clara, precisa e inequívoca.");
      if (!input.scopeLimitsAndNatureDefined) blockers.push("La cláusula debe definir alcance, límites y naturaleza de la modificación.");
      if (!input.objectiveTriggerConditionsDefined) blockers.push("Faltan condiciones objetivamente verificables que activen la modificación.");
      if (!input.procedureDefined) blockers.push("Falta el procedimiento para tramitar la modificación prevista.");
      if (input.createsNewUnitPrices) blockers.push("La modificación prevista no puede establecer nuevos precios unitarios no previstos en el contrato.");
      if (input.changesGlobalNature) blockers.push("La modificación prevista no puede alterar la naturaleza global del contrato inicial.");
      const maximumAmountExVatCents = validPercent(input.maximumModificationPercent)
        ? Math.round(input.initialPriceExVatCents * input.maximumModificationPercent / 100)
        : undefined;
      return {
        route: input.route,
        legallyClosable: blockers.length === 0,
        maximumAmountExVatCents,
        blockers,
        warnings,
        legalBasis: ["arts. 203.2.a y 204 LCSP"],
        humanValidationRequired: true,
      };
    }

    if (input.route === "DA33_HIGHER_REAL_NEEDS") {
      if (!(input.contractType === "SUPPLY" || input.contractType === "SERVICE")) {
        blockers.push("La DA 33.ª solo se aplica a suministros y servicios sucesivos por necesidades en los términos legales.");
      }
      if (!input.successiveUnitPriceNeedsContract) blockers.push("No consta que sea un contrato sucesivo por precio unitario subordinado a necesidades reales.");
      if (!validCents(input.maximumBudgetApprovedCents)) blockers.push("La DA 33.ª exige presupuesto máximo aprobado.");
      if (!input.expresslyForeseenInPcap) blockers.push("Las mayores necesidades deben estar previstas en la documentación de la licitación en los términos del artículo 204.");
      if (input.maximumBudgetAlreadyExhausted) blockers.push("La modificación por mayores necesidades debe tramitarse antes de agotar el presupuesto máximo inicialmente aprobado.");
      if (!input.creditReservedForHigherNeeds) blockers.push("Debe reservarse crédito para cubrir el importe máximo de las nuevas necesidades.");
      if (input.createsNewUnitPrices) blockers.push("La ruta DA 33.ª no puede utilizarse para introducir nuevos precios unitarios mediante una modificación prevista del artículo 204.");
      if (input.changesGlobalNature) blockers.push("La modificación no puede alterar la naturaleza global del contrato.");
      if (!validPercent(input.maximumModificationPercent)) blockers.push("Debe identificarse el porcentaje máximo previsto para la modificación.");
      else if (input.maximumModificationPercent > 20) blockers.push("La modificación prevista que articula la DA 33.ª no puede superar el 20% del precio inicial conforme al artículo 204.");
      return {
        route: input.route,
        legallyClosable: blockers.length === 0,
        maximumAmountExVatCents: validPercent(input.maximumModificationPercent)
          ? Math.round(input.initialPriceExVatCents * input.maximumModificationPercent / 100)
          : undefined,
        blockers,
        warnings,
        legalBasis: ["DA 33.ª LCSP", "arts. 203.2.a y 204 LCSP"],
        humanValidationRequired: true,
      };
    }

    // UNPLANNED_ART_205
    if (!input.article205Ground) blockers.push("Debe identificarse uno de los supuestos tasados del artículo 205.2.");
    if (!input.strictlyIndispensableVariation) blockers.push("La modificación no prevista debe limitarse a las variaciones estrictamente indispensables para responder a su causa objetiva.");
    if (input.changesGlobalNature) warnings.push("Debe analizarse específicamente si el cambio compromete la naturaleza global o la sustancialidad del contrato; esta ruta no puede cerrarse automáticamente.");
    warnings.push("La concurrencia material de los requisitos específicos del artículo 205.2 debe motivarse y revisarse jurídicamente caso por caso; seleccionar una categoría no basta para aprobar la modificación.");
    return {
      route: input.route,
      legallyClosable: false,
      blockers: blockers.length ? blockers : ["La modificación no prevista requiere revisión jurídica individual del supuesto concreto del artículo 205.2 antes de poder cerrarse."],
      warnings,
      legalBasis: ["arts. 203.2.b, 205-207 LCSP"],
      humanValidationRequired: true,
    };
  }
}
