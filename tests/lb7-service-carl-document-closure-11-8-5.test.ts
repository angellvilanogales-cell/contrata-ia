import { describe, expect, it } from "vitest";
import { CARL_DOCUMENT_CLOSURE_11_8_5, CARL_DOCUMENT_CLOSURE_ITEMS } from "../src/regression/ServiceRegressionCase005CarlDocumentClosure";

describe("Paso 11.8.5 - cierre documental CARL", () => {
  it("conserva el cierre documental con sus elementos abiertos y reglas de promoción", () => {
    const c = CARL_DOCUMENT_CLOSURE_11_8_5;

    expect(c.id).toBe("REG-SERVICE-005");
    expect(c.step).toBe("11.8.5");
    expect(c.status).toBe("DOCUMENTARY_CLOSURE_WITH_OPEN_ITEMS");
    expect(c.humanValidationRequired).toBe(true);
    expect(c.counts.CONFIRMED).toBeGreaterThan(0);
    expect(c.counts.CONFIRMED_PARTIAL).toBeGreaterThan(0);
    expect(c.counts.PENDING_SOURCE_EVIDENCE).toBeGreaterThan(0);
    expect(c.counts.NOT_APPLICABLE).toBeGreaterThan(0);
    expect(Object.values(c.counts).reduce((sum, value) => sum + value, 0)).toBe(CARL_DOCUMENT_CLOSURE_ITEMS.length);
    expect(CARL_DOCUMENT_CLOSURE_ITEMS.find((x) => x.id === "CARL-CLOSE-DA33")?.status).toBe("PENDING_SOURCE_EVIDENCE");
    expect(CARL_DOCUMENT_CLOSURE_ITEMS.find((x) => x.id === "CARL-CLOSE-JUDGEMENT")?.status).toBe("NOT_APPLICABLE");
    expect(CARL_DOCUMENT_CLOSURE_ITEMS.find((x) => x.id === "CARL-CLOSE-VE")?.status).toBe("CONFIRMED");
    expect(CARL_DOCUMENT_CLOSURE_ITEMS.find((x) => x.id === "CARL-CLOSE-VE")?.evidence.includes("no se generaliza")).toBe(true);
    expect(c.closureRule).toMatch(/PENDING_SOURCE_EVIDENCE/);
    expect(c.promotionRule).toMatch(/fuente primaria/i);
  });
});
