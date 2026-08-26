import { describe, expect, it } from "vitest";
import type { UniversalEvidenceRecord } from "../src/application/intake/lb52/UniversalEvidenceWorkspace";
import { evaluateSupplyVertical, getSupplyVerticalEditableManifest } from "../src/application/intake/lb93/SupplyVerticalCoordinator";

function evidence(key: string, value: unknown, validated = false) {
  return {
    key,
    value,
    status: validated ? "HUMAN_VALIDATED" as const : "SOURCE_DECLARED" as const,
    sources: [{ kind: "USER_INPUT" as const, sourceId: "test" }],
    humanValidationRequired: true,
    humanValidated: validated,
    diagnostics: [],
  };
}

function record(values: Record<string, unknown>, validated = false): UniversalEvidenceRecord {
  return {
    caseId: "REG-SUPPLY-LB93-001",
    fields: Object.fromEntries(Object.entries(values).map(([key, value]) => [key, evidence(key, value, validated)])),
    updatedAt: new Date(0).toISOString(),
  };
}

const completeValues = {
  contractType: "SUPPLY",
  object: "Suministro ordinario de equipos para centros administrativos",
  cpvMain: "30200000-1",
  need: "Dotar a los centros de los equipos necesarios para el funcionamiento ordinario.",
  procedure: "ABIERTO_SIMPLIFICADO_ABREVIADO",
  "administrative.contractingAuthority": "Órgano de contratación de prueba",
  baseTenderBudgetCents: 2_000_000,
  "economic.legalEstimatedValueCents": 2_500_000,
  "economic.fundingSource": "AUTOFINANCED",
  durationMonths: 12,
  "technical.supplyVariant": "ORDINARY_GLOBAL_PRICE",
  "technical.technicalRequirements": "Especificaciones técnicas verificables del equipamiento.",
  "technical.executionLocations": ["Sevilla"],
  "criteria.economicSolvency": "Solvencia vinculada y proporcional pendiente de concreción por el órgano gestor.",
  "criteria.technicalSolvency": "Medios de solvencia técnica vinculados al objeto.",
  "execution.specialExecutionConditions": ["Condición especial de ejecución vinculada al contrato."],
  "execution.receiptAndAcceptanceRegime": "Recepción y conformidad por el responsable del contrato.",
  "lots.divisionIntoLots": true,
  "lots.noDivisionJustification": "No aplica al existir división en lotes.",
  "criteria.awardCriteria": [{ nombre: "Precio", ponderacion: 100, evaluableMedianteFormula: true }],
};

describe("LB93 SupplyVerticalCoordinator", () => {
  it("mantiene un expediente vacío pendiente y no productivo", () => {
    const result = evaluateSupplyVertical(record({}));
    expect(result.workflowReadyForHumanReview).toBe(false);
    expect(result.physicalPackageReady).toBe(false);
    expect(result.productionReady).toBe(false);
    expect(result.blockers.some(item => item.includes("SUPPLY"))).toBe(true);
  });

  it("permite revisión jurídica sin falsear paquete físico", () => {
    const result = evaluateSupplyVertical(record(completeValues));
    expect(result.workflowReadyForHumanReview).toBe(true);
    expect(result.workflowHumanValidated).toBe(false);
    expect(result.physicalPackageReady).toBe(false);
    expect(result.documents.find(row => row.documentType === "PCAP")?.decision).toBe("RENDER_ALLOWED");
    expect(result.documents.find(row => row.documentType === "MEMORY")?.decision).toBe("BLOCKED");
    expect(result.documents.find(row => row.documentType === "PPT")?.decision).toBe("BLOCKED");
  });

  it("no equipara validación humana con productionReady", () => {
    const result = evaluateSupplyVertical(record(completeValues, true));
    expect(result.workflowHumanValidated).toBe(true);
    expect(result.productionReady).toBe(false);
    expect(result.humanAcceptanceRequired).toBe(true);
  });

  it("bloquea contrato menor de suministro con VE >= 15.000 euros", () => {
    const result = evaluateSupplyVertical(record({ ...completeValues, procedure: "CONTRATO_MENOR", "economic.legalEstimatedValueCents": 1_500_000 }));
    expect(result.blockers.some(item => item.includes("15.000"))).toBe(true);
    expect(result.workflowReadyForHumanReview).toBe(false);
  });

  it("bloquea ASA abreviado con VE >= 60.000 euros", () => {
    const result = evaluateSupplyVertical(record({ ...completeValues, "economic.legalEstimatedValueCents": 6_000_000 }));
    expect(result.blockers.some(item => item.includes("60.000"))).toBe(true);
  });

  it("bloquea no división en lotes sin motivación suficiente", () => {
    const result = evaluateSupplyVertical(record({ ...completeValues, "lots.divisionIntoLots": false, "lots.noDivisionJustification": "No" }));
    expect(result.blockers.some(item => item.includes("99.3"))).toBe(true);
  });

  it("no selecciona plantillas físicas con financiación desconocida", () => {
    const result = evaluateSupplyVertical(record({ ...completeValues, "economic.fundingSource": "UNKNOWN" }));
    expect(result.physicalPackageReady).toBe(false);
    expect(result.documents.every(row => row.decision === "BLOCKED")).toBe(true);
  });

  it("exige pedidos sucesivos para la variante catálogo", () => {
    const result = evaluateSupplyVertical(record({ ...completeValues, "technical.supplyVariant": "CATALOGUE_NEEDS", "technical.hasSuccessiveOrders": false }));
    expect(result.blockers.some(item => item.includes("pedidos/entregas sucesivas"))).toBe(true);
  });

  it("expone procedimiento, financiación y subfamilia en el manifiesto operativo", () => {
    const paths = getSupplyVerticalEditableManifest().map(item => item.fieldPath);
    expect(paths).toContain("procedure");
    expect(paths).toContain("economic.fundingSource");
    expect(paths).toContain("technical.supplyVariant");
  });
});
