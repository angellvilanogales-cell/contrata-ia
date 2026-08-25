import { describe, expect, it } from "vitest";
import {
  auditFerreteriaCatalogProjectionParity,
  projectCanonicalCatalogToPcapAnexoI,
  projectCanonicalCatalogToPcapAnexoV,
  projectCanonicalCatalogToPpt,
} from "../src/application/intake/lb45/FerreteriaCrossDocumentCatalogProjection";

describe("LB45 - proyecciones documentales del catálogo canónico", () => {
  it("proyecta 98 filas a los tres documentos sin divergencias", () => {
    const audit = auditFerreteriaCatalogProjectionParity();
    expect(audit.ready).toBe(true);
    expect(audit.blockers).toEqual([]);
    expect(audit.count).toBe(98);
    expect(projectCanonicalCatalogToPcapAnexoI()).toHaveLength(98);
    expect(projectCanonicalCatalogToPcapAnexoV()).toHaveLength(98);
    expect(projectCanonicalCatalogToPpt()).toHaveLength(98);
  });

  it("Anexo V deja exclusivamente las dos columnas de oferta para cumplimentación del licitador", () => {
    const first = projectCanonicalCatalogToPcapAnexoV()[0]!;
    expect(first).toEqual({
      description: "ABRAZADERAS MANGUERA",
      estimatedAnnualUnits: 2,
      maxUnitPriceCentsExVat: 130,
      bidderUnitPriceCentsExVat: null,
      bidderTotalCentsExVat: null,
    });
  });

  it("Anexo I usa la magnitud anual orientativa y no transforma el presupuesto máximo DA33 en unidades cerradas", () => {
    const first = projectCanonicalCatalogToPcapAnexoI()[0]!;
    expect(first.lot).toBe("Lote único");
    expect(first.estimatedAnnualUnits).toBe(2);
    expect(first.annualReferenceAmountCentsExVat).toBe(260);
  });
});
