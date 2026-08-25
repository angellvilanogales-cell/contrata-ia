import { describe, expect, it } from "vitest";
import { UniversalAwardCriteriaEngine } from "../src/engines/UniversalAwardCriteriaEngine";

const engine = new UniversalAwardCriteriaEngine();
const criterion = (id: string, weightPercent: number, kind: "COST" | "QUALITY", evaluation: "FORMULA" | "JUDGMENT") => ({
  id,
  weightPercent,
  kind,
  evaluation,
  linkedToObject: true,
  objectivelyDefined: true,
  verifiable: true,
});

describe("LB91.6 - criterios universales sin invención", () => {
  it("acepta una configuración plural cerrada en 100 y con coste", () => {
    const result = engine.evaluate({
      contractType: "SERVICE",
      criteria: [criterion("price", 70, "COST", "FORMULA"), criterion("quality", 30, "QUALITY", "JUDGMENT")],
    });
    expect(result.valid).toBe(true);
    expect(result.totalWeightPercent).toBe(100);
  });

  it("bloquea criterios no vinculados o no verificables", () => {
    const result = engine.evaluate({
      contractType: "SUPPLY",
      criteria: [{ ...criterion("x", 100, "COST", "FORMULA"), linkedToObject: false, verifiable: false }],
      supplyOrServicePerfectlyDefinedForPriceOnlyException: true,
    });
    expect(result.valid).toBe(false);
    expect(result.blockers.some(item => item.includes("vinculado"))).toBe(true);
  });

  it("no permite precio único en concesiones", () => {
    const result = engine.evaluate({ contractType: "CONCESSION", criteria: [criterion("price", 100, "COST", "FORMULA")] });
    expect(result.valid).toBe(false);
  });

  it("exige 51% de calidad en servicios intelectuales o Anexo IV", () => {
    const result = engine.evaluate({
      contractType: "SERVICE",
      intellectualService: true,
      criteria: [criterion("price", 60, "COST", "FORMULA"), criterion("quality", 40, "QUALITY", "JUDGMENT")],
    });
    expect(result.valid).toBe(false);
    expect(result.blockers.some(item => item.includes("51%"))).toBe(true);
  });

  it("bloquea precio único en suministro si no consta la excepción legal", () => {
    const result = engine.evaluate({ contractType: "SUPPLY", criteria: [criterion("price", 100, "COST", "FORMULA")] });
    expect(result.valid).toBe(false);
    expect(result.blockers.some(item => item.includes("excepción"))).toBe(true);
  });

  it("no inventa criterios cuando el expediente no aporta ninguno", () => {
    const result = engine.evaluate({ contractType: "WORKS", criteria: [] });
    expect(result.valid).toBe(false);
    expect(result.criteriaCount).toBe(0);
  });
});
