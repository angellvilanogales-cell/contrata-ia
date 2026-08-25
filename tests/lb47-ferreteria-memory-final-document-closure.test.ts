import { describe, expect, it } from "vitest";
import { FERRETERIA_MEMORY_FINAL_DOCUMENT, evaluateFerreteriaMemoryFinalClosure } from "../src/application/intake/lb47/FerreteriaMemoryFinalDocumentClosure";

describe("LB47 - cierre técnico Memoria ferretería", () => {
  it("registra fuente editable y candidato final V14", () => {
    expect(FERRETERIA_MEMORY_FINAL_DOCUMENT.sourceFileName.endsWith(".odt")).toBe(true);
    expect(FERRETERIA_MEMORY_FINAL_DOCUMENT.finalFileName.endsWith(".odt")).toBe(true);
    expect(FERRETERIA_MEMORY_FINAL_DOCUMENT.renderedPdfPages).toBe(9);
  });
  it("mantiene aceptación humana separada del cierre técnico", () => {
    const r=evaluateFerreteriaMemoryFinalClosure();
    expect(r.engineeringClosed).toBe(true);
    expect(r.humanAcceptanceRequired).toBe(true);
    expect(r.productionReady).toBe(false);
  });
});
