import { describe, expect, it } from "vitest";
import { NEW_SUPPLY_VALUES } from "../src/application/universal/LB103SyntheticNewCaseFixture";
import type { EvidenceField } from "../src/domain/expediente/EvidenceField";
import type { AdaptiveStoredCase } from "../src/infrastructure/operations/lb7/AdaptiveCaseStore";
import { evaluateLB103ServerValidatedPreflight } from "../src/application/universal/LB103ServerValidatedPreflight";
import { generateLB103AuthoritativeSupplyPackage } from "../src/application/universal/LB103AuthoritativeSupplyGeneration";

function validated(key: string, value: unknown): EvidenceField<unknown> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "USER_INPUT", sourceId: `ui:test:${key}` }],
    humanValidationRequired: true,
    humanValidated: true,
    humanValidation: { by: "reviewer-1", at: "2026-09-07T09:00:00.000Z" },
  };
}

function supplyCase(phase = "READY_FOR_DOCUMENT_GENERATION"): AdaptiveStoredCase {
  return {
    caseId: "EXP-AUTH12345678",
    answers: {
      __lb103: { contractType: "SUPPLY", decisions: {}, phase },
    } as any,
    universalEvidence: {
      ...Object.fromEntries(Object.entries(NEW_SUPPLY_VALUES).map(([key,value])=>[key,validated(key,value)])),
      "lots.lots": validated("lots.lots", [{id:"1",description:"Lote sintético"}]),
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
    createdAt: "2026-09-07T08:00:00.000Z",
    updatedAt: "2026-09-07T09:00:00.000Z",
  };
}

const fakeStore = { get: async () => null } as any;

function successfulPackage(caseId: string) {
  return {
    ready: true,
    fileName: `Contrata-IA_${caseId}_PCAP-Memoria-PPT.zip`,
    mediaType: "application/zip" as const,
    bytes: Buffer.from("atomic-zip"),
    sha256: "a".repeat(64),
    manifest: {
      caseId,
      profile: "SUPPLY_ASA_AUTOFINANCED_LB95" as const,
      generatedAt: "2026-09-07T09:05:00.000Z",
      documents: [],
      crossDocumentAuditReady: true,
      blockers: [],
      humanAcceptanceRequired: true as const,
    },
    blockers: [],
  };
}

describe("LB103 · generación Supply autoritativa sellada", () => {
  it("invoca una sola vez el generador atómico existente cuando ambos sellos coinciden", async () => {
    const caseValue = supplyCase();
    const preflight = evaluateLB103ServerValidatedPreflight(caseValue);
    let calls = 0;
    const result = await generateLB103AuthoritativeSupplyPackage({
      caseValue,
      presentedSeals: {
        snapshotSha256: preflight.snapshot!.sha256,
        documentarySelectionSha256: preflight.documentarySelection!.sha256,
      },
      templateStore: fakeStore,
      generator: async () => {
        calls += 1;
        return successfulPackage(caseValue.caseId);
      },
    });

    expect(calls).toBe(1);
    expect(result.ready).toBe(true);
    expect(result.package?.ready).toBe(true);
    expect(result.humanAcceptanceStillRequired).toBe(true);
    expect(result.productionReady).toBe(false);
  });

  it("rechaza un snapshot SHA divergente sin ejecutar el generador", async () => {
    const caseValue = supplyCase();
    const preflight = evaluateLB103ServerValidatedPreflight(caseValue);
    let calls = 0;
    const result = await generateLB103AuthoritativeSupplyPackage({
      caseValue,
      presentedSeals: {
        snapshotSha256: "0".repeat(64),
        documentarySelectionSha256: preflight.documentarySelection!.sha256,
      },
      templateStore: fakeStore,
      generator: async () => {
        calls += 1;
        return successfulPackage(caseValue.caseId);
      },
    });

    expect(calls).toBe(0);
    expect(result.ready).toBe(false);
    expect(result.blockers.join(" ")).toContain("snapshot presentado por /adaptive diverge");
    expect(result.productionReady).toBe(false);
  });

  it("rechaza una selección documental SHA divergente sin ejecutar el generador", async () => {
    const caseValue = supplyCase();
    const preflight = evaluateLB103ServerValidatedPreflight(caseValue);
    let calls = 0;
    const result = await generateLB103AuthoritativeSupplyPackage({
      caseValue,
      presentedSeals: {
        snapshotSha256: preflight.snapshot!.sha256,
        documentarySelectionSha256: "f".repeat(64),
      },
      templateStore: fakeStore,
      generator: async () => {
        calls += 1;
        return successfulPackage(caseValue.caseId);
      },
    });

    expect(calls).toBe(0);
    expect(result.ready).toBe(false);
    expect(result.blockers.join(" ")).toContain("selección documental presentada por /adaptive diverge");
  });

  it("rechaza la generación si el estado guiado ya no es READY_FOR_DOCUMENT_GENERATION", async () => {
    const caseValue = supplyCase("GUIDED_DECISIONS");
    const preflight = evaluateLB103ServerValidatedPreflight(caseValue);
    let calls = 0;
    const result = await generateLB103AuthoritativeSupplyPackage({
      caseValue,
      presentedSeals: {
        snapshotSha256: preflight.snapshot!.sha256,
        documentarySelectionSha256: preflight.documentarySelection!.sha256,
      },
      templateStore: fakeStore,
      generator: async () => {
        calls += 1;
        return successfulPackage(caseValue.caseId);
      },
    });

    expect(calls).toBe(0);
    expect(result.ready).toBe(false);
    expect(result.blockers.join(" ")).toContain("READY_FOR_DOCUMENT_GENERATION");
  });

  it("rechaza una terna fuera del ámbito Supply ASA autofinanciado", async () => {
    const original = supplyCase();
    const caseValue: AdaptiveStoredCase = {
      ...original,
      universalEvidence: {
        ...original.universalEvidence,
        procedure: validated("procedure", "ABIERTO_SIMPLIFICADO"),
        "economic.fundingSource": validated("economic.fundingSource", "EU_FUNDS"),
      },
    };
    const preflight = evaluateLB103ServerValidatedPreflight(caseValue);
    let calls = 0;
    const result = await generateLB103AuthoritativeSupplyPackage({
      caseValue,
      presentedSeals: {
        snapshotSha256: preflight.snapshot!.sha256,
        documentarySelectionSha256: preflight.documentarySelection!.sha256,
      },
      templateStore: fakeStore,
      generator: async () => {
        calls += 1;
        return successfulPackage(caseValue.caseId);
      },
    });

    expect(calls).toBe(0);
    expect(preflight.packageReady).toBe(false);
    expect(result.ready).toBe(false);
    expect(result.productionReady).toBe(false);
  });
});
