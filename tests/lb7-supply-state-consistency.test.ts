import { describe, expect, it } from "vitest";
import { SUPPLY_STATE_CONSISTENCY_SCRIPT } from "../src/interfaces/lb7/SupplyStateConsistencyScript";
import { SUPPLY_FINALIZATION_SCRIPT } from "../src/interfaces/lb7/SupplyFinalizationScript";

describe("LB-7 supply legal state consistency", () => {
  it("synchronizes a validated estimated value across stale views", () => {
    expect(SUPPLY_STATE_CONSISTENCY_SCRIPT).toContain("Valor estimado validado");
    expect(SUPPLY_STATE_CONSISTENCY_SCRIPT).toContain("Valor estimado contractual validado");
    expect(SUPPLY_STATE_CONSISTENCY_SCRIPT).toContain("supplyEstimatedValueValidated");
  });

  it("does not allow price-only to remain legally closed with a planned modification", () => {
    expect(SUPPLY_STATE_CONSISTENCY_SCRIPT).toContain('a.supplyAwardCriteriaMode==="PRICE_ONLY"');
    expect(SUPPLY_STATE_CONSISTENCY_SCRIPT).toContain("supplyNeedsModificationForeseen===true");
    expect(SUPPLY_STATE_CONSISTENCY_SCRIPT).toContain("artículo 145.3.f LCSP");
    expect(SUPPLY_STATE_CONSISTENCY_SCRIPT).toContain("disposición adicional 33.ª");
    expect(SUPPLY_STATE_CONSISTENCY_SCRIPT).toContain("supplyDocumentGenerationBlockedByAwardCriteria=true");
    expect(SUPPLY_STATE_CONSISTENCY_SCRIPT).toContain("supplyDocumentMappingValidated=false");
  });

  it("does not invent the alternative criterion or delivery-time improvement", () => {
    expect(SUPPLY_STATE_CONSISTENCY_SCRIPT).toContain("No se inventará un criterio alternativo");
    expect(SUPPLY_STATE_CONSISTENCY_SCRIPT).toContain("Criterio objetivo adicional");
    expect(SUPPLY_STATE_CONSISTENCY_SCRIPT).not.toContain("DELIVERY_TIME_IMPROVEMENT");
    expect(SUPPLY_STATE_CONSISTENCY_SCRIPT).not.toContain('value="85"');
  });

  it("requires formula-based user definition before revalidation", () => {
    expect(SUPPLY_STATE_CONSISTENCY_SCRIPT).toContain("supplyAwardCriteriaStructureValidated=true");
    expect(SUPPLY_STATE_CONSISTENCY_SCRIPT).toContain("Los pesos deben ser positivos y sumar 100 puntos");
    expect(SUPPLY_STATE_CONSISTENCY_SCRIPT).toContain("formulaDescription");
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("SUPPLY_STATE_CONSISTENCY_SCRIPT");
  });
});
