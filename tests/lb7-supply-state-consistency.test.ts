import { describe, expect, it } from "vitest";
import { SUPPLY_STATE_CONSISTENCY_SCRIPT } from "../src/interfaces/lb7/SupplyStateConsistencyScript";
import { SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT } from "../src/interfaces/lb7/SupplyAwardCriteriaVisibilityHotfixScript";
import { SUPPLY_FINALIZATION_SCRIPT } from "../src/interfaces/lb7/SupplyFinalizationScript";

describe("LB-7 supply legal state consistency", () => {
  it("synchronizes a validated estimated value across stale views", () => {
    expect(SUPPLY_STATE_CONSISTENCY_SCRIPT).toContain("Valor estimado validado");
    expect(SUPPLY_STATE_CONSISTENCY_SCRIPT).toContain("Valor estimado contractual validado");
    expect(SUPPLY_STATE_CONSISTENCY_SCRIPT).toContain("supplyEstimatedValueValidated");
  });

  it("routes price-only plus planned modification through the specific 5.2 legal control", () => {
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain('a.supplyAwardCriteriaMode==="PRICE_ONLY"');
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("hasModification(a)");
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("artículo 145.3.f LCSP");
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("disposición adicional 33.ª");
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("supplyDocumentGenerationBlockedByAwardCriteria=true");
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("supplyDocumentMappingValidated=false");
  });

  it("does not invent an alternative criterion or automatic delivery-time improvement", () => {
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("No se impondrá automáticamente la pluralidad");
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("Revisar posible pluralidad de criterios");
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).not.toContain("DELIVERY_TIME_IMPROVEMENT");
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).not.toContain('value="85"');
  });

  it("requires an explicit human decision before document generation continues", () => {
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("Validar motivación específica y mantener solo precio");
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("Remitir criterios a revisión jurídica");
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("requiere validación humana expresa");
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("5.2 Control jurídico de los criterios de adjudicación");
  });
});
