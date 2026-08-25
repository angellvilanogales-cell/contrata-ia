import { describe, expect, it } from "vitest";
import { AdaptiveProcurementFlow } from "../src/application/intake/lb7/AdaptiveProcurementFlow";

describe("LB-7 adaptive economic flow regression", () => {
  const commonWebAnswers = {
    needAndPurpose: "Necesito contratar una página web y su mantenimiento para promocionar proyectos EURES.",
    scopeDetail: "Diseño, desarrollo, publicación de contenidos, mantenimiento y soporte.",
    contentResponsibility: "ADMIN_SUPPLIES_CONTRACTOR_ADAPTS" as const,
    technicalContinuity: "SAME_CONTRACTOR_PREFERRED" as const,
    serviceMeansAvailability: "INSUFFICIENT" as const,
    serviceDataHandling: "NONE" as const,
    serviceEconomicPattern: "ONE_OFF_PLUS_RECURRING" as const,
    initialBudgetExVat: 12000,
    initialDurationMonths: 24,
    extensionMonths: [12, 12] as const
  };

  it("advances from initial non-recurring cost to annual recurring cost", () => {
    const flow = new AdaptiveProcurementFlow();
    const decision = flow.analyze({
      ...commonWebAnswers,
      initialOneOffCostExVat: 8000
    });

    expect(decision.nextQuestion?.id).toBe("recurringAnnualCostExVat");
    expect(decision.procedure).toBe("PENDING");
    expect(decision.proposals.join(" ")).not.toContain("procedimiento abierto simplificado abreviado");
  });

  it("calculates VEC only after recurring cost is supplied", () => {
    const flow = new AdaptiveProcurementFlow();
    const decision = flow.analyze({
      ...commonWebAnswers,
      initialOneOffCostExVat: 8000,
      recurringAnnualCostExVat: 2000
    });

    expect(decision.economics.status).toBe("COHERENT");
    expect(decision.economics.estimatedValueExVat).toBe(16000);
    expect(decision.procedure).toBe("OPEN_SIMPLIFIED_ABBREVIATED_CANDIDATE");
    expect(decision.nextQuestion?.id).toBe("requiresNonFormulaQualityAssessment");
  });
});
