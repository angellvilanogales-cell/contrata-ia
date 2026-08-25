import { describe, expect, it } from "vitest";
import { evaluateSas470Regression, SAS470_REGRESSION_BASELINE } from "../src/regression/SupplyRegressionCase004Sas470Guard";
import { SUPPLY_REGRESSION_CASE_004_SAS_470 } from "../src/regression/SupplyRegressionCase004Sas470";
import { SUPPLY_REGRESSION_SAS_004_GUARD_SCRIPT } from "../src/interfaces/lb7/SupplyRegressionSas004GuardScript";

describe("Paso 11.7.7 - regresión automática SAS 470/2025", () => {
  it("supera la línea base validada sin bloqueantes", () => {
    expect(SAS470_REGRESSION_BASELINE.passed).toBe(true);
    expect(SAS470_REGRESSION_BASELINE.blockers).toEqual([]);
    expect(SAS470_REGRESSION_BASELINE.checks).toHaveLength(9);
  });

  it("falla si el acuerdo marco se degrada a contrato ordinario", () => {
    const bad = { ...SUPPLY_REGRESSION_CASE_004_SAS_470, facts: { ...SUPPLY_REGRESSION_CASE_004_SAS_470.facts, procurementInstrument: "CONTRATO_ORDINARIO" as any } };
    expect(evaluateSas470Regression(bad as any).blockers).toContain("SAS470-FRAMEWORK");
  });

  it("falla si se elimina la pluralidad de lotes", () => {
    const bad = { ...SUPPLY_REGRESSION_CASE_004_SAS_470, facts: { ...SUPPLY_REGRESSION_CASE_004_SAS_470.facts, lots: false } };
    expect(evaluateSas470Regression(bad as any).blockers).toContain("SAS470-MULTI-LOT");
  });

  it("falla si desaparece el tracto sucesivo", () => {
    const bad = { ...SUPPLY_REGRESSION_CASE_004_SAS_470, facts: { ...SUPPLY_REGRESSION_CASE_004_SAS_470.facts, successiveSupply: false } };
    expect(evaluateSas470Regression(bad as any).blockers).toContain("SAS470-SUCCESSIVE-SUPPLY");
  });

  it("falla si se sustituye criterios múltiples por precio único", () => {
    const bad = { ...SUPPLY_REGRESSION_CASE_004_SAS_470, facts: { ...SUPPLY_REGRESSION_CASE_004_SAS_470.facts, awardMode: "PRECIO_UNICO" as any } };
    expect(evaluateSas470Regression(bad as any).blockers).toContain("SAS470-MULTIPLE-CRITERIA");
  });

  it("falla si desaparece el juicio de valor o los criterios automáticos", () => {
    const noJudgment = { ...SUPPLY_REGRESSION_CASE_004_SAS_470, facts: { ...SUPPLY_REGRESSION_CASE_004_SAS_470.facts, judgmentValueCriteria: false } };
    const noAuto = { ...SUPPLY_REGRESSION_CASE_004_SAS_470, facts: { ...SUPPLY_REGRESSION_CASE_004_SAS_470.facts, automaticCriteria: false } };
    expect(evaluateSas470Regression(noJudgment as any).blockers).toContain("SAS470-JUDGMENT-VALUE");
    expect(evaluateSas470Regression(noAuto as any).blockers).toContain("SAS470-AUTOMATIC-CRITERIA");
  });

  it("la UI exige validación 11.7.6 y no convierte el caso en golden", () => {
    expect(() => new Function(SUPPLY_REGRESSION_SAS_004_GUARD_SCRIPT)).not.toThrow();
    expect(SUPPLY_REGRESSION_SAS_004_GUARD_SCRIPT).toContain("supplyRegressionSas004ExtractionValidated");
    expect(SUPPLY_REGRESSION_SAS_004_GUARD_SCRIPT).toContain("Registrar regresión automática 11.7.7");
    expect(SUPPLY_REGRESSION_SAS_004_GUARD_SCRIPT).toContain("pero no como golden case");
  });
});
