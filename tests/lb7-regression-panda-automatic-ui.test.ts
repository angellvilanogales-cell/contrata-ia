import { describe, expect, it } from "vitest";
import { SUPPLY_REGRESSION_PANDA_002_GUARD_SCRIPT } from "../src/interfaces/lb7/SupplyRegressionPanda002GuardScript";
import { ADAPTIVE_FLOW_UI } from "../src/interfaces/lb7/AdaptiveFlowUi";

describe("Paso 11.7.3 - interfaz de regresión Panda", () => {
  it("expone la protección solo después de validar 11.7.2", () => {
    expect(() => new Function(SUPPLY_REGRESSION_PANDA_002_GUARD_SCRIPT)).not.toThrow();
    expect(SUPPLY_REGRESSION_PANDA_002_GUARD_SCRIPT).toContain("supplyRegressionPanda002ExtractionValidated!==true");
    expect(SUPPLY_REGRESSION_PANDA_002_GUARD_SCRIPT).toContain("11.7.3 Regresión automática Panda vs. golden");
    expect(SUPPLY_REGRESSION_PANDA_002_GUARD_SCRIPT).toContain("Registrar regresión automática 11.7.3");
  });

  it("no convierte Panda en golden case y avanza a REG-SUPPLY-003", () => {
    expect(SUPPLY_REGRESSION_PANDA_002_GUARD_SCRIPT).toContain("no como golden case");
    expect(SUPPLY_REGRESSION_PANDA_002_GUARD_SCRIPT).toContain('supplyRegressionNextRecommendedCase="REG-SUPPLY-003"');
    expect(SUPPLY_REGRESSION_PANDA_002_GUARD_SCRIPT).toContain("AUTOMATIC_REGRESSION_ACTIVE");
  });

  it("está integrado en /adaptive", () => {
    expect(ADAPTIVE_FLOW_UI).toContain("Paso 11.7.3 regresión automática Panda");
    expect(ADAPTIVE_FLOW_UI).toContain("supplyRegressionPanda002GuardCard");
  });
});
