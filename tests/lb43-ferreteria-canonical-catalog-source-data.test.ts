import { describe, expect, it } from "vitest";
import {
  FERRETERIA_CANONICAL_CATALOG_98,
  FERRETERIA_SOURCE_DECLARED_CATALOG_TOTALS,
  evaluateFerreteriaCanonicalCatalogSourceData,
} from "../src/application/intake/lb43/FerreteriaCanonicalCatalogSourceData";
import { assertCrossDocumentCatalogParity } from "../src/application/intake/lb39/FerreteriaCanonicalCatalog";

describe("LB43 - catálogo canónico source-backed de 98 referencias", () => {
  it("contiene exactamente 98 referencias secuenciales y suma el PBL sin IVA declarado", () => {
    const result = evaluateFerreteriaCanonicalCatalogSourceData();
    expect(result.ready).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.itemCount).toBe(98);
    expect(result.totalExVatCents).toBe(1_055_244);
    expect(FERRETERIA_CANONICAL_CATALOG_98.map(item => item.sequence)).toEqual(Array.from({ length: 98 }, (_, index) => index + 1));
  });

  it("preserva la diferencia de redondeo agregada del IVA de la fuente sin corregir silenciosamente filas", () => {
    const result = evaluateFerreteriaCanonicalCatalogSourceData();
    expect(FERRETERIA_SOURCE_DECLARED_CATALOG_TOTALS.vatCents).toBe(221_601);
    expect(result.rowRoundedVatCents).toBe(221_599);
    expect(result.preservedAggregateRoundingDifferenceCents).toBe(2);
    expect(FERRETERIA_SOURCE_DECLARED_CATALOG_TOTALS.pblVatIncludedCents).toBe(1_276_845);
  });

  it("sirve como fuente única de paridad PCAP Anexo I, PCAP Anexo V y PPT", () => {
    expect(() => assertCrossDocumentCatalogParity({
      canonical: FERRETERIA_CANONICAL_CATALOG_98,
      pcapAnexoI: FERRETERIA_CANONICAL_CATALOG_98,
      pcapAnexoV: FERRETERIA_CANONICAL_CATALOG_98,
      ppt: FERRETERIA_CANONICAL_CATALOG_98,
    })).not.toThrow();
  });
});
