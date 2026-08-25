import { describe, expect, it } from "vitest";
import { SUPPLY_FINALIZATION_SCRIPT } from "../src/interfaces/lb7/SupplyFinalizationScript";
import { ADAPTIVE_FLOW_UI } from "../src/interfaces/lb7/AdaptiveFlowUi";

describe("LB-7 supply finalization block", () => {
  it("checks readiness without re-asking legal decisions", () => {
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("4. Comprobaciones finales y preparación documental");
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("No se volverán a preguntar decisiones ya deducidas o validadas");
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("Solvencia, garantías y condición especial");
  });

  it("requires catalogue, budget, criteria and validated legal draft", () => {
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("supplyPcapLegalDraft");
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("supplyAwardCriteriaMode");
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("contrataIaSupplyCatalogue");
  });

  it("prepares but does not falsely claim final legal approval", () => {
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("READY_FOR_TEMPLATE_MAPPING");
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("no sustituye la revisión jurídica");
    expect(ADAPTIVE_FLOW_UI).toContain('/supply-finalization.js');
  });
});
