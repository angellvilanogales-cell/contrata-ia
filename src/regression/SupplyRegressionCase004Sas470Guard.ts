import { SUPPLY_REGRESSION_CASE_004_SAS_470 } from "./SupplyRegressionCase004Sas470";

export const SAS470_REGRESSION_VERSION = "REG-SUPPLY-004-SAS470-GUARD-11.7.7-v1";

function check(id: string, ok: boolean, purpose: string) {
  return { id, ok, purpose } as const;
}

export function evaluateSas470Regression(caseData = SUPPLY_REGRESSION_CASE_004_SAS_470) {
  const f = caseData.facts;
  const checks = [
    check("SAS470-FRAMEWORK", f.procurementInstrument === "ACUERDO_MARCO", "Impedir convertir el acuerdo marco en un contrato ordinario de suministro."),
    check("SAS470-OPEN-PROCEDURE", f.procedure === "ABIERTO", "Conservar el procedimiento abierto y evitar heredar el simplificado abreviado del golden."),
    check("SAS470-MULTI-LOT", f.lots === true, "Impedir reducir el expediente a lote único."),
    check("SAS470-SUCCESSIVE-SUPPLY", f.successiveSupply === true, "Mantener el carácter de suministro de tracto sucesivo dentro del acuerdo marco."),
    check("SAS470-UNIT-PRICES", f.economicMode === "PRECIOS_UNITARIOS", "Conservar la modalidad económica de precios unitarios."),
    check("SAS470-MULTIPLE-CRITERIA", f.awardMode === "CRITERIOS_MULTIPLES", "Impedir sustituir la pluralidad de criterios por precio único 100 puntos."),
    check("SAS470-JUDGMENT-VALUE", f.judgmentValueCriteria === true, "Conservar la existencia de criterios sometidos a juicio de valor."),
    check("SAS470-AUTOMATIC-CRITERIA", f.automaticCriteria === true, "Conservar la coexistencia de criterios automáticos con el juicio de valor."),
    check("SAS470-MODIFICATION-EXISTS", f.plannedModification === true, "Conservar únicamente la existencia de modificación prevista, sin inferir todavía causa o porcentaje."),
  ] as const;
  const blockers = checks.filter((c) => !c.ok).map((c) => c.id);
  return {
    version: SAS470_REGRESSION_VERSION,
    caseId: caseData.id,
    passed: blockers.length === 0,
    blockers,
    checks,
    protectedScope: caseData.extractionScope.verifiedForStep1176,
    deliberatelyNotFrozenYet: caseData.extractionScope.deliberatelyNotFrozenYet,
  } as const;
}

export const SAS470_REGRESSION_BASELINE = evaluateSas470Regression();
