import { describe, expect, it } from "vitest";
import { ADAPTIVE_FLOW_UI } from "../src/interfaces/lb7/AdaptiveFlowUi";
import { SUPPLY_FINALIZATION_SCRIPT } from "../src/interfaces/lb7/SupplyFinalizationScript";
import { SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT } from "../src/interfaces/lb7/SupplyOfficialTemplatePendingFieldsScript";

describe("aislamiento runtime del paso 8 de suministros", () => {
  it("mantiene los pasos 4-7 en el script estable y el paso 8 fuera de esa composición", () => {
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("6. Selección y verificación del modelo oficial DPCAF / PCAP");
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("7. Parametrización del Anexo I del DPCAF / PCAP oficial");
    expect(SUPPLY_FINALIZATION_SCRIPT).not.toContain("8. Cierre de campos pendientes del Anexo I");
  });

  it("compila el paso 8 de forma independiente", () => {
    expect(() => new Function(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT)).not.toThrow();
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("8. Cierre de campos pendientes del Anexo I");
  });

  it("carga el paso 8 después del recurso estable y lo encapsula ante errores runtime", () => {
    const stablePosition = ADAPTIVE_FLOW_UI.indexOf('src="/supply-finalization.js"');
    const step8Position = ADAPTIVE_FLOW_UI.indexOf("8. Cierre de campos pendientes del Anexo I");
    expect(stablePosition).toBeGreaterThanOrEqual(0);
    expect(step8Position).toBeGreaterThan(stablePosition);
    expect(ADAPTIVE_FLOW_UI).toContain('document.addEventListener("DOMContentLoaded"');
    expect(ADAPTIVE_FLOW_UI).toContain('console.error("Contrata-IA Paso 8 aislado:"');
  });
});
