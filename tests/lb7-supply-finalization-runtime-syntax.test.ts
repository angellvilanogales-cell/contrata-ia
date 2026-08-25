import { describe, expect, it } from "vitest";
import { SUPPLY_FINALIZATION_SCRIPT } from "../src/interfaces/lb7/SupplyFinalizationScript";

describe("LB7 supply finalization runtime script", () => {
  it("parses the currently deployed steps as JavaScript", () => {
    expect(() => new Function(SUPPLY_FINALIZATION_SCRIPT)).not.toThrow();
  });

  it("keeps steps 4 through 7 in the stable composed script while step 8 remains isolated", () => {
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("4. Comprobaciones finales y preparación documental");
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("5. Mapeo documental del suministro");
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("6. Selección y verificación del modelo oficial DPCAF / PCAP");
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("7. Parametrización del Anexo I del DPCAF / PCAP oficial");
    expect(SUPPLY_FINALIZATION_SCRIPT).not.toContain("8. Cierre de campos pendientes del Anexo I");
  });
});
