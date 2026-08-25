import { describe, expect, it } from "vitest";
import { SUPPLY_FINALIZATION_SCRIPT } from "../src/interfaces/lb7/SupplyFinalizationScript";
import { SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT } from "../src/interfaces/lb7/SupplyOfficialTemplatePendingFieldsScript";

describe("LB7 supply step 8 pre-integration composition", () => {
  const composed = SUPPLY_FINALIZATION_SCRIPT + SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT;

  it("parses the full steps 4 through 8 composition without changing the deployed script", () => {
    expect(() => new Function(composed)).not.toThrow();
    expect(SUPPLY_FINALIZATION_SCRIPT).not.toContain("8. Cierre de campos pendientes del Anexo I");
  });

  it("contains every documentary step in the candidate composition", () => {
    expect(composed).toContain("4. Comprobaciones finales y preparación documental");
    expect(composed).toContain("5. Mapeo documental del suministro");
    expect(composed).toContain("6. Selección y verificación del modelo oficial DPCAF / PCAP");
    expect(composed).toContain("7. Parametrización del Anexo I del DPCAF / PCAP oficial");
    expect(composed).toContain("8. Cierre de campos pendientes del Anexo I");
  });

  it("keeps the step 8 safety constraints in the candidate composition", () => {
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).not.toContain("MutationObserver");
    expect(composed).toContain("Magnitudes económicas separadas");
    expect(composed).toContain("LEGAL_ART_147_2");
    expect(composed).toContain("supplySpecificPenaltiesMode");
  });
});
