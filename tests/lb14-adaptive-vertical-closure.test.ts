import { describe, expect, it } from "vitest";
import { UniversalAdaptiveAnswerApplier } from "../src/application/intake/lb14/UniversalAdaptiveAnswerApplier";
import { UniversalAdaptiveQuestionEngine } from "../src/application/intake/lb14/UniversalAdaptiveQuestionEngine";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { CriterioAdjudicacion } from "../src/domain/expediente/CriterioAdjudicacion";
import { CriterioSolvencia } from "../src/domain/expediente/CriterioSolvencia";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { EvidenceField } from "../src/domain/expediente/EvidenceField";
import { UniversalLot } from "../src/domain/expediente/UniversalExpedienteDomains";
import { createUniversalExpedienteFromCanonical, evaluateUniversalExpediente, UniversalExpedienteV13 } from "../src/domain/expediente/UniversalExpedienteV13";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return { key, value, status: "HUMAN_VALIDATED", sources: [{ kind: "PRIMARY_DOCUMENT", sourceId: "lb14-vertical" }], humanValidationRequired: true, humanValidated: true };
}

function canonical(type: "SERVICE" | "SUPPLY"): CanonicalExpedienteState {
  return {
    id: `LB14-VERTICAL-${type}`,
    lifecycleState: EstadoExpediente.PUBLICIDAD_VALIDADA,
    blockers: [], warnings: [],
    fields: {
      contractType: validated("contractType", type),
      object: validated("object", type === "SERVICE" ? "Servicio de mantenimiento de instalaciones" : "Suministro sucesivo de material de ferretería"),
      cpvMain: validated("cpvMain", type === "SERVICE" ? "50000000-5" : "44316400-2"),
      lots: validated("lots", ["Lote único"]),
      estimatedValueCents: validated("estimatedValueCents", 12000000),
      baseTenderBudgetCents: validated("baseTenderBudgetCents", 6000000),
      procedure: validated("procedure", "ABIERTO"),
      durationMonths: validated("durationMonths", 12),
      extensionMonths: validated("extensionMonths", 12),
      modificationPercent: validated("modificationPercent", 0),
      awardCriteria: validated("awardCriteria", ["Precio"]),
      solvency: validated("solvency", ["Solvencia económica", "Solvencia técnica"]),
      publicity: validated("publicity", "PLACSP"),
    },
  };
}

function lot(type: "SERVICE" | "SUPPLY"): UniversalLot {
  return {
    id: "LOT-1",
    name: validated("lots.lots[0].name", "Lote único"),
    cpv: validated("lots.lots[0].cpv", type === "SERVICE" ? "50000000-5" : "44316400-2"),
    baseTenderBudgetCents: validated("lots.lots[0].baseTenderBudgetCents", 6000000),
    estimatedValueCents: validated("lots.lots[0].estimatedValueCents", 12000000),
  };
}

function seed(type: "SERVICE" | "SUPPLY"): UniversalExpedienteV13 {
  const u = createUniversalExpedienteFromCanonical(canonical(type));
  u.economic.legalEstimatedValueCents = validated("economic.legalEstimatedValueCents", 12000000);
  u.regulation.deadlines = validated("regulation.deadlines", { procedure: "OPEN" } as any);
  u.lots.divisionIntoLots = validated("lots.divisionIntoLots", false);
  return u;
}

