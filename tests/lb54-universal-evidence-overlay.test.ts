import { describe, expect, it } from "vitest";
import type { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import type { EvidenceField } from "../src/domain/expediente/EvidenceField";
import { createUniversalExpedienteFromCanonical } from "../src/domain/expediente/UniversalExpedienteV13";
import { declareUniversalUiEvidence, validateUniversalUiEvidence } from "../src/application/intake/lb53/UniversalUiEvidenceDraft";
import { applyUniversalEvidenceOverlay } from "../src/application/intake/lb54/UniversalEvidenceOverlay";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return { key, value, status: "HUMAN_VALIDATED", sources: [{ kind: "PRIMARY_DOCUMENT", sourceId: "base" }], humanValidationRequired: true, humanValidated: true };
}

function canonical(): CanonicalExpedienteState {
  return {
    id: "EXP-LB54-001", lifecycleState: EstadoExpediente.PUBLICIDAD_VALIDADA, blockers: [], warnings: [],
    fields: {
      contractType: validated("contractType", "SUPPLY"), object: validated("object", "Objeto inicial"), cpvMain: validated("cpvMain", "00000000-0"), lots: validated("lots", ["Lote único"]),
      estimatedValueCents: validated("estimatedValueCents", 100), baseTenderBudgetCents: validated("baseTenderBudgetCents", 100), procedure: validated("procedure", "ASA"), durationMonths: validated("durationMonths", 12), extensionMonths: validated("extensionMonths", 0), modificationPercent: validated("modificationPercent", 0), awardCriteria: validated("awardCriteria", ["Precio"]), solvency: validated("solvency", []),
    },
  };
}

describe("LB54 - overlay de evidencia UI sobre expediente universal", () => {
  it("aplica únicamente evidencia promocionable y conserva su estado HUMAN_VALIDATED", () => {
    const base = createUniversalExpedienteFromCanonical(canonical());
    const pbl = validateUniversalUiEvidence(declareUniversalUiEvidence({ fieldPath: "baseTenderBudgetCents", value: 1_055_244, sourceId: "pcap:v7" }, "operator"), "reviewer");
    const da33 = validateUniversalUiEvidence(declareUniversalUiEvidence({ fieldPath: "economic.needsBasedContractDa33", value: true, sourceId: "memoria:v14" }, "operator"), "reviewer");
    const result = applyUniversalEvidenceOverlay(base, { baseTenderBudgetCents: pbl, "economic.needsBasedContractDa33": da33 });
    expect(result.ready).toBe(true);
    expect(result.expediente.canonical.fields.baseTenderBudgetCents.value).toBe(1_055_244);
    expect(result.expediente.economic.needsBasedContractDa33?.value).toBe(true);
    expect(result.expediente.economic.needsBasedContractDa33?.status).toBe("HUMAN_VALIDATED");
  });

  it("no aplica una declaración todavía pendiente de validación humana", () => {
    const base = createUniversalExpedienteFromCanonical(canonical());
    const declared = declareUniversalUiEvidence({ fieldPath: "execution.extensionStructure", value: "Dos prórrogas de 12 meses" }, "operator");
    const result = applyUniversalEvidenceOverlay(base, { "execution.extensionStructure": declared });
    expect(result.ready).toBe(false);
    expect(result.expediente.execution.extensionStructure).toBeUndefined();
    expect(result.blocked.join(" ")).toMatch(/no promocionable/i);
  });

  it("aplica las rutas exactas LB27/LB31-LB34 necesarias para documentación", () => {
    const base = createUniversalExpedienteFromCanonical(canonical());
    const values: Record<string, unknown> = {
      "lots.noDivisionJustification": "Unidad funcional y coordinación",
      "administrative.reservedContractDa4": false,
      "economic.initialVatAmountCents": 221_601,
      "economic.initialPblVatIncludedCents": 1_276_845,
      "economic.maximumApprovedBudgetCents": 1_816_096,
      "economic.estimatedValueCalculationMethod": "Presupuesto máximo más modificación prevista al alza",
      "economic.priceDeterminationRegime": "Precios unitarios",
      "execution.extensionNoticeMonths": 2,
      "execution.plannedModificationRegime": "-20 % estabilidad / +20 % DA 33.ª",
      "criteria.singleCriterionMotivation": "Precio como único criterio por especificación cerrada",
    };
    const evidence: Record<string, EvidenceField<unknown>> = {};
    for (const [fieldPath, value] of Object.entries(values)) evidence[fieldPath] = validateUniversalUiEvidence(declareUniversalUiEvidence({ fieldPath, value }, "operator"), "reviewer");
    const result = applyUniversalEvidenceOverlay(base, evidence);
    expect(result.ready).toBe(true);
    expect(result.applied).toHaveLength(Object.keys(values).length);
    expect(result.expediente.execution.extensionNoticeMonths?.value).toBe(2);
    expect(result.expediente.economic.maximumApprovedBudgetCents.value).toBe(1_816_096);
  });
});
