import test from "node:test";
import assert from "node:assert/strict";
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

test("LB93: expediente Supply vacío permanece pendiente y no productivo", () => {
  const result = evaluateSupplyVertical(record({}));
  assert.equal(result.workflowReadyForHumanReview, false);
  assert.equal(result.physicalPackageReady, false);
  assert.equal(result.productionReady, false);
  assert.ok(result.blockers.some(item => item.includes("SUPPLY")));
});

test("LB93: vertical Supply completo puede quedar listo para revisión sin falsear paquete físico", () => {
  const result = evaluateSupplyVertical(record(completeValues));
  assert.equal(result.workflowReadyForHumanReview, true);
  assert.equal(result.workflowHumanValidated, false);
  assert.equal(result.physicalPackageReady, false);
  assert.equal(result.documents.find(row => row.documentType === "PCAP")?.decision, "RENDER_ALLOWED");
  assert.equal(result.documents.find(row => row.documentType === "MEMORY")?.decision, "BLOCKED");
  assert.equal(result.documents.find(row => row.documentType === "PPT")?.decision, "BLOCKED");
});

test("LB93: validación humana de todos los campos exigidos no equivale a productionReady", () => {
  const result = evaluateSupplyVertical(record(completeValues, true));
  assert.equal(result.workflowHumanValidated, true);
  assert.equal(result.productionReady, false);
  assert.equal(result.humanAcceptanceRequired, true);
});

test("LB93: contrato menor de suministro >= 15.000 euros queda bloqueado", () => {
  const result = evaluateSupplyVertical(record({ ...completeValues, procedure: "CONTRATO_MENOR", "economic.legalEstimatedValueCents": 1_500_000 }));
  assert.ok(result.blockers.some(item => item.includes("15.000")));
  assert.equal(result.workflowReadyForHumanReview, false);
});

test("LB93: ASA abreviado >= 60.000 euros queda bloqueado", () => {
  const result = evaluateSupplyVertical(record({ ...completeValues, "economic.legalEstimatedValueCents": 6_000_000 }));
  assert.ok(result.blockers.some(item => item.includes("60.000")));
});

test("LB93: no división en lotes sin motivación suficiente queda bloqueada", () => {
  const result = evaluateSupplyVertical(record({ ...completeValues, "lots.divisionIntoLots": false, "lots.noDivisionJustification": "No" }));
  assert.ok(result.blockers.some(item => item.includes("99.3")));
});

test("LB93: financiación desconocida nunca habilita plantilla física", () => {
  const result = evaluateSupplyVertical(record({ ...completeValues, "economic.fundingSource": "UNKNOWN" }));
  assert.equal(result.physicalPackageReady, false);
  assert.ok(result.documents.every(row => row.decision === "BLOCKED"));
});

test("LB93: variante catálogo exige pedidos sucesivos y evita herencia silenciosa", () => {
  const result = evaluateSupplyVertical(record({ ...completeValues, "technical.supplyVariant": "CATALOGUE_NEEDS", "technical.hasSuccessiveOrders": false }));
  assert.ok(result.blockers.some(item => item.includes("pedidos/entregas sucesivas")));
});

test("LB93: manifiesto operativo incluye procedimiento, financiación y subfamilia", () => {
  const paths = getSupplyVerticalEditableManifest().map(item => item.fieldPath);
  assert.ok(paths.includes("procedure"));
  assert.ok(paths.includes("economic.fundingSource"));
  assert.ok(paths.includes("technical.supplyVariant"));
});
