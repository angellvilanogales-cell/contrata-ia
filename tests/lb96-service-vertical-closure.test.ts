import { describe, expect, it } from "vitest";
import { evaluateServiceVerticalClosure } from "../src/application/intake/lb96/ServiceVerticalClosureGate";

describe("LB96 cierre vertical Service", () => {
  it("no declara cierre aunque Memoria y PPT estén disponibles si falta PCAP editable promovido", () => {
    const result = evaluateServiceVerticalClosure({ memoryAvailable: true, pptAvailable: true, pcapEditablePromoted: false });
    expect(result.memoryAndPptLayerReady).toBe(true);
    expect(result.pcapLayerReady).toBe(false);
    expect(result.physicalPackageOperational).toBe(false);
    expect(result.engineeringClosed).toBe(false);
    expect(result.blockers.join(" ")).toContain("PCAP Service editable");
    expect(result.productionReady).toBe(false);
  });

  it("bloquea además si faltan los activos generales Service", () => {
    const result = evaluateServiceVerticalClosure({ memoryAvailable: false, pptAvailable: false, pcapEditablePromoted: false });
    expect(result.memoryAndPptLayerReady).toBe(false);
    expect(result.blockers.join(" ")).toContain("Memoria general Service");
    expect(result.blockers.join(" ")).toContain("PPT general Service");
    expect(result.nextRequiredEvidence.length).toBeGreaterThan(0);
  });

  it("solo cierra cuando las tres capas físicas están acreditadas", () => {
    const result = evaluateServiceVerticalClosure({ memoryAvailable: true, pptAvailable: true, pcapEditablePromoted: true });
    expect(result.pcapLayerReady).toBe(true);
    expect(result.physicalPackageOperational).toBe(true);
    expect(result.engineeringClosed).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.productionReady).toBe(false);
    expect(result.humanValidationRequired).toBe(true);
  });
});
