import test from "node:test";
import assert from "node:assert/strict";
import type { UniversalEvidenceRecord } from "../src/application/intake/lb52/UniversalEvidenceWorkspace";
import { evaluateSupplyEconomicConsistency } from "../src/application/intake/lb93/SupplyEconomicConsistency";

function field(key: string, value: unknown) {
  return { key, value, status: "SOURCE_DECLARED" as const, sources: [], humanValidationRequired: true, humanValidated: false };
}

function record(values: Record<string, unknown>): UniversalEvidenceRecord {
  return { caseId: "REG-SUPPLY-ECON-001", fields: Object.fromEntries(Object.entries(values).map(([k, v]) => [k, field(k, v)])), updatedAt: new Date(0).toISOString() };
}

test("LB93: detecta contradicción aritmética PBL + IVA", () => {
  const result = evaluateSupplyEconomicConsistency(record({ baseTenderBudgetCents: 10000, "economic.initialVatAmountCents": 2100, "economic.initialPblVatIncludedCents": 13000 }));
  assert.equal(result.coherent, false);
  assert.ok(result.blockers.some(item => item.includes("PBL con IVA")));
});

test("LB93: detecta VE inferior al PBL sin corregirlo automáticamente", () => {
  const result = evaluateSupplyEconomicConsistency(record({ baseTenderBudgetCents: 10000, "economic.legalEstimatedValueCents": 9999 }));
  assert.equal(result.coherent, false);
  assert.ok(result.blockers.some(item => item.includes("valor estimado")));
});

test("LB93: DA33 exige presupuesto máximo declarado", () => {
  const result = evaluateSupplyEconomicConsistency(record({ "economic.needsBasedContractDa33": true }));
  assert.equal(result.coherent, false);
  assert.ok(result.blockers.some(item => item.includes("DA 33")));
});

test("LB93: no altera valores coherentes declarados", () => {
  const result = evaluateSupplyEconomicConsistency(record({ baseTenderBudgetCents: 10000, "economic.initialVatAmountCents": 2100, "economic.initialPblVatIncludedCents": 12100, "economic.legalEstimatedValueCents": 15000 }));
  assert.equal(result.coherent, true);
  assert.deepEqual(result.blockers, []);
});
