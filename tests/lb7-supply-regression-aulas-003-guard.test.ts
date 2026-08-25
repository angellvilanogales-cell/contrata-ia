import { describe, expect, it } from "vitest";
import { SUPPLY_REGRESSION_CASE_003_AULAS_DIGITALES } from "../src/regression/SupplyRegressionCase003AulasDigitales";
import { AULAS_REGRESSION_BASELINE, evaluateAulasRegressionCase } from "../src/regression/SupplyRegressionCase003AulasGuard";
import { SUPPLY_REGRESSION_AULAS_003_GUARD_SCRIPT } from "../src/interfaces/lb7/SupplyRegressionAulas003GuardScript";

describe("Paso 11.7.5 - regresión automática Aulas digitales", () => {
  it("mantiene la línea base validada sin bloqueantes", () => {
    expect(AULAS_REGRESSION_BASELINE.passed).toBe(true);
    expect(AULAS_REGRESSION_BASELINE.blockers).toHaveLength(0);
    expect(AULAS_REGRESSION_BASELINE.checks).toHaveLength(10);
  });

  it("detecta la pérdida de los nueve lotes", () => {
    const candidate = { ...SUPPLY_REGRESSION_CASE_003_AULAS_DIGITALES, facts: { ...SUPPLY_REGRESSION_CASE_003_AULAS_DIGITALES.facts, lots: false, lotCount: 1 } } as typeof SUPPLY_REGRESSION_CASE_003_AULAS_DIGITALES;
    const result = evaluateAulasRegressionCase(candidate);
    expect(result.passed).toBe(false);
    expect(result.blockers.some((b) => b.id === "AULAS-NINE-LOTS")).toBe(true);
  });

  it("detecta la pérdida de SARA", () => {
    const candidate = { ...SUPPLY_REGRESSION_CASE_003_AULAS_DIGITALES, facts: { ...SUPPLY_REGRESSION_CASE_003_AULAS_DIGITALES.facts, sara: false } } as typeof SUPPLY_REGRESSION_CASE_003_AULAS_DIGITALES;
    const result = evaluateAulasRegressionCase(candidate);
    expect(result.passed).toBe(false);
    expect(result.blockers.some((b) => b.id === "AULAS-SARA")).toBe(true);
  });

  it("detecta la pérdida de DA33 y fondos europeos", () => {
    const candidate = { ...SUPPLY_REGRESSION_CASE_003_AULAS_DIGITALES, facts: { ...SUPPLY_REGRESSION_CASE_003_AULAS_DIGITALES.facts, needsBasedDA33: false, europeanFunds: false } } as typeof SUPPLY_REGRESSION_CASE_003_AULAS_DIGITALES;
    const result = evaluateAulasRegressionCase(candidate);
    expect(result.passed).toBe(false);
    expect(result.blockers.some((b) => b.id === "AULAS-DA33-ON")).toBe(true);
    expect(result.blockers.some((b) => b.id === "AULAS-EU-FUNDS")).toBe(true);
  });

  it("mantiene fuera de alcance los campos no congelados en 11.7.4", () => {
    expect(AULAS_REGRESSION_BASELINE.deliberatelyNotFrozenYet).toContain("importes económicos detallados");
    expect(AULAS_REGRESSION_BASELINE.deliberatelyNotFrozenYet).toContain("CPV por lote");
  });

  it("expone la puerta 11.7.5 después de la validación 11.7.4", () => {
    expect(() => new Function(SUPPLY_REGRESSION_AULAS_003_GUARD_SCRIPT)).not.toThrow();
    expect(SUPPLY_REGRESSION_AULAS_003_GUARD_SCRIPT).toContain("supplyRegressionAulas003ExtractionValidated");
    expect(SUPPLY_REGRESSION_AULAS_003_GUARD_SCRIPT).toContain("Registrar regresión automática 11.7.5");
  });
});
