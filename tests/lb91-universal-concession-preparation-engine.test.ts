import { describe, expect, it } from "vitest";
import { UniversalConcessionPreparationEngine } from "../src/engines/UniversalConcessionPreparationEngine";

const engine = new UniversalConcessionPreparationEngine();

describe("LB91.12 - preparación universal de concesiones", () => {
  it("bloquea una concesión sin riesgo operacional acreditado", () => {
    const result = engine.evaluate({
      subtype: "SERVICE_CONCESSION",
      operationalRiskTransferred: "UNKNOWN",
      viabilityStudyApproved: true,
      viabilityStudyKind: "FULL",
      durationYears: 4,
    });
    expect(result.operationalRiskReady).toBe(false);
    expect(result.preparationReady).toBe(false);
  });

  it("exige justificar recuperación cuando la duración supera cinco años", () => {
    const result = engine.evaluate({
      subtype: "SERVICE_CONCESSION",
      operationalRiskTransferred: true,
      demandRiskTransferred: true,
      viabilityStudyApproved: true,
      viabilityStudyKind: "ECONOMIC_FINANCIAL",
      durationYears: 12,
    });
    expect(result.blockers.some(item => item.includes("cinco años"))).toBe(true);
  });

  it("exige preparación de obra en concesión de obras", () => {
    const result = engine.evaluate({
      subtype: "WORKS_CONCESSION",
      operationalRiskTransferred: true,
      supplyRiskTransferred: true,
      viabilityStudyApproved: true,
      viabilityStudyKind: "FULL",
      durationYears: 5,
      includesWorks: true,
    });
    expect(result.preparationReady).toBe(false);
    expect(result.blockers.some(item => item.includes("anteproyecto"))).toBe(true);
  });

  it("admite estructura completa sin autocertificar la validación humana", () => {
    const result = engine.evaluate({
      subtype: "SERVICE_CONCESSION",
      operationalRiskTransferred: true,
      demandRiskTransferred: true,
      viabilityStudyApproved: true,
      viabilityStudyKind: "FULL",
      durationYears: 4,
      publicServiceLegalRegimeEstablished: true,
      serviceReservedToAdministration: false,
    });
    expect(result.preparationReady).toBe(true);
    expect(result.humanValidationRequired).toBe(true);
  });
});
