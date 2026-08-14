import { describe, expect, it } from "vitest";
import { SUPPLY_LEGAL_CLOSURE_SCRIPT } from "../src/interfaces/lb7/SupplyLegalClosureScript";
import { SUPPLY_FINALIZATION_SCRIPT } from "../src/interfaces/lb7/SupplyFinalizationScript";

describe("LB-7 supply legal/economic closure", () => {
  it("is integrated after document mapping", () => {
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("SUPPLY_LEGAL_CLOSURE_SCRIPT");
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("5.1 Cierre jurídico-económico previo al mapeo");
  });

  it("blocks mapping until budget, VE and price-only motivation are closed", () => {
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("closureReady");
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("validateSupplyDocumentMapping");
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("Mapeo bloqueado");
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("supplyPriceOnlyMotivationValidated");
  });

  it("calculates VE from maximum budget plus planned upward modification, not consumption projection", () => {
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("supplyMaximumApprovedBudgetExVat");
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("supplyNeedsModificationMaximumIncreaseExVat");
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("supplyEstimatedValueExVat");
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("artículo 101.2.c LCSP");
  });
});
