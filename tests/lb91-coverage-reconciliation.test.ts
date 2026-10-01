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

  it("reconoce generación física Works y Concession sin eliminar validación humana", () => {
    expect(status("WORKS", "EDITABLE_DOCUMENT_GENERATION")).toBe("PARTIAL_SOURCE_BACKED");
    expect(status("CONCESSION", "DOCUMENT_MODEL_SELECTION")).toBe("PARTIAL_SOURCE_BACKED");
    expect(buildUniversalContractPlan("WORKS").canReachDocumentGeneration).toBe(true);
    expect(buildUniversalContractPlan("CONCESSION").canReachDocumentGeneration).toBe(true);
  });

  it("no declara cobertura universal mientras existan huecos reales", () => {
    expect(canClaimReconciledUniversalOperationalCoverage()).toBe(false);
    expect(getReconciledOperationalGaps().length).toBeGreaterThan(0);
  });

  it("reconoce casos reales de concesión como autoridad documental no generalizable", () => {
    expect(getReconciledContractFamilyCoverage("CONCESSION").realSourceCoverage).toBe("REAL_SOURCES_AVAILABLE");
  });
});
