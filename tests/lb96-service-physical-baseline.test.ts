import { describe, expect, it } from "vitest";
import { evaluateServicePhysicalBaseline } from "../src/application/intake/lb96/ServicePhysicalBaseline";

describe("LB96 Service physical baseline", () => {
  it("reconoce corpus real diverso sin confundirlo con plantilla física general", () => {
    const result = evaluateServicePhysicalBaseline();
    expect(result.contractType).toBe("SERVICE");
    expect(result.pcap.structuralEvidenceReady).toBe(true);
    expect(result.technicalCorpusReady).toBe(true);
    expect(result.regressionCases).toContain("REG-SERVICE-005");
    expect(result.regressionCases).toContain("REG-SERVICE-007");
  });

  it("declara lista la terna física tras aislar y promover los binarios editables Service", () => {
    const result = evaluateServicePhysicalBaseline();
    expect(result.pcap.editableBinaryIsolated).toBe(true);
    expect(result.pcap.generalTemplatePromoted).toBe(true);
    expect(result.physicalPackageReady).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.humanValidationRequired).toBe(true);
  });
});
