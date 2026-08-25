import { describe, expect, it } from "vitest";
import { SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_FINE } from "../src/regression/ServiceRegressionCase007MaintenanceSevilleFineExtraction";

describe("LB-7 service maintenance fine extraction 11.9.1", () => {
  const c = SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_FINE;

  it("preserves fine evidence and keeps the contradictory lot limit unresolved", () => {
    expect(c.id).toBe("REG-SERVICE-007");
    expect(c.step).toBe("11.9.1");
    expect(c.confirmed.contractType).toBe("SERVICIO");
    expect(c.confirmed.procedure).toBe("ABIERTO");
    expect(c.confirmed.sara).toBe(true);
    expect(c.confirmed.lotCount).toBe(4);
    expect(c.confirmed.lotNames).toHaveLength(4);
    expect(c.confirmed.cpvs).toHaveLength(6);
    expect(c.confirmed.insufficientOwnMeansJustified).toBe(true);
    expect(c.confirmed.gmaoRequiredAsTechnicalMeans).toBe(true);
    expect(c.blockedBySourceInconsistency.field).toBe("MAX_LOTS_PER_TENDERER");
    expect(c.blockedBySourceInconsistency.severity).toBe("BLOCKING_FOR_FREEZE");
    expect(c.blockedBySourceInconsistency.statementA).toMatch(/No existe limitación/);
    expect(c.blockedBySourceInconsistency.statementB).toMatch(/Dos lotes/);
    expect(c.evidencePolicy.contradictionCannotBeResolvedByPrevalenceHeuristic).toBe(true);
    expect(c.evidencePolicy.pendingFieldsCannotBeInheritedFromCarl).toBe(true);
    expect(c.evidencePolicy.pendingFieldsCannotBeInheritedFromSupplyCases).toBe(true);
    expect(c.pendingPrimaryEvidence.some((x) => x.includes("PBL"))).toBe(true);
    expect(c.pendingPrimaryEvidence.some((x) => x.includes("DA 33"))).toBe(true);
    expect(c.pendingPrimaryEvidence.some((x) => x.includes("subrogación"))).toBe(true);
    expect(c.evidencePolicy.humanValidationRequired).toBe(true);
  });
});
