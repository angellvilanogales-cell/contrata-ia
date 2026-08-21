import { describe, expect, it } from "vitest";
import { SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_GUARD_SCRIPT } from "../src/interfaces/lb7/ServiceRegressionMaintenance007EconomicsGuardScript";
import { SERVICE_REGRESSION_MAINTENANCE_007_GUARD_SCRIPT } from "../src/interfaces/lb7/ServiceRegressionMaintenance007GuardScript";

describe("Paso 11.9.4 - interfaz de guarda económica mantenimiento", () => {
  it("compila y expone las doce comprobaciones de protección", () => {
    expect(() => new Function(SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_GUARD_SCRIPT)).not.toThrow();
    expect(SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_GUARD_SCRIPT).toContain("11.9.4 Guarda económica automática");
    expect(SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_GUARD_SCRIPT).toContain("12 extremos");
    expect(SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_GUARD_SCRIPT).toContain("PRESERVE_SOURCE_DECLARATIONS_DO_NOT_AUTOCORRECT");
    expect(SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_GUARD_SCRIPT).toContain("NO_PROMOTION_WITHOUT_NEW_PRIMARY_EVIDENCE_AND_HUMAN_VALIDATION");
  });

  it("queda encadenada después de 11.9.2 y exige validación previa de 11.9.3", () => {
    expect(() => new Function(SERVICE_REGRESSION_MAINTENANCE_007_GUARD_SCRIPT)).not.toThrow();
    expect(SERVICE_REGRESSION_MAINTENANCE_007_GUARD_SCRIPT).toContain("11.9.3 Evidencia económica");
    expect(SERVICE_REGRESSION_MAINTENANCE_007_GUARD_SCRIPT).toContain("11.9.4 Guarda económica automática");
    expect(SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_GUARD_SCRIPT).toContain("serviceRegressionMaintenance007EconomicsValidated");
    expect(SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_GUARD_SCRIPT).toContain("no se han normalizado redondeos ni cerrado campos jurídicos sin fuente primaria");
  });
});
