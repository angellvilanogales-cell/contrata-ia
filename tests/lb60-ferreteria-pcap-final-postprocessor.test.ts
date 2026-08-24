import { describe, expect, it } from "vitest";
import { auditFerreteriaCatalogProjectionParity, projectCanonicalCatalogToPcapAnexoI, projectCanonicalCatalogToPcapAnexoV } from "../src/application/intake/lb45/FerreteriaCrossDocumentCatalogProjection";

describe("LB60 - contrato del cierre físico final PCAP", () => {
  it("mantiene 98 filas source-backed para Anexo I y Anexo V", () => {
    expect(projectCanonicalCatalogToPcapAnexoI()).toHaveLength(98);
    expect(projectCanonicalCatalogToPcapAnexoV()).toHaveLength(98);
    expect(auditFerreteriaCatalogProjectionParity().ready).toBe(true);
  });

  it("deja columnas de oferta del Anexo V para la persona licitadora", () => {
    const first = projectCanonicalCatalogToPcapAnexoV()[0]!;
    expect(first.description).toBe("ABRAZADERAS MANGUERA");
    expect(first.estimatedAnnualUnits).toBe(2);
    expect(first.maxUnitPriceCentsExVat).toBe(130);
    expect(first.bidderUnitPriceCentsExVat).toBeNull();
    expect(first.bidderTotalCentsExVat).toBeNull();
  });
});
