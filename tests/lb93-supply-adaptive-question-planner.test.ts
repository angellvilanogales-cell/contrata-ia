import test from "node:test";
import assert from "node:assert/strict";
import type { UniversalEvidenceRecord } from "../src/application/intake/lb52/UniversalEvidenceWorkspace";
import { planSupplyQuestions } from "../src/application/intake/lb93/SupplyAdaptiveQuestionPlanner";

function f(key: string, value: unknown) { return { key, value, status: "SOURCE_DECLARED" as const, sources: [], humanValidationRequired: true, humanValidated: false }; }
function record(values: Record<string, unknown>): UniversalEvidenceRecord { return { caseId: "REG-SUPPLY-Q-001", fields: Object.fromEntries(Object.entries(values).map(([k,v]) => [k,f(k,v)])), updatedAt: new Date(0).toISOString() }; }

test("LB93: no infiere procedimiento ni financiación en expediente vacío", () => {
  const plan = planSupplyQuestions(record({}));
  const paths = plan.pendingRequired.map(q => q.fieldPath);
  assert.ok(paths.includes("procedure"));
  assert.ok(paths.includes("economic.fundingSource"));
  assert.ok(paths.includes("technical.supplyVariant"));
});

test("LB93: catálogo abre solo la pregunta de pedidos sucesivos", () => {
  const plan = planSupplyQuestions(record({ "technical.supplyVariant": "CATALOGUE_NEEDS" }));
  assert.deepEqual(plan.conditionalQuestions.map(q => q.fieldPath), ["technical.hasSuccessiveOrders"]);
});

test("LB93: suministro con plataforma pregunta por componente real de servicio", () => {
  const plan = planSupplyQuestions(record({ "technical.supplyVariant": "SUPPLY_WITH_SERVICE_COMPONENT" }));
  assert.deepEqual(plan.conditionalQuestions.map(q => q.fieldPath), ["technical.hasServicePlatformComponent"]);
});

test("LB93: mobiliario con instalación pregunta por montaje/instalación", () => {
  const plan = planSupplyQuestions(record({ "technical.supplyVariant": "FURNITURE_INSTALLATION" }));
  assert.deepEqual(plan.conditionalQuestions.map(q => q.fieldPath), ["technical.hasInstallationOrAssembly"]);
});
