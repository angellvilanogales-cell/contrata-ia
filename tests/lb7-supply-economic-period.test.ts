import { describe, expect, it } from "vitest";
import { SUPPLY_ECONOMIC_PERIOD_SCRIPT } from "../src/interfaces/lb7/SupplyEconomicPeriodScript";
import { SUPPLY_FINALIZATION_SCRIPT } from "../src/interfaces/lb7/SupplyFinalizationScript";
import { ADAPTIVE_FLOW_UI } from "../src/interfaces/lb7/AdaptiveFlowUi";

describe("LB-7 supply catalogue temporal horizon", () => {
  it("requires the period represented by catalogue quantities before reconciliation", () => {
    expect(SUPPLY_ECONOMIC_PERIOD_SCRIPT).toContain("qué período representan las cantidades estimadas de la hoja importada");
    expect(SUPPLY_ECONOMIC_PERIOD_SCRIPT).toContain("Doce meses / un año");
    expect(SUPPLY_ECONOMIC_PERIOD_SCRIPT).toContain("Todo el período inicial del contrato");
  });

  it("projects initial duration and each extension from the validated reference period without turning projection into budget or estimated value", () => {
    expect(SUPPLY_ECONOMIC_PERIOD_SCRIPT).toContain("base*initial/ref");
    expect(SUPPLY_ECONOMIC_PERIOD_SCRIPT).toContain("base*m/ref");
    expect(SUPPLY_ECONOMIC_PERIOD_SCRIPT).toContain("supplyCatalogueProjectedExtensionConsumptionExVat");
    expect(SUPPLY_ECONOMIC_PERIOD_SCRIPT).toContain("supplyCatalogueProjectedTotalConsumptionExVat");
    expect(SUPPLY_ECONOMIC_PERIOD_SCRIPT).toContain("supplyCatalogueProjectedEstimatedValueExVat=undefined");
    expect(SUPPLY_ECONOMIC_PERIOD_SCRIPT).toContain("No constituye por sí sola presupuesto máximo ni valor estimado del contrato");
  });

  it("blocks document readiness until temporal projection is validated", () => {
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("supplyCataloguePeriodValidated===true");
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("Horizonte temporal del catálogo");
    expect(ADAPTIVE_FLOW_UI).toContain('/supply-economic-period.js');
  });
});
