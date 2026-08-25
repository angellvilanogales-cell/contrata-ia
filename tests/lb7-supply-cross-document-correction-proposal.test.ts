import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SUPPLY_CROSS_DOCUMENT_CORRECTION_PROPOSAL_SCRIPT } from "../src/interfaces/lb7/SupplyCrossDocumentCorrectionProposalScript";

describe("LB-7 supply cross-document correction proposal", () => {
  it("keeps the browser script syntactically valid", () => {
    expect(() => new Function(SUPPLY_CROSS_DOCUMENT_CORRECTION_PROPOSAL_SCRIPT)).not.toThrow();
  });

  it("uses the final real source versions supplied for the expediente", () => {
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_PROPOSAL_SCRIPT).toContain("Memoria Ferretería SSCC SAE V12");
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_PROPOSAL_SCRIPT).toContain("PCAP suministro abierto simplificado abreviado V7");
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_PROPOSAL_SCRIPT).toContain("PPT Ferretería SSCC SAE V6");
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_PROPOSAL_SCRIPT).toContain("AJ-SAE 2026/16");
  });

  it("proposes the validated DA33 estimated value without double-counting extensions", () => {
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_PROPOSAL_SCRIPT).toContain("21.793,15");
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_PROPOSAL_SCRIPT).toContain("18.160,96");
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_PROPOSAL_SCRIPT).toContain("3.632,19");
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_PROPOSAL_SCRIPT).toContain("sin volver a adicionar las prórrogas");
  });

  it("forbids new catalogue articles while allowing quantity variation", () => {
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_PROPOSAL_SCRIPT).toContain("no se incorporan nuevos artículos ni nuevos precios unitarios");
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_PROPOSAL_SCRIPT).toContain("Las cantidades estimadas son orientativas");
  });

  it("recovers the quantified PBL breakdown from the real final models", () => {
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_PROPOSAL_SCRIPT).toContain("76,00 % = 8.019,85 €");
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_PROPOSAL_SCRIPT).toContain("18,00 % = 1.899,44 €");
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_PROPOSAL_SCRIPT).toContain("6,00 % = 633,15 €");
  });

  it("keeps human validation before any document rewrite", () => {
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_PROPOSAL_SCRIPT).toContain("Este paso todavía no modifica ningún documento");
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_PROPOSAL_SCRIPT).toContain("validateSupplyCrossDocumentCorrectionProposal");
  });

  it("is integrated after step 11.4", () => {
    const ui = fs.readFileSync(path.resolve("src/interfaces/lb7/AdaptiveFlowUi.ts"), "utf8");
    expect(ui).toContain("SUPPLY_CROSS_DOCUMENT_CORRECTION_PROPOSAL_SCRIPT");
    expect(ui.indexOf("${SUPPLY_CROSS_DOCUMENT_CORRECTION_PROPOSAL_SCRIPT}")).toBeGreaterThan(ui.indexOf("${SUPPLY_CROSS_DOCUMENT_AUDIT_SCRIPT}"));
    expect(ui).toContain("Paso 11.4.1 propuestas de corrección documental");
  });
});
