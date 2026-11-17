import { describe, expect, it } from "vitest";
import { evaluateUniversalSupplyVariant } from "../src/application/universal/UniversalSupplyVariantGate";

describe("LB91.86-90 - gate de subfamilias Supply", () => {
  it("bloquea la selección técnica si no se declara variante", () => {
    const result = evaluateUniversalSupplyVariant({});
    expect(result.ready).toBe(false);
    expect(result.blockers.length).toBeGreaterThan(0);
  });

  it("no permite usar catálogo por necesidades sin pedidos sucesivos acreditados", () => {
    const result = evaluateUniversalSupplyVariant({ declaredVariant: "CATALOGUE_NEEDS", hasSuccessiveOrders: false });
    expect(result.ready).toBe(false);
  });

  it("protege tablets con plataforma frente a una simplificación como suministro ordinario", () => {
    const result = evaluateUniversalSupplyVariant({ declaredVariant: "SUPPLY_WITH_SERVICE_COMPONENT", hasServicePlatformComponent: true });
    expect(result.ready).toBe(true);
    expect(result.technicalOverlay).toContain("plataforma de gestión");
    expect(result.technicalOverlay).toContain("protección de datos");
  });

  it("protege mobiliario con instalación y puesta en marcha", () => {
    const result = evaluateUniversalSupplyVariant({ declaredVariant: "FURNITURE_INSTALLATION", hasInstallationOrAssembly: true });
    expect(result.ready).toBe(true);
    expect(result.technicalOverlay).toContain("montaje");
  });

  it("no hereda automáticamente MRR/DNSH a todo equipamiento digital", () => {
    const result = evaluateUniversalSupplyVariant({ declaredVariant: "DIGITAL_EQUIPMENT", euFunds: false });
    expect(result.ready).toBe(true);
    expect(result.warnings.some(x => x.includes("MRR/DNSH"))).toBe(true);
  });
});
