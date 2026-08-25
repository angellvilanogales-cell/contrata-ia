import { describe, expect, it } from "vitest";
import { SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT } from "../src/interfaces/lb7/SupplyPblBreakdownProposalScript";

describe("Paso 11.2.3 - cierre documental del PBL", () => {
  it("compila como script aislado", () => {
    expect(() => new Function(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT)).not.toThrow();
  });

  it("mantiene separadas las magnitudes económicas", () => {
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("10.552,44 € sin IVA");
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("precios unitarios de licitación");
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("no se adicionan importes distintos al PBL calculado");
  });

  it("no inventa porcentajes de costes indirectos", () => {
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("sin inventar porcentajes de costes indirectos");
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("transporte, distribución, entrega, estructura empresarial, margen");
  });

  it("inserta exclusivamente en las dos líneas residuales del apartado 2.A", () => {
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("2.A.PRESUPUESTO BASE DE LICITACIÓN");
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("2.B.VALOR ESTIMADO DEL CONTRATO");
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("blanks.length<2");
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("blanks[0].textContent");
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("blanks[1].textContent");
  });

  it("exige validación humana antes de generar el ODT", () => {
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("validateSupplyPblBreakdownProposal");
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("supplyPblBreakdownProposalValidated");
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("runPblBreakdownClosure");
  });
});
