import { describe, expect, it } from "vitest";
import { UniversalModificationEngine } from "../src/engines/UniversalModificationEngine";

const engine = new UniversalModificationEngine();

describe("LB91.9 - modificaciones contractuales conservadoras", () => {
  it("cierra una modificación prevista solo con todas las guardas del artículo 204", () => {
    const result = engine.evaluate({
      contractType: "SERVICE",
      route: "PLANNED_ART_204",
      initialPriceExVatCents: 1_000_000,
      maximumModificationPercent: 20,
      expresslyForeseenInPcap: true,
      clauseClearPreciseAndUnambiguous: true,
      scopeLimitsAndNatureDefined: true,
      objectiveTriggerConditionsDefined: true,
      procedureDefined: true,
      createsNewUnitPrices: false,
      changesGlobalNature: false,
    });
    expect(result.legallyClosable).toBe(true);
    expect(result.maximumAmountExVatCents).toBe(200_000);
  });

  it("bloquea una modificación prevista superior al 20%", () => {
    const result = engine.evaluate({
      contractType: "SUPPLY",
      route: "PLANNED_ART_204",
      initialPriceExVatCents: 1_000_000,
      maximumModificationPercent: 21,
      expresslyForeseenInPcap: true,
      clauseClearPreciseAndUnambiguous: true,
      scopeLimitsAndNatureDefined: true,
      objectiveTriggerConditionsDefined: true,
      procedureDefined: true,
      createsNewUnitPrices: false,
      changesGlobalNature: false,
    });
    expect(result.legallyClosable).toBe(false);
    expect(result.blockers.some(item => item.includes("20%"))).toBe(true);
  });

  it("impide nuevos precios unitarios en una modificación prevista", () => {
    const result = engine.evaluate({
      contractType: "SUPPLY",
      route: "PLANNED_ART_204",
      initialPriceExVatCents: 1_000_000,
      maximumModificationPercent: 10,
      expresslyForeseenInPcap: true,
      clauseClearPreciseAndUnambiguous: true,
      scopeLimitsAndNatureDefined: true,
      objectiveTriggerConditionsDefined: true,
      procedureDefined: true,
      createsNewUnitPrices: true,
      changesGlobalNature: false,
    });
    expect(result.legallyClosable).toBe(false);
  });

  it("aplica a DA33 las guardas de presupuesto máximo, previsión previa, crédito y tramitación anterior al agotamiento", () => {
    const result = engine.evaluate({
      contractType: "SUPPLY",
      route: "DA33_HIGHER_REAL_NEEDS",
      initialPriceExVatCents: 10_000_000,
      maximumModificationPercent: 20,
      successiveUnitPriceNeedsContract: true,
      maximumBudgetApprovedCents: 18_000_000,
      expresslyForeseenInPcap: true,
      maximumBudgetAlreadyExhausted: false,
      creditReservedForHigherNeeds: true,
      createsNewUnitPrices: false,
      changesGlobalNature: false,
    });
    expect(result.legallyClosable).toBe(true);
  });

  it("no autocierra una modificación no prevista del artículo 205 aunque se declare una categoría", () => {
    const result = engine.evaluate({
      contractType: "WORKS",
      route: "UNPLANNED_ART_205",
      initialPriceExVatCents: 50_000_000,
      article205Ground: "UNFORESEEABLE_CIRCUMSTANCES",
      strictlyIndispensableVariation: true,
      changesGlobalNature: false,
    });
    expect(result.legallyClosable).toBe(false);
    expect(result.blockers.some(item => item.includes("revisión jurídica"))).toBe(true);
  });
});
