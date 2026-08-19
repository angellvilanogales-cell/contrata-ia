import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SUPPLY_CROSS_DOCUMENT_CORRECTION_GENERATOR_SCRIPT } from "../src/interfaces/lb7/SupplyCrossDocumentCorrectionGeneratorScript";

describe("LB-7 supply cross-document correction generator", () => {
  it("keeps the browser script syntactically valid", () => {
    expect(() => new Function(SUPPLY_CROSS_DOCUMENT_CORRECTION_GENERATOR_SCRIPT)).not.toThrow();
  });

  it("requires the human validation from 11.4.1", () => {
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_GENERATOR_SCRIPT).toContain("supplyCrossDocumentCorrectionProposalValidated===true");
  });

  it("patches the three validated documentary targets", () => {
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_GENERATOR_SCRIPT).toContain("patchPcapOdt");
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_GENERATOR_SCRIPT).toContain("patchPptOdt");
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_GENERATOR_SCRIPT).toContain("patchMemoryOdt");
  });

  it("preserves the validated economic magnitudes and catalogue closure", () => {
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_GENERATOR_SCRIPT).toContain("8.019,85");
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_GENERATOR_SCRIPT).toContain("1.899,44");
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_GENERATOR_SCRIPT).toContain("633,15");
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_GENERATOR_SCRIPT).toContain("21.793,15");
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_GENERATOR_SCRIPT).toContain("18.160,96");
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_GENERATOR_SCRIPT).toContain("3.632,19");
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_GENERATOR_SCRIPT).toContain("no habilitarán la incorporación de nuevos artículos");
  });

  it("refuses to reconstruct PDFs as if they were editable administrative templates", () => {
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_GENERATOR_SCRIPT).toContain("requiere un archivo ODT editable como origen");
    expect(SUPPLY_CROSS_DOCUMENT_CORRECTION_GENERATOR_SCRIPT).toContain("Los PDF aportados se mantienen como fuente de contraste");
  });

  it("is integrated after the 11.4.1 proposal", () => {
    const ui = fs.readFileSync(path.resolve("src/interfaces/lb7/AdaptiveFlowUi.ts"), "utf8");
    expect(ui).toContain("SUPPLY_CROSS_DOCUMENT_CORRECTION_GENERATOR_SCRIPT");
    expect(ui.indexOf("${SUPPLY_CROSS_DOCUMENT_CORRECTION_GENERATOR_SCRIPT}")).toBeGreaterThan(
      ui.indexOf("${SUPPLY_CROSS_DOCUMENT_CORRECTION_PROPOSAL_SCRIPT}"),
    );
    expect(ui).toContain("Paso 11.4.2 generación documental corregida");
  });
});