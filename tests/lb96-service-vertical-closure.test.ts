import { describe, expect, it } from "vitest";
import { evaluateServiceVerticalClosure } from "../src/application/intake/lb96/ServiceVerticalClosureGate";

describe("LB96 cierre vertical Service", () => {
  it("no declara cierre aunque Memoria y PPT estén disponibles si falta PCAP editable derivado", () => {
    const result = evaluateServiceVerticalClosure({ memoryAvailable: true, pptAvailable: true, pcapDerivedAvailable: false });
    expect(result.memoryAndPptLayerReady).toBe(true);
    expect(result.pcapLayerReady).toBe(false);
    expect(result.physicalPackageOperational).toBe(false);
    expect(result.engineeringClosed).toBe(false);
    expect(result.blockers.join(" ")).toContain("PCAP Service editable derivado");
    expect(result.productionReady).toBe(false);
  });

  it("bloquea además si faltan los activos generales Service", () => {
    const result = evaluateServiceVerticalClosure({ memoryAvailable: false, pptAvailable: false, pcapDerivedAvailable: false });
    expect(result.memoryAndPptLayerReady).toBe(false);
    expect(result.blockers.join(" ")).toContain("Memoria general Service");
    expect(result.blockers.join(" ")).toContain("PPT general Service");
    expect(result.nextRequiredEvidence.length).toBeGreaterThan(0);
  });

  it("solo cierra cuando las tres capas físicas están acreditadas", () => {
    const result = evaluateServiceVerticalClosure({ memoryAvailable: true, pptAvailable: true, pcapDerivedAvailable: true });
    expect(result.pcapLayerReady).toBe(true);
    expect(result.physicalPackageOperational).toBe(true);
    expect(result.engineeringClosed).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.pcapProvenance).toBe("CONTRATA_IA_DERIVED_GENERAL_TEMPLATE");
    expect(result.officialPcapClaimed).toBe(false);
    expect(result.productionReady).toBe(false);
    expect(result.humanValidationRequired).toBe(true);
  });
});
