import { describe, expect, it } from "vitest";
import { CARL_FINE_REGRESSION_BASELINE, CARL_FINE_REGRESSION_VERSION } from "../src/regression/ServiceRegressionCase005CarlFineGuard";

describe("Paso 11.8.3 - guarda fina CARL", () => {
  it("preserva la línea base y bloquea degradaciones de la calificación mixta", () => {
    const b = CARL_FINE_REGRESSION_BASELINE;

    expect(CARL_FINE_REGRESSION_VERSION).toBe("REG-SERVICE-005-CARL-FINE-GUARD-11.8.3-v1");
    expect(b.caseId).toBe("REG-SERVICE-005");
    expect(b.passed).toBe(true);
    expect(b.blockers).toHaveLength(0);
    expect(b.checks).toHaveLength(12);
    expect(b.checks.every((c) => c.ok)).toBe(true);
    expect(b.sourceValueGuard.rule).toBe("SOURCE_DECLARED_VALUE_ONLY");
    expect(b.sourceValueGuard.value).toBe(106008.80);
    expect(b.sourceValueGuard.explanation.includes("no convierte")).toBe(true);
    expect(b.classificationGuard.includes("contrato mixto 90/10")).toBe(true);
    expect(b.deliberatelyNotFrozenYet.some((x) => x.includes("20 puntos restantes"))).toBe(true);
    expect(b.deliberatelyNotFrozenYet.some((x) => x.includes("DA 33"))).toBe(true);

    const mutated = b.checks.map((c) => ({ ...c }));
    mutated[0] = { ...mutated[0], ok: false };
    expect(mutated.every((c) => c.ok)).toBe(false);
  });
});
