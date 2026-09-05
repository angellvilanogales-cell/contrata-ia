import { describe, expect, it } from "vitest";
import type { UniversalEvidenceRecord } from "../src/application/intake/lb52/UniversalEvidenceWorkspace";
import { planSupplyQuestions } from "../src/application/intake/lb93/SupplyAdaptiveQuestionPlanner";

function f(key: string, value: unknown) { return { key, value, status: "SOURCE_DECLARED" as const, sources: [], humanValidationRequired: true, humanValidated: false }; }
function record(values: Record<string, unknown>): UniversalEvidenceRecord { return { caseId: "REG-SUPPLY-Q-001", fields: Object.fromEntries(Object.entries(values).map(([k,v]) => [k,f(k,v)])), updatedAt: new Date(0).toISOString() }; }

describe("LB93 SupplyAdaptiveQuestionPlanner", () => {
  it("no infiere procedimiento ni financiación en expediente vacío", () => {
    const plan = planSupplyQuestions(record({}));
    const paths = plan.pendingRequired.map(q => q.fieldPath);
    expect(paths).toContain("procedure");
    expect(paths).toContain("economic.fundingSource");
    expect(paths).toContain("technical.supplyVariant");
  });

  it("ASA abreviado no pregunta solvencia que el art. 159.6.b exime de acreditar", () => {
    const plan = planSupplyQuestions(record({ procedure: "ABIERTO_SIMPLIFICADO_ABREVIADO" }));
    const paths = plan.pendingRequired.map(q => q.fieldPath);
    expect(paths).not.toContain("criteria.economicSolvency");
    expect(paths).not.toContain("criteria.technicalSolvency");
  });

  it("procedimiento abierto mantiene preguntas de solvencia", () => {
    const plan = planSupplyQuestions(record({ procedure: "ABIERTO" }));
    const paths = plan.pendingRequired.map(q => q.fieldPath);
    expect(paths).toContain("criteria.economicSolvency");
    expect(paths).toContain("criteria.technicalSolvency");
  });

  it("catálogo abre solo la pregunta de pedidos sucesivos", () => {
    const plan = planSupplyQuestions(record({ "technical.supplyVariant": "CATALOGUE_NEEDS" }));
    expect(plan.conditionalQuestions.map(q => q.fieldPath)).toEqual(["technical.hasSuccessiveOrders"]);
  });

  it("suministro con plataforma pregunta por componente real de servicio", () => {
    const plan = planSupplyQuestions(record({ "technical.supplyVariant": "SUPPLY_WITH_SERVICE_COMPONENT" }));
    expect(plan.conditionalQuestions.map(q => q.fieldPath)).toEqual(["technical.hasServicePlatformComponent"]);
  });

  it("mobiliario con instalación pregunta por montaje/instalación", () => {
    const plan = planSupplyQuestions(record({ "technical.supplyVariant": "FURNITURE_INSTALLATION" }));
    expect(plan.conditionalQuestions.map(q => q.fieldPath)).toEqual(["technical.hasInstallationOrAssembly"]);
  });
});
