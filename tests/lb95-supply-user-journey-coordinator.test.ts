import { describe, expect, it } from "vitest";
import type { EvidenceField } from "../src/domain/expediente/EvidenceField";
import type { UniversalEvidenceRecord } from "../src/application/intake/lb52/UniversalEvidenceWorkspace";
import { evaluateSupplyUserJourney } from "../src/application/intake/lb95/SupplyUserJourneyCoordinator";

function validated(key: string, value: unknown): EvidenceField<unknown> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "USER_INPUT", sourceId: "test:reviewer" }],
    humanValidationRequired: true,
    humanValidated: true,
    validatedBy: "reviewer",
    diagnostics: [],
  };
}

function record(overrides: Record<string, EvidenceField<unknown>> = {}): UniversalEvidenceRecord {
  const values: Record<string, unknown> = {
    contractType: "SUPPLY",
    need: "Necesidad validada",
    object: "Suministro de material de oficina",
    cpvMain: "30192000-1",
    "administrative.contractingAuthority": "Servicio Andaluz de Empleo",
    "lots.divisionIntoLots": false,
    "lots.noDivisionJustification": "Suministro homogéneo que no admite división útil en este supuesto.",
    baseTenderBudgetCents: 1000000,
    "economic.initialVatAmountCents": 210000,
    "economic.initialPblVatIncludedCents": 1210000,
    "economic.legalEstimatedValueCents": 1000000,
    "economic.priceDeterminationRegime": "Precio a tanto alzado",
    "economic.estimatedValueCalculationMethod": "Sin prórrogas ni modificaciones",
    "economic.fundingSource": "AUTOFINANCED",
    "economic.priceRevisionRegime": "No procede",
    durationMonths: 12,
    extensionMonths: 0,
    procedure: "ABIERTO_SIMPLIFICADO_ABREVIADO",
    "criteria.awardCriteria": "Precio 100 puntos",
    "criteria.singleCriterionMotivation": "Prestación perfectamente definida",
    "technical.supplyVariant": "ORDINARY_GLOBAL_PRICE",
    "technical.technicalRequirements": "Bienes nuevos y conformes",
    "technical.executionLocations": ["Sevilla"],
    "execution.extensionStructure": "Sin prórrogas",
    "execution.extensionNoticeMonths": 0,
    "execution.specialExecutionConditions": "Gestión de residuos de embalaje",
    "execution.receiptAndAcceptanceRegime": "Recepción tras comprobación de conformidad",
    "execution.plannedModificationRegime": "No se prevén modificaciones",
  };
  const fields = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, validated(key, value)]));
  return { caseId: "REG-SUPPLY-LB95-001", fields: { ...fields, ...overrides }, updatedAt: new Date(0).toISOString() };
}

describe("LB95 Supply user journey", () => {
  it("lleva un ASA Supply completamente validado hasta documentos cuando el paquete físico está disponible", () => {
    const journey = evaluateSupplyUserJourney(record(), true);
    expect(journey.readyForFinalReview).toBe(true);
    expect(journey.readyForDocuments).toBe(true);
    expect(journey.progressPercent).toBe(100);
    expect(journey.stages.find(stage => stage.id === "PROCEDURE")?.applicablePaths).not.toContain("criteria.economicSolvency");
  });

  it("solo exige justificación de no división cuando no hay lotes", () => {
    const withLots = record({
      "lots.divisionIntoLots": validated("lots.divisionIntoLots", true),
      "lots.lots": validated("lots.lots", [{ id: "1", title: "Lote 1" }]),
    });
    const journey = evaluateSupplyUserJourney(withLots, true);
    const identification = journey.stages.find(stage => stage.id === "IDENTIFICATION");
    expect(identification?.applicablePaths).toContain("lots.lots");
    expect(identification?.applicablePaths).not.toContain("lots.noDivisionJustification");
  });

  it("bloquea el recorrido ante un conflicto de fuente y no lo resuelve automáticamente", () => {
    const conflict = validated("object", null);
    conflict.status = "SOURCE_CONFLICT";
    conflict.humanValidated = false;
    conflict.conflict = { statements: ["Fuente A", "Fuente B"], treatment: "DO_NOT_AUTO_RESOLVE" };
    const journey = evaluateSupplyUserJourney(record({ object: conflict }), true);
    expect(journey.readyForFinalReview).toBe(false);
    expect(journey.readyForDocuments).toBe(false);
    expect(journey.stages.find(stage => stage.id === "IDENTIFICATION")?.status).toBe("BLOCKED");
  });

  it("no declara listo para documentos si las plantillas físicas no están acreditadas", () => {
    const journey = evaluateSupplyUserJourney(record(), false);
    expect(journey.readyForFinalReview).toBe(true);
    expect(journey.readyForDocuments).toBe(false);
    expect(journey.stages.find(stage => stage.id === "DOCUMENTS")?.blockers).toContain("El paquete físico compatible no está disponible o acreditado.");
  });
});
