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

  it("mantiene bloqueada la generación física hasta aislar y promover un binario editable Service", () => {
    const result = evaluateServicePhysicalBaseline();
    expect(result.pcap.editableBinaryIsolated).toBe(false);
    expect(result.pcap.generalTemplatePromoted).toBe(false);
    expect(result.physicalPackageReady).toBe(false);
    expect(result.blockers.join(" ")).toContain("binario editable Service aislado");
    expect(result.blockers.join(" ")).toContain("plantilla general");
    expect(result.humanValidationRequired).toBe(true);
  });
});
