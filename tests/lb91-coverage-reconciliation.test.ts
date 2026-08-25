import { describe, expect, it } from "vitest";
import {
  canClaimReconciledUniversalOperationalCoverage,
  getReconciledContractFamilyCoverage,
  getReconciledOperationalGaps,
} from "../src/domain/capabilities/UniversalCoverageReconciliation";
import { buildUniversalContractPlan } from "../src/application/universal/UniversalContractPlan";

function status(type: "SUPPLY" | "SERVICE" | "WORKS" | "CONCESSION" | "MIXED", capability: string) {
  return getReconciledContractFamilyCoverage(type).capabilities.find(item => item.capability === capability)?.status;
}

describe("LB91.20 - reconciliación de cobertura", () => {
  it("promociona solo los módulos realmente implementados", () => {
    expect(status("WORKS", "ECONOMICS")).toBe("AVAILABLE_WITH_HUMAN_VALIDATION");
    expect(status("CONCESSION", "ECONOMICS")).toBe("AVAILABLE_WITH_HUMAN_VALIDATION");
    expect(status("SUPPLY", "EXECUTION")).toBe("AVAILABLE_WITH_HUMAN_VALIDATION");
    expect(status("SERVICE", "CROSS_DOCUMENT_AUDIT")).toBe("AVAILABLE_WITH_HUMAN_VALIDATION");
  });

  it("mantiene bloqueada la generación física de obras y concesiones", () => {
    expect(status("WORKS", "EDITABLE_DOCUMENT_GENERATION")).toBe("NOT_IMPLEMENTED");
    expect(status("CONCESSION", "DOCUMENT_MODEL_SELECTION")).toBe("NOT_IMPLEMENTED");
    expect(buildUniversalContractPlan("WORKS").canReachDocumentGeneration).toBe(false);
    expect(buildUniversalContractPlan("CONCESSION").canReachDocumentGeneration).toBe(false);
  });

  it("no declara cobertura universal mientras existan huecos reales", () => {
    expect(canClaimReconciledUniversalOperationalCoverage()).toBe(false);
    expect(getReconciledOperationalGaps().length).toBeGreaterThan(0);
  });

  it("mantiene concesiones sin caso real como calibración normativa, no documental", () => {
    expect(getReconciledContractFamilyCoverage("CONCESSION").realSourceCoverage).toBe("LEGAL_SOURCE_ONLY");
  });
});
