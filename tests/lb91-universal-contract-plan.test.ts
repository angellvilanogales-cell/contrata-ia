import { describe, expect, it } from "vitest";
import { buildUniversalContractPlan } from "../src/application/universal/UniversalContractPlan";

describe("LB91.2/20 - planificador universal por familia contractual", () => {
  it("reutiliza motores existentes para suministro y conserva validación humana", () => {
    const plan = buildUniversalContractPlan("SUPPLY");
    const cpv = plan.steps.find(step => step.capability === "CPV");
    const economics = plan.steps.find(step => step.capability === "ECONOMICS");
    expect(cpv?.component).toBe("CPVEngine");
    expect(cpv?.action).toBe("RUN_EXISTING_COMPONENT");
    expect(cpv?.humanValidationRequired).toBe(true);
    expect(economics?.component).toContain("UniversalEconomicEngine");
  });

  it("permite alcanzar generación documental de obras tras LB97 pero mantiene validación humana", () => {
    const plan = buildUniversalContractPlan("WORKS");
    expect(plan.canReachDocumentGeneration).toBe(true);
    expect(plan.steps.some(step => step.action === "BLOCK_UNTIL_IMPLEMENTED")).toBe(false);
    expect(plan.steps.find(step => step.capability === "ECONOMICS")?.coverage).toBe("AVAILABLE_WITH_HUMAN_VALIDATION");
    expect(plan.steps.every(step => step.humanValidationRequired)).toBe(true);
  });

  it("permite plan concesional con fuentes reales y perfiles físicos, sujeto a validación humana", () => {
    const plan = buildUniversalContractPlan("CONCESSION");
    expect(plan.canReachDocumentGeneration).toBe(true);
    expect(plan.steps.find(step => step.capability === "ECONOMICS")?.coverage).toBe("AVAILABLE_WITH_HUMAN_VALIDATION");
    expect(plan.steps.some(step => step.action === "BLOCK_UNTIL_IMPLEMENTED")).toBe(false);
    expect(plan.steps.every(step => step.humanValidationRequired)).toBe(true);
  });

  it("no trata el caso mixto como suma automática de coberturas de servicios y suministros", () => {
    const plan = buildUniversalContractPlan("MIXED");
    expect(plan.canReachDocumentGeneration).toBe(false);
    expect(plan.steps.find(step => step.capability === "OBJECT_AND_NEED")?.coverage).toBe("PARTIAL_SOURCE_BACKED");
  });
});
