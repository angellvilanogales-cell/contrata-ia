import { describe, expect, it } from "vitest";
import { FERRETERIA_PCAP_FINAL_DOCUMENT, evaluateFerreteriaPcapFinalClosure } from "../src/application/intake/lb46/FerreteriaPcapFinalDocumentClosure";

describe("LB46 - cierre técnico PCAP ferretería", () => {
  it("registra el candidato ODT real y las dos proyecciones del catálogo", () => {
    expect(FERRETERIA_PCAP_FINAL_DOCUMENT.fileName.endsWith(".odt")).toBe(true);
    expect(FERRETERIA_PCAP_FINAL_DOCUMENT.catalogueRows).toBe(98);
    expect(FERRETERIA_PCAP_FINAL_DOCUMENT.catalogueProjection.anexoI).toContain("98_ROWS");
    expect(FERRETERIA_PCAP_FINAL_DOCUMENT.catalogueProjection.anexoV).toContain("98_ROWS");
  });
  it("cierra ingeniería sin fabricar aceptación humana ni productionReady", () => {
    const r = evaluateFerreteriaPcapFinalClosure();
    expect(r.engineeringClosed).toBe(true);
    expect(r.humanAcceptanceRequired).toBe(true);
    expect(r.productionReady).toBe(false);
  });
});
