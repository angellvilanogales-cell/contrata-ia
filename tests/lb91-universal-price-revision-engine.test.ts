import { describe, expect, it } from "vitest";
import { UniversalPriceRevisionEngine } from "../src/engines/UniversalPriceRevisionEngine";

const engine = new UniversalPriceRevisionEngine();

describe("LB91.7 - revisión de precios conservadora", () => {
  it("considera obras elegibles en principio pero exige guardas para devengo", () => {
    const result = engine.evaluate({
      contractType: "WORKS",
      provisionalPrice: false,
      executedPercent: 20,
      monthsSinceFormalization: 12,
    });
    expect(result.eligibility).toBe("ELIGIBLE_IN_PRINCIPLE");
    expect(result.canAccrueNow).toBe(true);
  });

  it("no permite revisión en precios provisionales", () => {
    const result = engine.evaluate({ contractType: "SERVICE", provisionalPrice: true });
    expect(result.eligibility).toBe("NOT_ELIGIBLE");
    expect(result.canAccrueNow).toBe(false);
  });

  it("acepta en principio la excepción de materias primas cuando supera el 20%", () => {
    const result = engine.evaluate({
      contractType: "SERVICE",
      provisionalPrice: false,
      investmentRecoveryPeriodYears: 2,
      rawMaterialsIntermediateGoodsAndEnergySharePercent: 21,
      executedPercent: 50,
      monthsSinceFormalization: 18,
    });
    expect(result.eligibility).toBe("ELIGIBLE_IN_PRINCIPLE");
    expect(result.notes.some(note => note.includes("fracción"))).toBe(true);
  });

  it("no convierte exactamente el 20% de materias primas en la excepción", () => {
    const result = engine.evaluate({
      contractType: "SERVICE",
      provisionalPrice: false,
      investmentRecoveryPeriodYears: 2,
      rawMaterialsIntermediateGoodsAndEnergySharePercent: 20,
    });
    expect(result.eligibility).toBe("NOT_ELIGIBLE");
  });

  it("mantiene pendiente la decisión si faltan los hechos necesarios", () => {
    const result = engine.evaluate({ contractType: "SERVICE", provisionalPrice: false });
    expect(result.eligibility).toBe("PENDING_FACTS");
    expect(result.blockers.length).toBeGreaterThan(0);
  });
});
