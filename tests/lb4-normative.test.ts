import { describe, expect, it } from "vitest";
import { LB4CleaningServiceEngine } from "../src/application/normative/LB4CleaningServiceEngine";

const engine = new LB4CleaningServiceEngine();

function baseInput() {
  return {
    object: "Servicio de limpieza de edificios y oficinas administrativas",
    need: "Mantener las dependencias en condiciones adecuadas de higiene y uso",
    estimatedValue: 120000,
    durationMonths: 24,
    judgmentValuePercent: 20,
    allAwardCriteriaFormulaBased: false,
    lotAssessment: "UNASSESSED" as const,
    subrogationObligation: "UNKNOWN" as const,
    publicBodyTransfersPersonalDataToContractor: false
  };
}

describe("LB-4 cleaning-services normative MVP", () => {
  it("proposes controlled cleaning CPV codes and preserves human validation", () => {
    const result = engine.evaluate(baseInput());
    expect(result.cpv.primary).toBe("90911200-8");
    expect(result.cpv.alternatives).toContain("90919200-4");
    expect(result.overallValidation).toBe("PENDING_HUMAN_VALIDATION");
    expect(result.traces.every(trace => trace.sourceIds.length > 0)).toBe(true);
  });

  it("selects abbreviated simplified procedure only below 60000 with formula-only criteria", () => {
    const result = engine.evaluate({
      ...baseInput(),
      estimatedValue: 50000,
      judgmentValuePercent: 0,
      allAwardCriteriaFormulaBased: true
    });
    expect(result.procedure.procedure).toBe("OPEN_SIMPLIFIED_ABBREVIATED");
    expect(result.procedure.tenderDeadlineDaysMinimum).toBe(10);
    expect(result.procedure.deadlineUnit).toBe("WORKING_DAYS");
    expect(result.guarantees.definitive.required).toBe(false);
  });

  it("selects ordinary simplified procedure below 140000 when judgment criteria stay within 25 percent", () => {
    const result = engine.evaluate(baseInput());
    expect(result.procedure.procedure).toBe("OPEN_SIMPLIFIED");
    expect(result.procedure.sara).toBe(false);
    expect(result.procedure.tenderDeadlineDaysMinimum).toBe(15);
  });

  it("rejects simplified procedure when judgment-value weighting exceeds 25 percent", () => {
    const result = engine.evaluate({ ...baseInput(), judgmentValuePercent: 30 });
    expect(result.procedure.procedure).toBe("OPEN_ORDINARY");
    expect(result.procedure.sara).toBe(false);
  });

  it("marks regional cleaning services SARA from 216000 euros and keeps the 35-day general open deadline", () => {
    const result = engine.evaluate({ ...baseInput(), estimatedValue: 216000 });
    expect(result.procedure.procedure).toBe("OPEN_ORDINARY");
    expect(result.procedure.sara).toBe(true);
    expect(result.procedure.tenderDeadlineDaysMinimum).toBe(35);
  });

  it("does not invent a no-lot justification when factual assessment is absent", () => {
    const result = engine.evaluate(baseInput());
    expect(result.lots.result).toBe("ASSESS_DIVISION");
  });

  it("allows a no-division proposal only when technical coordination is declared and still requires human validation", () => {
    const result = engine.evaluate({ ...baseInput(), lotAssessment: "NO_DIVIDE_TECHNICAL_COORDINATION" });
    expect(result.lots.result).toBe("NO_DIVISION_PROPOSED");
    expect(result.lots.validation).toBe("PENDING_HUMAN_VALIDATION");
  });

  it("calculates the fallback economic solvency basis for contracts longer than one year", () => {
    const result = engine.evaluate(baseInput());
    expect(result.solvency.economic.basis).toBe("AVERAGE_ANNUAL_VALUE");
    expect(result.solvency.economic.calculatedMinimum).toBe(90000);
  });

  it("requires article 130 information when subrogation has been established by the applicable collective rule", () => {
    const result = engine.evaluate({ ...baseInput(), subrogationObligation: "APPLIES" });
    expect(result.subrogation.status).toBe("DISCLOSE_REQUIRED_INFORMATION");
  });

  it("asks for collective-rule verification when subrogation status is unknown", () => {
    const result = engine.evaluate(baseInput());
    expect(result.subrogation.status).toBe("VERIFY_APPLICABLE_COLLECTIVE_RULES");
  });

  it("requires the additional data-protection execution condition when public data are transferred", () => {
    const result = engine.evaluate({ ...baseInput(), publicBodyTransfersPersonalDataToContractor: true });
    expect(result.specialExecutionCondition.dataProtectionConditionRequired).toBe(true);
    expect(result.traces.some(trace => trace.ruleId === "LB4-SVC-DATA-001")).toBe(true);
  });

  it("rejects invalid monetary inputs instead of producing legal-looking output", () => {
    expect(() => engine.evaluate({ ...baseInput(), estimatedValue: 0 })).toThrow();
  });
});
