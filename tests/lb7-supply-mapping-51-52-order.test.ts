import { describe, expect, it } from "vitest";
import { SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT } from "../src/interfaces/lb7/SupplyAwardCriteriaVisibilityHotfixScript";

describe("LB7 supply mapping order 5.1 / 5.2", () => {
  it("does not use a self-triggering MutationObserver", () => {
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).not.toContain("new MutationObserver");
  });

  it("reconstructs 5.1 when the economic closure is already validated", () => {
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("5.1 Cierre jurídico-económico");
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("ensureClosure");
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("supplyEstimatedValueValidated");
  });

  it("inserts 5.2 after 5.1 when the closure exists", () => {
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain('closure.insertAdjacentHTML("afterend",html)');
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("5.2 Control jurídico de los criterios de adjudicación");
  });

  it("does not present price-only as closed while the specific review is pending", () => {
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("Precio como criterio único pendiente de validación específica en el apartado 5.2");
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("Precio como criterio único: validación específica pendiente");
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("Resuelva el apartado 5.2 antes de generar documentación");
  });
});
