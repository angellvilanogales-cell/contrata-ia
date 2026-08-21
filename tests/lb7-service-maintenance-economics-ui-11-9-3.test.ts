import { describe, expect, it } from "vitest";
import { SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_SCRIPT } from "../src/interfaces/lb7/ServiceRegressionMaintenance007EconomicsScript";

describe("Paso 11.9.3 - interfaz de evidencia económica mantenimiento", () => {
  it("compila el script completo y preserva el alcance económico declarado", () => {
    expect(() => new Function(SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_SCRIPT)).not.toThrow();
    expect(SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_SCRIPT).toContain("11.9.3 Evidencia económica");
    expect(SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_SCRIPT).toContain("182.399,14");
    expect(SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_SCRIPT).toContain("20 %");
    expect(SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_SCRIPT).toContain("24 meses");
    expect(SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_SCRIPT).toContain("1439030000 G/32L/21200/41 01");
  });

  it("mantiene visibles los redondeos y los campos jurídicos abiertos", () => {
    expect(SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_SCRIPT).toContain("Lotes 2 y 4: +0,01 €");
    expect(SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_SCRIPT).toContain("diferencia: ");
    expect(SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_SCRIPT).toContain("criterios de adjudicación, ponderaciones y fórmulas");
    expect(SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_SCRIPT).toContain("regla definitiva sobre máximo de lotes ofertables por licitador");
    expect(SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_SCRIPT).toContain("serviceRegressionNextRecommendedStep=\"11.9.4\"");
  });
});
