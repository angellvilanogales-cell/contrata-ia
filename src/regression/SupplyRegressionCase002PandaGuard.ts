import { SUPPLY_GOLDEN_CASE_001 } from "./SupplyGoldenCase001";
import { SUPPLY_REGRESSION_CASE_002_PANDA } from "./SupplyRegressionCase002Panda";

export const PANDA_REGRESSION_VERSION = "REG-SUPPLY-002-PANDA-GUARD-11.7.3-v1" as const;

export type PandaRegressionCheck = {
  id: string;
  ok: boolean;
  expected: string;
  actual: string;
  purpose: string;
};

export type PandaRegressionResult = {
  version: typeof PANDA_REGRESSION_VERSION;
  caseId: typeof SUPPLY_REGRESSION_CASE_002_PANDA.id;
  goldenCaseId: typeof SUPPLY_GOLDEN_CASE_001.id;
  passed: boolean;
  blockers: PandaRegressionCheck[];
  checks: PandaRegressionCheck[];
};

type PandaFacts = typeof SUPPLY_REGRESSION_CASE_002_PANDA.facts;

function check(id: string, ok: boolean, expected: string, actual: unknown, purpose: string): PandaRegressionCheck {
  return { id, ok, expected, actual: String(actual), purpose };
}

export function runPandaRegressionGuard(facts: PandaFacts = SUPPLY_REGRESSION_CASE_002_PANDA.facts): PandaRegressionResult {
  const checks: PandaRegressionCheck[] = [
    check("PANDA-DA33-OFF", facts.needsBasedDA33 === false, "false", facts.needsBasedDA33, "Impedir que Panda herede la lógica de contrato por necesidades del golden case."),
    check("PANDA-PROCEDURE", facts.procedure === "ABIERTO_SIMPLIFICADO", "ABIERTO_SIMPLIFICADO", facts.procedure, "Mantener el procedimiento simplificado ordinario y no el abreviado del golden."),
    check("PANDA-ONE-LOT", facts.lots === false, "false", facts.lots, "Mantener lote único."),
    check("PANDA-NO-EXTENSIONS", facts.extensions === false, "false", facts.extensions, "Impedir la herencia de las prórrogas 12+12 del golden case."),
    check("PANDA-DURATION-36", facts.initialDurationMonths === 36, "36", facts.initialDurationMonths, "Conservar la duración documental propia de Panda."),
    check("PANDA-UNIT-PRICES", facts.economicMode === "PRECIOS_UNITARIOS", "PRECIOS_UNITARIOS", facts.economicMode, "Conservar la modalidad económica real sin activar presupuesto máximo DA 33.ª."),
    check("PANDA-VE-EQUALS-PBL", facts.estimatedValueExVat === facts.pblExVat, String(facts.pblExVat), facts.estimatedValueExVat, "Evitar sumar automáticamente un 20 % reductor al valor estimado."),
    check("PANDA-PRICE-ONLY", facts.awardMode === "PRECIO_UNICO" && facts.awardPoints === 100, "PRECIO_UNICO / 100", `${facts.awardMode} / ${facts.awardPoints}`, "Conservar el criterio económico único validado en la extracción."),
    check("PANDA-MODIFICATION-20", facts.plannedModification === true && facts.plannedModificationPercent === 20, "true / 20", `${facts.plannedModification} / ${facts.plannedModificationPercent}`, "Conservar la modificación prevista propia del expediente."),
    check("PANDA-MODIFICATION-NOT-DA33", facts.plannedModificationIsDA33NeedsIncrease === false, "false", facts.plannedModificationIsDA33NeedsIncrease, "Impedir que el 20 % se recodifique como mayores necesidades DA 33.ª."),
    check("PANDA-MODIFICATION-REASON", facts.plannedModificationReason === "REDUCCION_FINANCIACION_MEDIDAS_ESTABILIDAD_PRESUPUESTARIA", "REDUCCION_FINANCIACION_MEDIDAS_ESTABILIDAD_PRESUPUESTARIA", facts.plannedModificationReason, "Mantener separada la causa jurídica/económica de la modificación."),
    check("PANDA-GUARANTEE", facts.guaranteeDefinitive === true && facts.guaranteeDefinitivePercentOnPbl === 5, "true / 5", `${facts.guaranteeDefinitive} / ${facts.guaranteeDefinitivePercentOnPbl}`, "Conservar la garantía definitiva propia del caso."),
    check("PANDA-SPECIAL-CONDITION", facts.specialExecutionCondition === "TRANSPARENCIA_FISCAL", "TRANSPARENCIA_FISCAL", facts.specialExecutionCondition, "Impedir heredar la condición especial de embalajes y residuos del golden."),
  ];

  const blockers = checks.filter((item) => !item.ok);
  return {
    version: PANDA_REGRESSION_VERSION,
    caseId: SUPPLY_REGRESSION_CASE_002_PANDA.id,
    goldenCaseId: SUPPLY_GOLDEN_CASE_001.id,
    passed: blockers.length === 0,
    blockers,
    checks,
  };
}

export const PANDA_REGRESSION_BASELINE = runPandaRegressionGuard();
