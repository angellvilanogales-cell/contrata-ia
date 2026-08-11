import { describe, expect, it } from "vitest";
import { AdaptiveProcurementFlow } from "../src/application/intake/lb7/AdaptiveProcurementFlow";

describe("LB-7 adaptive procurement flow", () => {
  const flow = new AdaptiveProcurementFlow();

  it("infers a web development service and proposes a single coordinated lot", () => {
    const decision = flow.analyze({
      needAndPurpose: "Necesito una página web para promocionar proyectos de la red EURES.",
      scopeDetail: "Diseño, desarrollo, mantenimiento, actualización de eventos y soporte a usuarios.",
      contentResponsibility: "ADMIN_SUPPLIES_CONTRACTOR_ADAPTS",
      technicalContinuity: "SAME_CONTRACTOR_PREFERRED",
      dominantComponent: "INITIAL_DEVELOPMENT"
    });
    expect(decision.contractNature).toBe("SERVICES");
    expect(decision.lotProposal).toBe("SINGLE_LOT");
    expect(decision.cpv.find(item => item.role === "PRIMARY")?.code).toBe("72413000-8");
    expect(decision.nextQuestion?.id).toBe("initialBudgetExVat");
  });

  it("projects recurrent extensions without duplicating the initial development cost", () => {
    const decision = flow.analyze({
      needAndPurpose: "Página web para la red EURES",
      scopeDetail: "Diseño, desarrollo y mantenimiento",
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
    expect(decision.economics.annualProjection).toEqual([
      { period: "Año 1", amountExVat: 10000 },
      { period: "Año 2", amountExVat: 2000 },
      { period: "Prórroga 1 (12 meses)", amountExVat: 2000 },
      { period: "Prórroga 2 (12 meses)", amountExVat: 2000 }
    ]);
    expect(decision.procedure).toBe("OPEN_SIMPLIFIED_ABBREVIATED_CANDIDATE");
  });

  it("does not force the abbreviated route when non-formula qualitative assessment is needed", () => {
    const decision = flow.analyze({
      needAndPurpose: "Página web institucional",
      scopeDetail: "Diseño y desarrollo web",
      technicalContinuity: "SAME_CONTRACTOR_PREFERRED",
      dominantComponent: "INITIAL_DEVELOPMENT",
      initialBudgetExVat: 12000,
      initialDurationMonths: 24,
      extensionMonths: [],
      initialOneOffCostExVat: 8000,
      recurringAnnualCostExVat: 2000,
      requiresNonFormulaQualityAssessment: true
    });
    expect(decision.procedure).toBe("OPEN_SIMPLIFIED_CANDIDATE");
    expect(decision.awardCriteriaConstraint).toContain("145");
  });

  it("recognizes hardware supplies without reusing the cleaning-service profile", () => {
    const decision = flow.analyze({
      needAndPurpose: "Adquirir útiles y materiales de ferretería para pequeñas reparaciones en edificios del SAE.",
      scopeDetail: "Suministro sucesivo de piezas y artículos de ferretería.",
      technicalContinuity: "SEPARABLE",
      dominantComponent: "GOODS"
    });
    expect(decision.contractNature).toBe("SUPPLIES");
    expect(decision.cpv.find(item => item.role === "PRIMARY")?.code).toBe("44316400-2");
    expect(decision.contractNatureReason).not.toContain("limpieza");
  });
});
