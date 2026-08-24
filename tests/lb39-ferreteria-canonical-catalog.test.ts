import { describe, expect, it } from "vitest";
import { assertCrossDocumentCatalogParity, validateFerreteriaCanonicalCatalog } from "../src/application/intake/lb39/FerreteriaCanonicalCatalog";

describe("LB39 - catálogo canónico ferretería", () => {
  it("bloquea catálogos incompletos y exige exactamente 98 referencias", () => {
    const result = validateFerreteriaCanonicalCatalog([]);
    expect(result.ready).toBe(false);
    expect(result.blockers.join(" ")).toMatch(/exactamente 98 referencias/i);
    expect(result.blockers.join(" ")).toMatch(/Falta la referencia 98/i);
  });

  it("bloquea divergencias entre Anexo I, Anexo V y PPT", () => {
    const canonical = [{ sequence: 1, description: "A", estimatedAnnualConsumption: 1, totalContractUnits24Months: 2, unitPriceCentsExVat: 100, totalPriceCentsExVat: 200, vatCents: 42, totalPriceCentsVatIncluded: 242 }];
    expect(() => assertCrossDocumentCatalogParity({ canonical, pcapAnexoI: canonical, pcapAnexoV: [], ppt: canonical })).toThrow(/Anexo V/);
    expect(() => assertCrossDocumentCatalogParity({ canonical, pcapAnexoI: canonical, pcapAnexoV: canonical, ppt: [] })).toThrow(/PPT/);
  });
});
