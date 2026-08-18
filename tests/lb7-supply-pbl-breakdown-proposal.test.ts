import { describe, expect, it } from "vitest";
import { SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT } from "../src/interfaces/lb7/SupplyPblBreakdownProposalScript";
import { ADAPTIVE_FLOW_UI } from "../src/interfaces/lb7/AdaptiveFlowUi";

describe("Paso 11.2.3 - propuesta de desglose PBL", () => {
  it("compila el módulo aislado", () => {
    expect(() => new Function(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT)).not.toThrow();
  });

  it("mantiene validación humana antes del cierre", () => {
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("Propuesta motivada, no decisión automática");
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("Validar propuesta de desglose PBL");
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("supplyPblBreakdownProposalValidated");
  });

  it("no inventa porcentajes de costes indirectos", () => {
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("10.552,44 € sin IVA");
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("integrados en los precios unitarios");
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).not.toContain("costes indirectos: 10 %");
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).not.toContain("beneficio industrial: 6 %");
  });

  it("explica el fundamento jurídico", () => {
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("artículo 100.2 LCSP");
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("transporte, distribución o entrega");
  });

  it("queda integrado después de la auditoría integral", () => {
    expect(ADAPTIVE_FLOW_UI).toContain("SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT");
    expect(ADAPTIVE_FLOW_UI).toContain("Paso 11.2.3 propuesta desglose PBL");
  });
});
