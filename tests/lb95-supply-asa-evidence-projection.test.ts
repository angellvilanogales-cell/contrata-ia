import { describe, expect, it } from "vitest";
import type { EvidenceField } from "../src/domain/expediente/EvidenceField";
import type { UniversalEvidenceRecord } from "../src/application/intake/lb52/UniversalEvidenceWorkspace";
import { projectSupplyAsaEvidence } from "../src/application/intake/lb95/SupplyAsaEvidenceProjection";

function validated(key: string, value: unknown): EvidenceField<unknown> {
  return { key, value, status: "HUMAN_VALIDATED", sources: [{ kind: "USER_INPUT", sourceId: "test" }], humanValidationRequired: true, humanValidated: true };
}

function complete(criteria: unknown = [{ nombre: "Precio", ponderacion: 100, evaluableMedianteFormula: true }]): UniversalEvidenceRecord {
  const values: Record<string, unknown> = {
    contractType: "SUPPLY", object: "Suministro de consumibles", cpvMain: "30125100-2", baseTenderBudgetCents: 1000000,
    "economic.legalEstimatedValueCents": 1000000, durationMonths: 12, extensionMonths: 0, procedure: "ABIERTO_SIMPLIFICADO_ABREVIADO",
    "economic.fundingSource": "AUTOFINANCED", "lots.divisionIntoLots": false, "lots.noDivisionJustification": "Prestación homogénea y gestión unitaria justificada.",
    "criteria.awardCriteria": criteria, "criteria.singleCriterionMotivation": "Prestación perfectamente definida.",
    "execution.plannedModificationRegime": { budgetStability: { applicable: false, maximumPercent: 0 }, needsDa33: { applicable: false, maximumPercent: 0, limits: [] }, other: { applicable: false, description: "", maximumPercent: 0, limits: [] } },
    "processing.processingType": "ORDINARIA", "administrative.contractingAuthority": "Servicio Andaluz de Empleo", "administrative.reservedContractDa4": false,
    "technical.executionLocations": ["Sevilla"], "economic.initialVatAmountCents": 210000, "economic.initialPblVatIncludedCents": 1210000,
    "economic.needsBasedContractDa33": false, "economic.budgetCoversEntireContractLife": true,
    "economic.estimatedValueCalculationMethod": "Valor de la prestación sin prórrogas ni opciones.", "economic.priceDeterminationRegime": "Precio a tanto alzado.",
    "economic.priceRevisionRegime": "No procede", "economic.annualityBudgetRows": [{ year: 2026, amountCents: 1210000, budgetApplication: "G/32L/22000/00", vatIncluded: true }],
    "execution.extensionStructure": "Sin prórrogas", "execution.extensionNoticeMonths": 0, "execution.specialExecutionConditions": ["Retirada de embalajes"],
  };
  return { caseId: "REG-SUPPLY-LB95-PROJECTION-001", updatedAt: new Date(0).toISOString(), fields: Object.fromEntries(Object.entries(values).map(([k,v]) => [k, validated(k,v)])) };
}

describe("LB95 Supply ASA evidence projection", () => {
  it("proyecta únicamente evidencia validada y marca solvencia no aplicable por art. 159.6.b", () => {
    const expediente = projectSupplyAsaEvidence(complete());
    expect(expediente.canonical.fields.contractType.value).toBe("SUPPLY");
    expect(expediente.canonical.fields.estimatedValueCents.value).toBe(1000000);
    expect(expediente.canonical.fields.solvency.status).toBe("NOT_APPLICABLE");
    expect(expediente.canonical.fields.solvency.legalBasis).toContain("LCSP art. 159.6.b");
    expect(expediente.criteria.awardCriteria.value?.[0]?.nombre).toBe("Precio");
  });

  it("rechaza criterios planos porque no puede inventar ponderación o fórmula", () => {
    expect(() => projectSupplyAsaEvidence(complete(["Precio 100 puntos"]))).toThrow(/criterio no estructurado/);
  });

  it("rechaza texto libre de modificación distinto del perfil histórico protegido", () => {
    const record = complete();
    record.fields["execution.plannedModificationRegime"] = validated("execution.plannedModificationRegime", "No se prevén modificaciones");
    expect(() => projectSupplyAsaEvidence(record)).toThrow(/perfil estructurado LB95/);
  });
});
