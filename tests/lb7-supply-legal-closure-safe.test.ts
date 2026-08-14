import { describe, expect, it } from "vitest";
import { SUPPLY_LEGAL_CLOSURE_SCRIPT } from "../src/interfaces/lb7/SupplyLegalClosureScript";
import { SUPPLY_FINALIZATION_SCRIPT } from "../src/interfaces/lb7/SupplyFinalizationScript";

describe("LB-7 safe supply legal closure", () => {
  it("exposes legal closure controls before mapping validation", () => {
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("SUPPLY_LEGAL_CLOSURE_SCRIPT");
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("Cierre jurídico-económico previo a la validación del mapeo");
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("validateSupplyEstimatedValue");
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("validateSupplyPriceOnlyMotivation");
  });

  it("does not install a MutationObserver that can self-trigger render loops", () => {
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).not.toContain("new MutationObserver");
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("document.addEventListener('contrata-ia:adaptive-saved'");
  });

  it("blocks mapping until legal-economic closure is complete", () => {
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("closureReady");
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("validateSupplyDocumentMapping");
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("Mapeo todavía bloqueado");
  });
});
