import { describe, expect, it } from "vitest";
import { auditUniversalAdministrativePackage } from "../src/engines/UniversalAdministrativePackageAudit";

const common = {
  contractType: "WORKS",
  object: "Obras de adecuación",
  cpvMain: "45000000-7",
  lots: [],
  durationMonths: 12,
  estimatedValueCents: 100_000_000,
  baseTenderBudgetCents: 100_000_000,
  procedure: "ABIERTO",
};

describe("LB91.17 - auditoría semántica Memoria-PCAP-PPT", () => {
  it("exige identidad de proyecto en obras", () => {
    const result = auditUniversalAdministrativePackage("WORKS", [
      { document: "MEMORY", sourceId: "m", facts: common },
      { document: "PCAP", sourceId: "p", facts: common },
      { document: "PPT", sourceId: "t", facts: { contractType: "WORKS", object: common.object, cpvMain: common.cpvMain, lots: [], durationMonths: 12 } },
    ]);
    expect(result.ready).toBe(false);
    expect(result.missingFacts.some(item => item.factKey === "projectId")).toBe(true);
  });

  it("detecta contradicción física de versión de proyecto", () => {
    const result = auditUniversalAdministrativePackage("WORKS", [
      { document: "MEMORY", sourceId: "m", facts: { ...common, projectId: "P-1", projectVersion: "V2" } },
      { document: "PCAP", sourceId: "p", facts: { ...common, projectId: "P-1", projectVersion: "V2" } },
      { document: "PPT", sourceId: "t", facts: { contractType: "WORKS", object: common.object, cpvMain: common.cpvMain, lots: [], durationMonths: 12, projectId: "P-1", projectVersion: "V1" } },
    ]);
    expect(result.ready).toBe(false);
    expect(result.blockers.some(item => item.includes("projectVersion"))).toBe(true);
  });

  it("exige riesgo y estudio de viabilidad en concesiones", () => {
    const base = { contractType: "CONCESSION", object: "Explotación", cpvMain: "00000000-0", lots: [], durationMonths: 120, estimatedValueCents: 500_000_000, baseTenderBudgetCents: 0, procedure: "ABIERTO", concessionSubtype: "SERVICE_CONCESSION" };
    const result = auditUniversalAdministrativePackage("CONCESSION", [
      { document: "MEMORY", sourceId: "m", facts: base },
      { document: "PCAP", sourceId: "p", facts: base },
      { document: "PPT", sourceId: "t", facts: { contractType: "CONCESSION", object: "Explotación", cpvMain: "00000000-0", lots: [], durationMonths: 120, concessionSubtype: "SERVICE_CONCESSION" } },
    ]);
    expect(result.ready).toBe(false);
    expect(result.missingFacts.some(item => item.factKey === "operationalRiskTransferred")).toBe(true);
    expect(result.missingFacts.some(item => item.factKey === "viabilityStudyId")).toBe(true);
  });

  it("exige prestación principal y estructura en mixtos", () => {
    const base = { contractType: "MIXED", object: "Servicio con suministro accesorio", cpvMain: "90000000-7", lots: [], durationMonths: 24, estimatedValueCents: 10_000_000, baseTenderBudgetCents: 8_000_000, procedure: "ABIERTO" };
    const result = auditUniversalAdministrativePackage("MIXED", [
      { document: "MEMORY", sourceId: "m", facts: base },
      { document: "PCAP", sourceId: "p", facts: base },
      { document: "PPT", sourceId: "t", facts: { contractType: "MIXED", object: base.object, cpvMain: base.cpvMain, lots: [], durationMonths: 24 } },
    ]);
    expect(result.ready).toBe(false);
    expect(result.missingFacts.some(item => item.factKey === "principalContractType")).toBe(true);
  });
});
