import { describe, expect, it } from "vitest";
import { MAINTENANCE_007_REGRESSION_RESULT } from "../src/regression/ServiceRegressionCase007MaintenanceSevilleGuard";

describe("LB-7 service maintenance regression guard 11.9.2", () => {
  const r = MAINTENANCE_007_REGRESSION_RESULT;

  it("protects the maintenance baseline without resolving the source contradiction", () => {
    expect(r.caseId).toBe("REG-SERVICE-007");
    expect(r.step).toBe("11.9.2");
    expect(r.passed).toBe(true);
    expect(r.blockers).toHaveLength(0);
    expect(r.checks).toHaveLength(8);
    expect(r.protectedScope.contractType).toBe("SERVICIO");
    expect(r.protectedScope.procedure).toBe("ABIERTO");
    expect(r.protectedScope.sara).toBe(true);
    expect(r.protectedScope.lots).toBe(true);
    expect(r.protectedScope.lotCount).toBe(4);
    expect(r.protectedScope.lotNames).toHaveLength(4);
    expect(r.protectedScope.cpvs).toHaveLength(6);
    expect(r.protectedScope.gmaoRequiredAsTechnicalMeans).toBe(true);
    expect(r.blockingSourceInconsistency.unresolved).toBe(true);
    expect(r.blockingSourceInconsistency.severity).toBe("BLOCKING_FOR_RULE_FREEZE");
    expect(r.forbiddenInheritance).toContain("MAXIMO_DOS_LOTES_COMO_REGLA_RESUELTA");
    expect(r.forbiddenInheritance).toContain("SIN_LIMITACION_DE_LOTES_COMO_REGLA_RESUELTA");
    expect(r.deliberatelyNotFrozenYet.some((x) => x.includes("PBL"))).toBe(true);
    expect(r.requiresFineExtractionHumanValidation).toBe(true);
  });
});
