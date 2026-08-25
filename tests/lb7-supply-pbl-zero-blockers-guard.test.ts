import { describe, expect, it } from "vitest";
import { SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT } from "../src/interfaces/lb7/SupplyPblBreakdownProposalScript";

describe("Paso 11.2.3 - guardia documental del PBL", () => {
  it("se muestra también después de una auditoría 11.2.2 con cero bloqueantes mientras el PBL no esté cerrado", () => {
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("var auditDone=Array.isArray(a.supplyAnnexIComprehensiveAuditBlockers)");
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("auditDone&&a.supplyPblBreakdownClosureValidated!==true");
  });

  it("no declara cerrado el PBL por el estado de la interfaz", () => {
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("el cierre del PBL no se da por superado hasta comprobar e insertar físicamente el desglose del apartado 2.A en el ODT");
  });

  it("localiza las líneas residuales dentro del 2.A y conserva las magnitudes económicas", () => {
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("Importe desglosado:");
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("2.B.VALOR ESTIMADO DEL CONTRATO");
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("10.552,44 € sin IVA");
    expect(SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT).toContain("precios unitarios");
  });
});
