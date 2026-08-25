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

  it("bloquea obras mientras falten módulos/modelos esenciales y no inventa generación documental", () => {
    const plan = buildUniversalContractPlan("WORKS");
    expect(plan.blockers.length).toBeGreaterThan(0);
    expect(plan.canReachDocumentGeneration).toBe(false);
    expect(plan.steps.some(step => step.action === "BLOCK_UNTIL_IMPLEMENTED")).toBe(true);
    expect(plan.steps.find(step => step.capability === "ECONOMICS")?.coverage).toBe("AVAILABLE_WITH_HUMAN_VALIDATION");
  });

  it("bloquea concesiones aunque ya exista economía específica mientras falten régimen y modelos documentales", () => {
    const plan = buildUniversalContractPlan("CONCESSION");
    expect(plan.canReachDocumentGeneration).toBe(false);
    expect(plan.steps.find(step => step.capability === "ECONOMICS")?.coverage).toBe("AVAILABLE_WITH_HUMAN_VALIDATION");
    expect(plan.blockers.some(blocker => blocker.includes("CONCESSION"))).toBe(true);
  });

  it("no trata el caso mixto como suma automática de coberturas de servicios y suministros", () => {
    const plan = buildUniversalContractPlan("MIXED");
    expect(plan.canReachDocumentGeneration).toBe(false);
    expect(plan.steps.find(step => step.capability === "OBJECT_AND_NEED")?.coverage).toBe("PARTIAL_SOURCE_BACKED");
  });
});
