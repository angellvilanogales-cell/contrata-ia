import { describe, expect, it } from "vitest";
import { SUPPLY_REGRESSION_CASE_002_PANDA } from "../src/regression/SupplyRegressionCase002Panda";
import { PANDA_REGRESSION_BASELINE, PANDA_REGRESSION_VERSION, runPandaRegressionGuard } from "../src/regression/SupplyRegressionCase002PandaGuard";

describe("Paso 11.7.3 - regresión automática Panda vs golden", () => {
  it("pasa con la extracción 11.7.2 validada", () => {
    expect(PANDA_REGRESSION_BASELINE.version).toBe(PANDA_REGRESSION_VERSION);
    expect(PANDA_REGRESSION_BASELINE.passed).toBe(true);
    expect(PANDA_REGRESSION_BASELINE.blockers).toHaveLength(0);
    expect(PANDA_REGRESSION_BASELINE.checks.length).toBeGreaterThanOrEqual(10);
  });

  it("falla si reaparece DA 33.ª", () => {
    const facts = { ...SUPPLY_REGRESSION_CASE_002_PANDA.facts, needsBasedDA33: true } as typeof SUPPLY_REGRESSION_CASE_002_PANDA.facts;
    const result = runPandaRegressionGuard(facts);
    expect(result.passed).toBe(false);
    expect(result.blockers.map((b) => b.id)).toContain("PANDA-DA33-OFF");
  });

  it("falla si se heredan prórrogas del golden", () => {
    const facts = { ...SUPPLY_REGRESSION_CASE_002_PANDA.facts, extensions: true } as typeof SUPPLY_REGRESSION_CASE_002_PANDA.facts;
    const result = runPandaRegressionGuard(facts);
    expect(result.passed).toBe(false);
    expect(result.blockers.map((b) => b.id)).toContain("PANDA-NO-EXTENSIONS");
  });

  it("falla si la modificación se transforma en mayores necesidades DA 33.ª", () => {
    const facts = {
      ...SUPPLY_REGRESSION_CASE_002_PANDA.facts,
      plannedModificationIsDA33NeedsIncrease: true,
      plannedModificationReason: "MAYORES_NECESIDADES_REALES",
    } as unknown as typeof SUPPLY_REGRESSION_CASE_002_PANDA.facts;
    const result = runPandaRegressionGuard(facts);
    expect(result.passed).toBe(false);
    expect(result.blockers.map((b) => b.id)).toContain("PANDA-MODIFICATION-NOT-DA33");
    expect(result.blockers.map((b) => b.id)).toContain("PANDA-MODIFICATION-REASON");
  });

  it("falla si el 20 % reductor se suma indebidamente al VE", () => {
    const facts = { ...SUPPLY_REGRESSION_CASE_002_PANDA.facts, estimatedValueExVat: 73430.7 } as typeof SUPPLY_REGRESSION_CASE_002_PANDA.facts;
    const result = runPandaRegressionGuard(facts);
    expect(result.passed).toBe(false);
    expect(result.blockers.map((b) => b.id)).toContain("PANDA-VE-EQUALS-PBL");
  });

  it("falla si se sustituye transparencia fiscal por la condición del golden", () => {
    const facts = { ...SUPPLY_REGRESSION_CASE_002_PANDA.facts, specialExecutionCondition: "GESTION_EMBALAJES_RESIDUOS" } as unknown as typeof SUPPLY_REGRESSION_CASE_002_PANDA.facts;
    const result = runPandaRegressionGuard(facts);
    expect(result.passed).toBe(false);
    expect(result.blockers.map((b) => b.id)).toContain("PANDA-SPECIAL-CONDITION");
  });
});
