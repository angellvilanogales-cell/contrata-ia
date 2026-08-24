import { describe, expect, it } from "vitest";
import { FERRETERIA_V1_DOCUMENT_SET, evaluateFerreteriaV1DocumentSetReadiness } from "../src/application/intake/lb38/FerreteriaV1DocumentSetScope";

describe("LB38 - alcance documental V1 CONTR/2026/240267", () => {
  it("mantiene PCAP, memoria y PPT como paquete mínimo obligatorio", () => {
    expect(FERRETERIA_V1_DOCUMENT_SET.map(item => item.kind)).toEqual(["PCAP", "MEMORIA", "PPT"]);
    expect(FERRETERIA_V1_DOCUMENT_SET.every(item => item.requiredForV1)).toBe(true);
  });

  it("no permite declarar V1 lista mientras memoria y PPT no tengan pipeline protegido propio", () => {
    const result = evaluateFerreteriaV1DocumentSetReadiness();
    expect(result.productionReady).toBe(false);
    expect(result.allThreeDocumentsRequired).toBe(true);
    expect(result.blockers.join(" ")).toMatch(/MEMORIA/);
    expect(result.blockers.join(" ")).toMatch(/PPT/);
  });

  it("registra la memoria V12 letrado como referencia PDF, no como falso editable", () => {
    const memoria = FERRETERIA_V1_DOCUMENT_SET.find(item => item.kind === "MEMORIA")!;
    expect(memoria.sourceName).toContain("V12_letrado.pdf");
    expect(memoria.sourceFormat).toBe("PDF");
    expect(memoria.productionState).toBe("NEEDS_EDITABLE_MASTER");
  });

  it("reconoce el PPT V6 ODT como fuente real editable sin convertirlo automáticamente en modelo genérico", () => {
    const ppt = FERRETERIA_V1_DOCUMENT_SET.find(item => item.kind === "PPT")!;
    expect(ppt.sourceName).toContain("PPT Feretería SSCC SAE V6.odt");
    expect(ppt.sourceFormat).toBe("ODT");
    expect(ppt.sourceRole).toBe("REAL_CASE_REFERENCE");
  });
});
