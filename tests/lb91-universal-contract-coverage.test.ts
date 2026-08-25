import { describe, expect, it } from "vitest";
import {
  UNIVERSAL_CONTRACT_COVERAGE,
  canClaimUniversalOperationalCoverage,
  getContractFamilyCoverage,
  getOperationalCoverageGaps,
} from "../src/domain/capabilities/UniversalContractCoverage";
import { DocumentType } from "../src/domain/documentModel/DocumentType";

describe("LB91.1 - matriz universal de cobertura contractual", () => {
  it("registra las cinco familias contractuales objetivo sin afirmar cobertura universal", () => {
    expect(UNIVERSAL_CONTRACT_COVERAGE.map(item => item.contractType)).toEqual([
      "SUPPLY",
      "SERVICE",
      "WORKS",
      "CONCESSION",
      "MIXED",
    ]);
    expect(canClaimUniversalOperationalCoverage()).toBe(false);
    expect(getOperationalCoverageGaps().length).toBeGreaterThan(0);
  });

  it("conserva el informe de insuficiencia de medios como documento propio de servicios", () => {
    const service = getContractFamilyCoverage("SERVICE");
    const supply = getContractFamilyCoverage("SUPPLY");
    expect(service.requiredDocuments).toContain(DocumentType.MEANS_INSUFFICIENCY_REPORT);
    expect(supply.requiredDocuments).not.toContain(DocumentType.MEANS_INSUFFICIENCY_REPORT);
  });

  it("reconoce fuente real de obras sin convertirla en cobertura operativa completa", () => {
    const works = getContractFamilyCoverage("WORKS");
    expect(works.realSourceCoverage).toBe("REAL_SOURCES_AVAILABLE");
    expect(works.capabilities.some(item => item.evidence.includes("PCAP OBRAS ABIERTO real"))).toBe(true);
    expect(getOperationalCoverageGaps("WORKS").length).toBeGreaterThan(0);
  });

  it("mantiene concesiones en cobertura normativa hasta localizar un expediente real verificable", () => {
    const concession = getContractFamilyCoverage("CONCESSION");
    expect(concession.realSourceCoverage).toBe("LEGAL_SOURCE_ONLY");
    expect(getOperationalCoverageGaps("CONCESSION").length).toBeGreaterThan(0);
  });

  it("mantiene el caso mixto como evidencia parcial y no hereda cobertura completa de servicios o suministros", () => {
    const mixed = getContractFamilyCoverage("MIXED");
    expect(mixed.realSourceCoverage).toBe("REAL_SOURCES_AVAILABLE");
    expect(mixed.capabilities.some(item => item.status === "NOT_IMPLEMENTED")).toBe(true);
    expect(getOperationalCoverageGaps("MIXED").length).toBeGreaterThan(0);
  });
});
