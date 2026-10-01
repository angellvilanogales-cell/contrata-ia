import { describe, expect, it } from "vitest";
import { UniversalLotsEngine } from "../src/engines/UniversalLotsEngine";

const engine = new UniversalLotsEngine();

describe("LB91.8 - lotes sin motivación inventada", () => {
  it("mantiene pendiente una decisión no evaluada", () => {
    const result = engine.evaluate({ contractType: "SUPPLY", decision: "UNASSESSED" });
    expect(result.result).toBe("ASSESS_DIVISION");
    expect(result.blockers.length).toBeGreaterThan(0);
  });

  it("acepta división solo con lotes materiales identificados", () => {
    expect(engine.evaluate({ contractType: "SERVICE", decision: "DIVIDE", lotCount: 2, natureOrObjectAllowsIndependentParts: true }).result).toBe("DIVISION_VALIDATABLE");
    expect(engine.evaluate({ contractType: "SERVICE", decision: "DIVIDE", lotCount: 1 }).result).toBe("BLOCKED");
  });

  it("exige motivación concreta para no dividir", () => {
    const result = engine.evaluate({ contractType: "SUPPLY", decision: "NO_DIVIDE", natureOrObjectAllowsIndependentParts: true });
    expect(result.result).toBe("BLOCKED");
    expect(result.blockers.some(item => item.includes("motiv"))).toBe(true);
  });

  it("exige informe previo si se invoca riesgo de restricción de competencia", () => {
    const result = engine.evaluate({
      contractType: "WORKS",
      decision: "NO_DIVIDE",
      noDivisionReasonKind: "COMPETITION_RISK",
      noDivisionReasonText: "La división podría restringir injustificadamente la competencia.",
      competitionAuthorityPriorReportAvailable: false,
    });
    expect(result.result).toBe("BLOCKED");
    expect(result.blockers.some(item => item.includes("informe previo"))).toBe(true);
  });

  it("no aplica un único régimen a las concesiones sin conocer el subtipo", () => {
    const result = engine.evaluate({ contractType: "CONCESSION", decision: "NO_DIVIDE" });
    expect(result.result).toBe("BLOCKED");
  });
});
