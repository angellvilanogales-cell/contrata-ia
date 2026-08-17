import { describe, expect, it } from "vitest";
import { SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT } from "../src/interfaces/lb7/SupplyOfficialTemplatePendingFieldsScript";
import { SUPPLY_FINALIZATION_SCRIPT } from "../src/interfaces/lb7/SupplyFinalizationScript";

describe("LB7 supply Annex I pending fields", () => {
  it("keeps PBL, DA33 maximum budget and estimated value as separate magnitudes", () => {
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("Regla de consistencia económica");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("supplyMaximumApprovedBudgetExVat");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("supplyCurrentTenderBudgetExVat");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("supplyEstimatedValueExVat");
  });

  it("requires explicit decisions for annualities, abnormal-low parameters, tie-break and penalties", () => {
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("supplyCurrentBudgetAnnualities");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("supplyAbnormallyLowParametersText");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("LEGAL_ART_147_2");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("supplySpecificPenaltiesMode");
  });

  it("is integrated after structural parameterization", () => {
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).not.toContain("MutationObserver");
  });
});
