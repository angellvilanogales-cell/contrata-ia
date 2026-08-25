import { SUPPLY_REGRESSION_CASE_003_AULAS_DIGITALES } from "./SupplyRegressionCase003AulasDigitales";

export const AULAS_REGRESSION_VERSION = "REG-SUPPLY-003-AULAS-GUARD-11.7.5-v1";

export type AulasRegressionCheck = {
  id: string;
  ok: boolean;
  purpose: string;
};

export function evaluateAulasRegressionCase(
  candidate = SUPPLY_REGRESSION_CASE_003_AULAS_DIGITALES,
) {
  const f = candidate.facts;
  const checks: AulasRegressionCheck[] = [
    { id: "AULAS-SUPPLY", ok: f.contractType === "SUMINISTRO", purpose: "Conservar la calificación de suministro." },
    { id: "AULAS-OPEN-PROCEDURE", ok: f.procedure === "ABIERTO", purpose: "Impedir que el caso se reduzca al procedimiento simplificado abreviado del golden." },
    { id: "AULAS-SARA", ok: f.sara === true, purpose: "Mantener la sujeción a regulación armonizada." },
    { id: "AULAS-NINE-LOTS", ok: f.lots === true && f.lotCount === 9, purpose: "Conservar los 9 lotes y evitar una reducción a lote único." },
    { id: "AULAS-DA33-ON", ok: f.needsBasedDA33 === true, purpose: "Mantener activa la lógica de contrato en función de necesidades." },
    { id: "AULAS-EU-FUNDS", ok: f.europeanFunds === true, purpose: "Impedir que el expediente se recodifique como autofinanciado." },
    { id: "AULAS-UNIT-PRICES", ok: f.economicMode === "PRECIOS_UNITARIOS", purpose: "Conservar la modalidad económica extraída." },
    { id: "AULAS-MULTIPLE-CRITERIA", ok: f.awardMode === "CRITERIOS_MULTIPLES", purpose: "Impedir la herencia del precio único 100 puntos del golden." },
    { id: "AULAS-EXTENSION-EXISTS", ok: f.extensions === true, purpose: "Conservar la existencia de prórroga sin inventar todavía su detalle temporal." },
    { id: "AULAS-MODIFICATION-EXISTS", ok: f.plannedModification === true, purpose: "Conservar la existencia de modificación prevista sin fijar todavía causa o porcentaje." },
  ];

  const blockers = checks.filter((check) => !check.ok);
  return {
    version: AULAS_REGRESSION_VERSION,
    caseId: candidate.id,
    passed: blockers.length === 0,
    blockers,
    checks,
    protectedScope: candidate.extractionScope.verifiedForStep1174,
    deliberatelyNotFrozenYet: candidate.extractionScope.deliberatelyNotFrozenYet,
  } as const;
}

export const AULAS_REGRESSION_BASELINE = evaluateAulasRegressionCase();
