import { describe, expect, it } from "vitest";
import { SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE } from "../src/regression/ServiceRegressionCase007MaintenanceSeville";

describe("LB-7 service maintenance Seville regression 11.9", () => {
  const c = SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE;

  it("preserves the extracted maintenance-service scope and blocks the contradictory lot limit", () => {
    expect(c.id).toBe("REG-SERVICE-007");
    expect(c.step).toBe("11.9");
    expect(c.expediente).toBe("CONTR 2026 38892");
    expect(c.facts.contractType).toBe("SERVICIO");
    expect(c.facts.procedure).toBe("ABIERTO");
    expect(c.facts.sara).toBe(true);
    expect(c.facts.lots).toBe(true);
    expect(c.facts.lotCount).toBe(4);
    expect(c.facts.gmaoRequiredAsTechnicalMeans).toBe(true);
    expect(c.facts.insufficientOwnMeansJustified).toBe(true);
    expect(c.sourceInconsistencies).toHaveLength(1);
    expect(c.sourceInconsistencies[0].severity).toBe("BLOCKING_FOR_FREEZE");
    expect(c.sourceInconsistencies[0].statementA).toContain("No existe limitación");
    expect(c.sourceInconsistencies[0].statementB).toContain("Dos lotes");
    expect(c.deliberatelyNotFrozenYet).toContain("regla definitiva sobre máximo de lotes ofertables por licitador");
    expect(c.humanValidationRequired).toBe(true);
  });
});
