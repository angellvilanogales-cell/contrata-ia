import { describe, expect, it } from "vitest";
import { REGRESSION_COVERAGE_MATRIX, REGRESSION_COVERAGE_DIMENSIONS } from "../src/regression/RegressionCoverageMatrix";
import { SUPPLY_GOLDEN_CASE_001 } from "../src/regression/SupplyGoldenCase001";
import { SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT } from "../src/interfaces/lb7/SupplyGoldenCaseRegistryScript";

describe("Paso 11.7 - matriz multicaso de regresión", () => {
  it("mantiene el golden case como único escenario validado inicial", () => {
    expect(REGRESSION_COVERAGE_MATRIX).toHaveLength(8);
    const validated = REGRESSION_COVERAGE_MATRIX.filter((c) => c.status === "VALIDATED_GOLDEN");
    expect(validated).toHaveLength(1);
    expect(validated[0].id).toBe(SUPPLY_GOLDEN_CASE_001.id);
  });

  it("no presenta los escenarios planificados como doctrina validada", () => {
    const pending = REGRESSION_COVERAGE_MATRIX.filter((c) => c.status !== "VALIDATED_GOLDEN");
    expect(pending).toHaveLength(7);
    expect(pending.every((c) => c.sourceBasis === "PENDING_REAL_CASE")).toBe(true);
  });

  it("cubre en planificación los principales ejes funcionales", () => {
    expect(new Set(REGRESSION_COVERAGE_MATRIX.map((c) => c.contractType))).toEqual(new Set(REGRESSION_COVERAGE_DIMENSIONS.contractTypes));
    expect(new Set(REGRESSION_COVERAGE_MATRIX.map((c) => c.procedure))).toEqual(new Set(REGRESSION_COVERAGE_DIMENSIONS.procedures));
    expect(new Set(REGRESSION_COVERAGE_MATRIX.map((c) => c.needsBased))).toEqual(new Set(REGRESSION_COVERAGE_DIMENSIONS.needsBased));
    expect(new Set(REGRESSION_COVERAGE_MATRIX.map((c) => c.lots))).toEqual(new Set(REGRESSION_COVERAGE_DIMENSIONS.lots));
    expect(new Set(REGRESSION_COVERAGE_MATRIX.map((c) => c.extensions))).toEqual(new Set(REGRESSION_COVERAGE_DIMENSIONS.extensions));
    expect(new Set(REGRESSION_COVERAGE_MATRIX.map((c) => c.plannedModification))).toEqual(new Set(REGRESSION_COVERAGE_DIMENSIONS.plannedModification));
    expect(new Set(REGRESSION_COVERAGE_MATRIX.map((c) => c.awardMode))).toEqual(new Set(REGRESSION_COVERAGE_DIMENSIONS.awardModes));
    expect(new Set(REGRESSION_COVERAGE_MATRIX.map((c) => c.economicMode))).toEqual(new Set(REGRESSION_COVERAGE_DIMENSIONS.economicModes));
  });

  it("prioriza como siguiente contraste un suministro sin DA 33", () => {
    const next = REGRESSION_COVERAGE_MATRIX.find((c) => c.id === "REG-SUPPLY-002");
    expect(next).toBeDefined();
    expect(next?.needsBased).toBe(false);
    expect(next?.plannedModification).toBe(false);
    expect(SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT).toContain("supplyRegressionNextRecommendedCase");
    expect(SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT).toContain("REG-SUPPLY-002");
  });

  it("expone 11.7 en la interfaz solo tras registrar el golden case", () => {
    expect(() => new Function(SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT)).not.toThrow();
    expect(SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT).toContain("11.7 Matriz de regresión multicaso y cobertura funcional");
    expect(SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT).toContain("supplyGoldenCaseRegistered===true");
    expect(SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT).toContain("Registrar matriz de cobertura 11.7");
    expect(SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT).toContain("No son reglas jurídicas validadas");
  });
});
