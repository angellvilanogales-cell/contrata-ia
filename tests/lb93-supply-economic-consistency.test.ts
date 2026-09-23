import { describe, expect, it } from "vitest";
import type { UniversalEvidenceRecord } from "../src/application/intake/lb52/UniversalEvidenceWorkspace";
import { evaluateSupplyEconomicConsistency } from "../src/application/intake/lb93/SupplyEconomicConsistency";

function field(key: string, value: unknown) {
  return { key, value, status: "SOURCE_DECLARED" as const, sources: [], humanValidationRequired: true, humanValidated: false };
}

function record(values: Record<string, unknown>): UniversalEvidenceRecord {
  return { caseId: "REG-SUPPLY-ECON-001", fields: Object.fromEntries(Object.entries(values).map(([k, v]) => [k, field(k, v)])), updatedAt: new Date(0).toISOString() };
}

describe("LB93 SupplyEconomicConsistency", () => {
  it("detecta contradicción aritmética PBL + IVA", () => {
    const result = evaluateSupplyEconomicConsistency(record({ baseTenderBudgetCents: 10000, "economic.initialVatAmountCents": 2100, "economic.initialPblVatIncludedCents": 13000 }));
    expect(result.coherent).toBe(false);
    expect(result.blockers.some(item => item.includes("PBL con IVA"))).toBe(true);
  });

  it("detecta VE inferior al PBL sin corregirlo automáticamente", () => {
    const result = evaluateSupplyEconomicConsistency(record({ baseTenderBudgetCents: 10000, "economic.legalEstimatedValueCents": 9999 }));
    expect(result.coherent).toBe(false);
    expect(result.blockers.some(item => item.includes("valor estimado"))).toBe(true);
  });

  it("DA33 exige presupuesto máximo declarado", () => {
    const result = evaluateSupplyEconomicConsistency(record({ "economic.needsBasedContractDa33": true }));
    expect(result.coherent).toBe(false);
    expect(result.blockers.some(item => item.includes("DA 33"))).toBe(true);
  });

  it("no altera valores coherentes declarados", () => {
    const result = evaluateSupplyEconomicConsistency(record({ baseTenderBudgetCents: 10000, "economic.initialVatAmountCents": 2100, "economic.initialPblVatIncludedCents": 12100, "economic.legalEstimatedValueCents": 15000 }));
    expect(result.coherent).toBe(true);
    expect(result.blockers).toEqual([]);
  });
});
