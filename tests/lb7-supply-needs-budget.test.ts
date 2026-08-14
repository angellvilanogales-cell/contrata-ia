import { describe, expect, it } from "vitest";
import { SUPPLY_ECONOMIC_PERIOD_SCRIPT } from "../src/interfaces/lb7/SupplyEconomicPeriodScript";
import { SUPPLY_FINALIZATION_SCRIPT } from "../src/interfaces/lb7/SupplyFinalizationScript";

describe("LB-7 needs-based supply economics", () => {
  it("keeps consumption projection separate from contractual budget", () => {
    expect(SUPPLY_ECONOMIC_PERIOD_SCRIPT).toContain("Proyección de consumo orientativa");
    expect(SUPPLY_ECONOMIC_PERIOD_SCRIPT).toContain("supplyCatalogueProjectedTotalConsumptionExVat");
    expect(SUPPLY_ECONOMIC_PERIOD_SCRIPT).toContain("supplyMaximumApprovedBudgetExVat");
    expect(SUPPLY_ECONOMIC_PERIOD_SCRIPT).toContain("No constituye por sí sola presupuesto máximo ni valor estimado");
    expect(SUPPLY_ECONOMIC_PERIOD_SCRIPT).not.toContain("a.initialBudgetExVat=Number(p.initialValue.toFixed(2))");
  });

  it("treats extensions as included in the approved maximum budget", () => {
    expect(SUPPLY_ECONOMIC_PERIOD_SCRIPT).toContain("incluidas las posibles prórrogas");
    expect(SUPPLY_ECONOMIC_PERIOD_SCRIPT).toContain("supplyExtensionsDoNotAutomaticallyIncreaseBudget=true");
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("las prórrogas no incrementan automáticamente el presupuesto máximo");
  });

  it("keeps estimated value as a separate legal calculation", () => {
    expect(SUPPLY_ECONOMIC_PERIOD_SCRIPT).toContain("supplyEstimatedValueStatus=\"PENDING_FINAL_LEGAL_CALCULATION\"");
    expect(SUPPLY_ECONOMIC_PERIOD_SCRIPT).toContain("Valor estimado contractual:");
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("no se toma automáticamente de la proyección de consumo");
  });
});
