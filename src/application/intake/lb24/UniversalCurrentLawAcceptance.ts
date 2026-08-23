import { CanonicalContractType } from "../../../domain/expediente/CanonicalExpedienteState";

export interface CurrentLawSourceSnapshot {
  sourceId: string;
  locator: string;
  effectiveFrom: string;
  checkedAt: string;
  humanValidated: boolean;
  validatedBy?: string;
}

export interface SimplifiedAbbreviatedAcceptanceInput {
  contractType: CanonicalContractType;
  estimatedValueCents: number;
  intellectualService: boolean;
  allAwardCriteriaAutomaticallyEvaluable: boolean;
  source: CurrentLawSourceSnapshot;
}

export interface CurrentLawAcceptanceResult {
  ready: boolean;
  blockers: readonly string[];
  legalBasis: readonly string[];
}

export const LCSP_159_6_2026_SOURCE: CurrentLawSourceSnapshot = {
  sourceId: "boe:lcsp:art159.6:2026-01-01",
  locator: "BOE-A-2017-12902#art159.6",
  effectiveFrom: "2026-01-01",
  checkedAt: "2026-08-23",
  humanValidated: true,
  validatedBy: "LB24_CURRENT_LAW_REVIEW",
};

/**
 * LB24.1. Puerta normativa mínima y fechada para el procedimiento abierto
 * simplificado abreviado. No sustituye el motor jurídico general: evita que el
 * caso de aceptación use umbrales históricos o un supuesto incompatible con el
 * art. 159.6 LCSP vigente.
 */
export function evaluateSimplifiedAbbreviatedCurrentLaw(
  input: SimplifiedAbbreviatedAcceptanceInput,
): CurrentLawAcceptanceResult {
  const blockers: string[] = [];
  if (!input.source.humanValidated || !input.source.validatedBy?.trim()) {
    blockers.push("La fuente normativa vigente no ha sido validada humanamente.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.source.effectiveFrom) || !/^\d{4}-\d{2}-\d{2}$/.test(input.source.checkedAt)) {
    blockers.push("La fuente normativa debe conservar fechas ISO de vigencia y revisión.");
  }
  if (!Number.isSafeInteger(input.estimatedValueCents) || input.estimatedValueCents < 0) {
    blockers.push("El valor estimado debe expresarse en céntimos enteros no negativos.");
  }

  if (input.contractType === "WORKS") {
    if (input.estimatedValueCents >= 8_000_000) blockers.push("El art. 159.6 LCSP exige VE inferior a 80.000 € para obras.");
  } else if (input.contractType === "SUPPLY" || input.contractType === "SERVICE") {
    if (input.estimatedValueCents >= 6_000_000) blockers.push("El art. 159.6 LCSP exige VE inferior a 60.000 € para suministros y servicios.");
  } else {
    blockers.push(`El art. 159.6 LCSP no habilita esta puerta para ${input.contractType}.`);
  }

  if (input.contractType === "SERVICE" && input.intellectualService) {
    blockers.push("Las prestaciones de carácter intelectual quedan excluidas del art. 159.6 LCSP.");
  }
  if (!input.allAwardCriteriaAutomaticallyEvaluable) {
    blockers.push("El caso de aceptación ASA exige criterios evaluables automáticamente conforme a la tramitación del art. 159.6 LCSP.");
  }

  return {
    ready: blockers.length === 0,
    blockers,
    legalBasis: [
      "Ley 9/2017, de Contratos del Sector Público, art. 159.6",
      input.source.sourceId,
    ],
  };
}
