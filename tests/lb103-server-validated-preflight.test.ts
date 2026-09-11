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

  it("liga de forma determinista la selección documental y los SHA físicos al snapshot validado", () => {
    const first = evaluateLB103ServerValidatedPreflight(supplyCase());
    const second = evaluateLB103ServerValidatedPreflight(supplyCase());
    expect(first.documentarySelection?.schemaVersion).toBe("LB103-DOCUMENT-SELECTION-1");
    expect(first.documentarySelection?.snapshotSha256).toBe(first.snapshot?.sha256);
    expect(first.documentarySelection?.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(first.documentarySelection?.sha256).toBe(second.documentarySelection?.sha256);
    expect(first.documentarySelection?.caseId).toBe(first.snapshot?.caseId);
    expect(first.documentarySelection?.procedure).toBe(first.snapshot?.procedure);
    expect(first.documentarySelection?.financing).toBe(first.snapshot?.financing);
    expect(first.documentarySelection?.documents.every(item => item.selectedSourceSha256?.match(/^[a-f0-9]{64}$/))).toBe(true);
    expect(first.productionReady).toBe(false);
  });

  it("selecciona la terna universal Supply ASA acreditada sin promover fuentes de expediente", () => {
    const result = evaluateLB103ServerValidatedPreflight(supplyCase());
    const pcap = result.documents.find(item => item.documentType === "PCAP");
    const memory = result.documents.find(item => item.documentType === "MEMORY");
    const ppt = result.documents.find(item => item.documentType === "PPT");

    expect(memory).toMatchObject({
      status: "GENERAL_EDITABLE_SELECTED",
      selectedSourceId: "contrata-ia:supply:memory:general:LB105-SUPPLY-CANONICAL-ODT-V1",
      selectedSourceSha256: "66742bee04da4703832bc41d36d107035c4acd47122a35e2ccb75f0896aa01e2",
      selectedProvenanceRole: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",
      officialModelClaimed: false,
    });
    expect(pcap).toMatchObject({
      status: "GENERAL_EDITABLE_SELECTED",
      selectedSourceId: "JDA-SUPPLY-ASA-PCAP-GENERAL-ODT",
      selectedSourceSha256: "45e1e6b16ec41d77206d3ef385c70f87c9120bb0ccce4e43d9a24d245812cadc",
      selectedProvenanceRole: "OFFICIAL_MODEL",
      officialModelClaimed: true,
    });
    expect(ppt).toMatchObject({
      status: "GENERAL_EDITABLE_SELECTED",
      selectedSourceId: "contrata-ia:supply:ppt:general:LB105-SUPPLY-CANONICAL-ODT-V1",
      selectedSourceSha256: "37fd7c3cb2f5cf010ffe9982c8d19d2b9b88372a53bd1ad5ba5405f1a11d84c5",
      selectedProvenanceRole: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",
      officialModelClaimed: false,
    });
    expect(result.documents.some(item => item.selectedSourceId?.startsWith("FERRETERIA-"))).toBe(false);
    expect(result.documentarySelection?.documents).toEqual(result.documents);
    expect(result.packageReady).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.humanAcceptanceStillRequired).toBe(true);
    expect(result.productionReady).toBe(false);
  });

  it("bloquea la terna si procedimiento o financiación salen del ámbito acreditado", () => {
    const original = supplyCase();
    const wrongScope: AdaptiveStoredCase = {
      ...original,
      universalEvidence: {
        ...original.universalEvidence,
        procedure: validated("procedure", "ABIERTO_SIMPLIFICADO"),
        "economic.fundingSource": validated("economic.fundingSource", "EU_FUNDS"),
      },
    };
    const result = evaluateLB103ServerValidatedPreflight(wrongScope);
    expect(result.snapshotReady).toBe(true);
    expect(result.packageReady).toBe(false);
    expect(result.documents.every(item => item.status === "BLOCKED")).toBe(true);
    expect(result.documents.every(item => item.selectedSourceId === undefined)).toBe(true);
    expect(result.productionReady).toBe(false);
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
    expect(result.documentarySelection).toBeUndefined();
    expect(result.packageReady).toBe(false);
    expect(result.blockers.join(" ")).toContain("baseTenderBudgetCents");
  });
});
