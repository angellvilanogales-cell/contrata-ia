import { describe, expect, it } from "vitest";
import { UniversalConcessionExecutionEngine } from "../src/engines/UniversalConcessionExecutionEngine";

const engine = new UniversalConcessionExecutionEngine();
const common = {
  operationalRiskRemainsWithConcessionaire: true,
  economicFinancialPlanIdentified: true,
  tariffOrRemunerationRegimeDefined: true,
  inspectionAndControlPowersDefined: true,
  breachCatalogueDefined: true,
  interventionOrSeizureRegimeAddressed: true,
  economicRebalancingRegimeLimitedToLegalGrounds: true,
  demandForecastRiskExcludedFromAutomaticRebalancing: true,
};

describe("LB91.25 - ejecución específica de concesiones", () => {
  it("protege el riesgo operacional durante la ejecución", () => {
    const result = engine.evaluate({ ...common, subtype: "SERVICE_CONCESSION", operationalRiskRemainsWithConcessionaire: false, reversionRegimeDefined: true, differentiatedAccountingRequired: true });
    expect(result.valid).toBe(false);
    expect(result.blockers.some(item => item.includes("riesgo operacional"))).toBe(true);
  });

  it("exige reversión y contabilidad diferenciada en concesión de servicios", () => {
    const result = engine.evaluate({ ...common, subtype: "SERVICE_CONCESSION", reversionRegimeDefined: false, differentiatedAccountingRequired: false });
    expect(result.valid).toBe(false);
    expect(result.blockers.some(item => item.includes("reversión"))).toBe(true);
  });

  it("controla proyecto y acta de comprobación en la construcción concesional", () => {
    const result = engine.evaluate({ ...common, subtype: "WORKS_CONCESSION", includesConstructionPhase: true, constructionSubjectToApprovedProject: false, completionCheckActDefined: false });
    expect(result.valid).toBe(false);
    expect(result.blockers.length).toBeGreaterThanOrEqual(2);
  });

  it("acepta una estructura concesional completa sin fabricar tarifas ni reequilibrios", () => {
    const result = engine.evaluate({ ...common, subtype: "SERVICE_CONCESSION", reversionRegimeDefined: true, differentiatedAccountingRequired: true });
    expect(result.valid).toBe(true);
    expect(result.humanValidationRequired).toBe(true);
  });
});
