import { describe, expect, it } from "vitest";
import type { AdaptiveStoredCase } from "../src/infrastructure/operations/lb7/AdaptiveCaseStore";
import type { EvidenceField } from "../src/domain/expediente/EvidenceField";
import { evaluateLB103ServerValidatedPreflight } from "../src/application/universal/LB103ServerValidatedPreflight";

function validated(key: string, value: unknown): EvidenceField<unknown> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "USER_INPUT", sourceId: `ui:test:${key}` }],
    humanValidationRequired: true,
    humanValidated: true,
    humanValidation: { by: "reviewer-1", at: "2026-09-05T20:00:00.000Z" },
  };
}

function supplyCase(): AdaptiveStoredCase {
  return {
    caseId: "EXP-12345678",
    answers: {
      __lb103: { contractType: "SUPPLY", decisions: {}, phase: "READY_FOR_DOCUMENT_GENERATION" },
    } as any,
    universalEvidence: {
      contractType: validated("contractType", "SUPPLY"),
      object: validated("object", "Suministro de consumibles y materiales"),
      cpvMain: validated("cpvMain", "44510000-8"),
      "lots.divisionIntoLots": validated("lots.divisionIntoLots", true),
      procedure: validated("procedure", "ABIERTO_SIMPLIFICADO_ABREVIADO"),
      "economic.fundingSource": validated("economic.fundingSource", "AUTOFINANCED"),
      "economic.needsBasedContractDa33": validated("economic.needsBasedContractDa33", true),
      baseTenderBudgetCents: validated("baseTenderBudgetCents", 1000000),
      "economic.legalEstimatedValueCents": validated("economic.legalEstimatedValueCents", 1500000),
    },
    createdAt: "2026-09-05T19:00:00.000Z",
    updatedAt: "2026-09-05T20:00:00.000Z",
  };
}

describe("LB103 · snapshot servidor y preflight documental", () => {
  it("construye SHA determinista solo con evidencia humanamente validada", () => {
    const first = evaluateLB103ServerValidatedPreflight(supplyCase());
    const second = evaluateLB103ServerValidatedPreflight(supplyCase());
    expect(first.snapshotReady).toBe(true);
    expect(first.snapshot?.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(first.snapshot?.sha256).toBe(second.snapshot?.sha256);
    expect(first.snapshot?.contractType).toBe("SUPPLY");
    expect(first.snapshot?.procedure).toBe("ABIERTO_SIMPLIFICADO_ABREVIADO");
    expect(first.snapshot?.financing).toBe("AUTOFINANCED");
    expect(first.snapshot?.decisions.every(item => item.validatedBy === "reviewer-1")).toBe(true);
  });

  it("selecciona el PCAP general acreditado sin promover Memoria/PPT de caso", () => {
    const result = evaluateLB103ServerValidatedPreflight(supplyCase());
    const pcap = result.documents.find(item => item.documentType === "PCAP");
    expect(pcap?.status).toBe("GENERAL_EDITABLE_SELECTED");
    expect(pcap?.selectedSourceId).toBe("JDA-SUPPLY-ASA-PCAP-GENERAL-ODT");
    expect(result.packageReady).toBe(false);
    expect(result.productionReady).toBe(false);
    expect(result.blockers.some(item => item.startsWith("MEMORY:"))).toBe(true);
    expect(result.blockers.some(item => item.startsWith("PPT:"))).toBe(true);
  });

  it("bloquea el snapshot si una decisión aplicable carece de validación trazable", () => {
    const original = supplyCase();
    const current = original.universalEvidence!["baseTenderBudgetCents"];
    const value: AdaptiveStoredCase = {
      ...original,
      universalEvidence: {
        ...original.universalEvidence,
        baseTenderBudgetCents: {
          ...current,
          status: "SOURCE_DECLARED",
          humanValidated: false,
          humanValidation: undefined,
        },
      },
    };
    const result = evaluateLB103ServerValidatedPreflight(value);
    expect(result.snapshotReady).toBe(false);
    expect(result.packageReady).toBe(false);
    expect(result.blockers.join(" ")).toContain("baseTenderBudgetCents");
  });
});
