import { describe, expect, it } from "vitest";
import { SUPPLY_LEGAL_CLOSURE_SCRIPT } from "../src/interfaces/lb7/SupplyLegalClosureScript";

describe("LB-7 DA33 planned modification percentage", () => {
  it("uses a percentage rather than a free monetary amount", () => {
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("Porcentaje máximo de la modificación prevista");
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("supplyNeedsModificationMaximumIncreasePercent");
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain('max="20"');
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).not.toContain('placeholder="Importe máximo adicional sin IVA"');
  });

  it("states and enforces the 20 percent maximum under article 204.1 LCSP", () => {
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("Límite legal: 20 % del precio inicial del contrato");
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("artículo 204.1 LCSP");
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("pct>20");
  });

  it("links the needs-based modification to DA 33 and keeps new unit prices forbidden", () => {
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("disposición adicional 33.ª LCSP");
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("nuevos precios unitarios no previstos");
  });

  it("derives the monetary increase and estimated value from the validated percentage", () => {
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("budget*modPercent/100");
    expect(SUPPLY_LEGAL_CLOSURE_SCRIPT).toContain("b*pct/100");
  });
});