function answerFor(fieldKey: string, type: "SERVICE" | "SUPPLY"): unknown {
  const values: Record<string, unknown> = {
    "economic.maximumApprovedBudgetCents": 6000000,
    "economic.referenceConsumption": "Consumo histórico 2025",
    "economic.projectedConsumption": "Proyección de consumo para 12 meses",
    "economic.vatPercent": 21,
    "economic.budgetApplication": "G/32L/21200/41",
    "economic.annualities": [{ year: 2026, amountCents: 7260000, vatIncluded: true }],
    "economic.fundingSource": "Fondos propios",
    "economic.priceRevisionRegime": "No procede",
    "economic.unitPrices": [],
    "processing.processingType": "ORDINARIA",
    "regulation.harmonizedRegulation": false,
    "processing.urgency": false,
    "processing.emergency": false,
    "regulation.europeanFunding": false,
    "regulation.threshold": 14000000,
    "administrative.contractingAuthority": "Dirección Gerencia",
    "administrative.promotingUnit": "Unidad promotora",
    "administrative.competentBody": "Órgano de contratación",
    "administrative.administrativeFileNumber": `EXP-${type}-001`,
    "administrative.contractManager": "Responsable del contrato",
    "technical.technicalPurpose": type === "SERVICE" ? "Mantener operativas las instalaciones" : "Atender necesidades de material",
    "technical.technicalRequirements": ["Calidad profesional", "Cumplimiento de especificaciones"],
    "technical.executionLocations": ["Sevilla"],
    "technical.subrogationRequired": false,
    "lots.lots": [lot(type)],
    "lots.maxOfferableLots": 1,
    "lots.maxAwardableLots": 1,
    "criteria.awardCriteria": [new CriterioAdjudicacion("Precio", 100, true)],
    "criteria.judgmentCriteriaExist": false,
    "criteria.economicSolvency": [new CriterioSolvencia("Volumen anual de negocios")],
    "criteria.technicalSolvency": [new CriterioSolvencia("Servicios o suministros similares")],
    "guarantees.provisionalGuaranteeRequired": false,
    "guarantees.definitiveGuaranteePercent": 5,
    "guarantees.complementaryGuaranteePercent": 0,
    "execution.specialExecutionConditions": ["Condición especial vinculada al objeto"],
    "execution.specificPenalties": [],
    "execution.subcontractingRegime": "Conforme al PCAP y LCSP",
    "execution.assignmentRegime": "Conforme al PCAP y LCSP",
    "execution.paymentRegime": "Factura tras conformidad",
    "execution.receiptAndAcceptanceRegime": "Acta o conformidad del responsable",
  };
  if (!(fieldKey in values)) throw new Error(`Sin respuesta de prueba para ${fieldKey}`);
  return values[fieldKey];
}

function complete(type: "SERVICE" | "SUPPLY") {
  const planner = new UniversalAdaptiveQuestionEngine();
  const applier = new UniversalAdaptiveAnswerApplier(planner);
  let expediente = seed(type);
  const asked: string[] = [];

  for (let i = 0; i < 80; i += 1) {
    const action = planner.next(expediente);
    if (action.kind === "COMPLETE") return { expediente, asked, action };
    if (action.kind !== "ASK_USER" || !action.fieldKey) throw new Error(`Intervención inesperada ${action.kind}:${action.fieldKey ?? "-"}`);
    asked.push(action.id);
    expediente = applier.apply(expediente, action, answerFor(action.fieldKey, type)).expediente;
  }
  throw new Error("El flujo no alcanzó COMPLETE en 80 pasos");
}

describe("Bloque 14 - cierre vertical adaptativo", () => {
  it("completa un servicio sin preguntas específicas de suministros", () => {
    const result = complete("SERVICE");
    expect(result.action.kind).toBe("COMPLETE");
    expect(result.asked.some(id => id.startsWith("ask:supply-"))).toBe(false);
    expect(result.expediente.technical.subrogationRegime.status).toBe("NOT_APPLICABLE");
    expect(result.expediente.guarantees.provisionalGuaranteePercent.status).toBe("NOT_APPLICABLE");
    expect(evaluateUniversalExpediente(result.expediente).universallyComplete).toBe(true);
  });

  it("completa un suministro preguntando por presupuesto máximo y consumo sin mezclarlo con PBL o VE", () => {
    const result = complete("SUPPLY");
    expect(result.action.kind).toBe("COMPLETE");
    expect(result.asked).toContain("ask:supply-maximum-budget");
    expect(result.asked).toContain("ask:supply-reference-consumption");
    expect(result.asked).toContain("ask:supply-projected-consumption");
    expect(result.expediente.economic.maximumApprovedBudgetCents.value).toBe(6000000);
    expect(result.expediente.economic.legalEstimatedValueCents.value).toBe(12000000);
    expect(evaluateUniversalExpediente(result.expediente).universallyComplete).toBe(true);
  });
});
