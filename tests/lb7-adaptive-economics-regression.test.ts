import { describe, expect, it } from "vitest";
import { AdaptiveProcurementFlow } from "../src/application/intake/lb7/AdaptiveProcurementFlow";

describe("LB-7 adaptive economic flow regression", () => {
  it("advances from initial non-recurring cost to annual recurring cost", () => {
    const flow = new AdaptiveProcurementFlow();
    const decision = flow.analyze({
      needAndPurpose: "Necesito contratar una página web y su mantenimiento para promocionar proyectos EURES.",
      scopeDetail: "Diseño, desarrollo, publicación de contenidos, mantenimiento y soporte.",
      contentResponsibility: "ADMIN_SUPPLIES_CONTRACTOR_ADAPTS",
      technicalContinuity: "SAME_CONTRACTOR_PREFERRED",
      dominantComponent: "INITIAL_DEVELOPMENT",
      initialBudgetExVat: 12000,
      initialDurationMonths: 24,
      extensionMonths: [12, 12],
      initialOneOffCostExVat: 8000
    });

    expect(decision.nextQuestion?.id).toBe("recurringAnnualCostExVat");
    expect(decision.procedure).toBe("PENDING");
    expect(decision.proposals.join(" ")).not.toContain("OPEN_SIMPLIFIED_ABBREVIATED_CANDIDATE");
  });

  it("calculates VEC only after recurring cost is supplied", () => {
    const flow = new AdaptiveProcurementFlow();
    const decision = flow.analyze({
      needAndPurpose: "Necesito contratar una página web y su mantenimiento para promocionar proyectos EURES.",
      scopeDetail: "Diseño, desarrollo, publicación de contenidos, mantenimiento y soporte.",
      contentResponsibility: "ADMIN_SUPPLIES_CONTRACTOR_ADAPTS",
      technicalContinuity: "SAME_CONTRACTOR_PREFERRED",
      dominantComponent: "INITIAL_DEVELOPMENT",
      initialBudgetExVat: 12000,
      initialDurationMonths: 24,
      extensionMonths: [12, 12],
      initialOneOffCostExVat: 8000,
      recurringAnnualCostExVat: 2000
    });

    expect(decision.economics.status).toBe("COHERENT");
    expect(decision.economics.estimatedValueExVat).toBe(16000);
    expect(decision.procedure).toBe("OPEN_SIMPLIFIED_ABBREVIATED_CANDIDATE");
    expect(decision.nextQuestion?.id).toBe("requiresNonFormulaQualityAssessment");
  });
});
