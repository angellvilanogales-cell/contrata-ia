import { describe, expect, it } from "vitest";
import { FERRETERIA_PPT_FINAL_DOCUMENT, evaluateFerreteriaPptFinalClosure } from "../src/application/intake/lb48/FerreteriaPptFinalDocumentClosure";

describe("LB48 - cierre técnico PPT ferretería", () => {
  it("proyecta catálogo cerrado de 98 referencias", () => {
    expect(FERRETERIA_PPT_FINAL_DOCUMENT.catalogueRows).toBe(98);
    expect(FERRETERIA_PPT_FINAL_DOCUMENT.catalogueSemantics).toBe("CLOSED_REFERENCES_VARIABLE_QUANTITIES");
    expect(FERRETERIA_PPT_FINAL_DOCUMENT.visualCorporateFamilyAudited).toBe(true);
  });
  it("no fabrica identidad binaria V6 ni aceptación humana", () => {
    const r=evaluateFerreteriaPptFinalClosure();
    expect(r.engineeringClosed).toBe(true);
    expect(r.exactV6BinaryRuntimeIdentityVerified).toBe(false);
    expect(r.humanAcceptanceRequired).toBe(true);
    expect(r.productionReady).toBe(false);
  });
});
