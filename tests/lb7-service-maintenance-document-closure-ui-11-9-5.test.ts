import { describe, expect, it } from "vitest";
import { SERVICE_REGRESSION_MAINTENANCE_007_DOCUMENT_CLOSURE_SCRIPT } from "../src/interfaces/lb7/ServiceRegressionMaintenance007DocumentClosureScript";
import { SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_GUARD_SCRIPT } from "../src/interfaces/lb7/ServiceRegressionMaintenance007EconomicsGuardScript";

describe("Paso 11.9.5 - interfaz de cierre documental mantenimiento", () => {
  it("compila y conserva la clasificación documental", () => {
    expect(() => new Function(SERVICE_REGRESSION_MAINTENANCE_007_DOCUMENT_CLOSURE_SCRIPT)).not.toThrow();
    expect(SERVICE_REGRESSION_MAINTENANCE_007_DOCUMENT_CLOSURE_SCRIPT).toContain("11.9.5 Cierre documental");
    expect(SERVICE_REGRESSION_MAINTENANCE_007_DOCUMENT_CLOSURE_SCRIPT).toContain("CONFIRMED_SOURCE_DECLARATION");
    expect(SERVICE_REGRESSION_MAINTENANCE_007_DOCUMENT_CLOSURE_SCRIPT).toContain("PENDING_SOURCE_EVIDENCE");
    expect(SERVICE_REGRESSION_MAINTENANCE_007_DOCUMENT_CLOSURE_SCRIPT).toContain("BLOCKED_SOURCE_CONFLICT");
    expect(SERVICE_REGRESSION_MAINTENANCE_007_DOCUMENT_CLOSURE_SCRIPT).toContain("PRESERVE_SOURCE_DECLARATIONS_DO_NOT_AUTOCORRECT");
  });

  it("queda encadenado detrás de 11.9.4 y finaliza sin promover pendientes", () => {
    expect(() => new Function(SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_GUARD_SCRIPT)).not.toThrow();
    expect(SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_GUARD_SCRIPT).toContain("11.9.5 Cierre documental");
    expect(SERVICE_REGRESSION_MAINTENANCE_007_DOCUMENT_CLOSURE_SCRIPT).toContain("serviceRegressionMaintenance007EconomicsGuardRegistered");
    expect(SERVICE_REGRESSION_MAINTENANCE_007_DOCUMENT_CLOSURE_SCRIPT).toContain("PENDING_NEW_PRIMARY_EVIDENCE");
    expect(SERVICE_REGRESSION_MAINTENANCE_007_DOCUMENT_CLOSURE_SCRIPT).toContain("Los campos pendientes y la contradicción de lotes permanecen abiertos");
  });
});
