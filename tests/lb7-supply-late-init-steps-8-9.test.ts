import { describe, expect, it } from "vitest";
import { ADAPTIVE_FLOW_UI } from "../src/interfaces/lb7/AdaptiveFlowUi";
import { SUPPLY_FINALIZATION_SCRIPT } from "../src/interfaces/lb7/SupplyFinalizationScript";

describe("Pasos 8 y 9: montaje tardío seguro", () => {
  it("mantiene los pasos 8 y 9 fuera del script estable 4-7", () => {
    expect(SUPPLY_FINALIZATION_SCRIPT).not.toContain("8. Cierre de campos pendientes del Anexo I");
    expect(SUPPLY_FINALIZATION_SCRIPT).not.toContain("9. Primer borrador editable del Anexo I");
  });

  it("reintenta el montaje tras la restauración tardía del estado", () => {
    expect(ADAPTIVE_FLOW_UI).toContain('kind:"late-init-retry"');
    expect(ADAPTIVE_FLOW_UI).toContain("setTimeout(retryLateSteps,100)");
    expect(ADAPTIVE_FLOW_UI).toContain("setTimeout(retryLateSteps,500)");
    expect(ADAPTIVE_FLOW_UI).toContain("setTimeout(retryLateSteps,1500)");
    expect(ADAPTIVE_FLOW_UI).toContain("setTimeout(retryLateSteps,3000)");
  });
});
