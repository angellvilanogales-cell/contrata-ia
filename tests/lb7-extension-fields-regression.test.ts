import { describe, expect, it } from "vitest";
import { ADAPTIVE_FLOW_SCRIPT } from "../src/interfaces/lb7/AdaptiveFlowScript";

describe("LB-7 structured extension fields", () => {
  it("asks for extension count and one duration field per extension", () => {
    expect(ADAPTIVE_FLOW_SCRIPT).toContain("Número de prórrogas previstas");
    expect(ADAPTIVE_FLOW_SCRIPT).toContain("extensionCount");
    expect(ADAPTIVE_FLOW_SCRIPT).toContain("extensionMonth_");
    expect(ADAPTIVE_FLOW_SCRIPT).toContain("duración en meses");
  });

  it("uses one supply budget input per extension instead of delimited text", () => {
    expect(ADAPTIVE_FLOW_SCRIPT).toContain("extensionBudget_");
    expect(ADAPTIVE_FLOW_SCRIPT).toContain("No es necesario utilizar comas ni punto y coma");
    expect(ADAPTIVE_FLOW_SCRIPT).not.toContain('placeholder="Ej.: 6.000; 6.000"');
    expect(ADAPTIVE_FLOW_SCRIPT).not.toContain('placeholder="Ej.: 12, 12. Si no hay prórrogas, escriba 0"');
  });
});
