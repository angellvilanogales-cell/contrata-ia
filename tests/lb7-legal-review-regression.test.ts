import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type LegalCase = {
  id: string;
  status: string;
  legalReport: {
    reference: string;
    observations: Array<{ id: string; topic: string; decision: string; expectedCorrection: string }>;
  };
  humanValidation: { validated: boolean; decision: string };
  expectedCrossDocumentCorrections: string[];
  safety: {
    promoteCaseFindingDirectlyToGeneralRule: boolean;
    requiresCurrentLawVerificationBeforeRulePromotion: boolean;
    requiresHumanValidationForLegalConclusion: boolean;
  };
};

type Registry = { cases: LegalCase[] };

function registry(): Registry {
  const file = path.resolve("knowledge/lb7/legal-review-cases.json");
  return JSON.parse(fs.readFileSync(file, "utf8")) as Registry;
}

describe("LB-7 real legal review regression", () => {
  it("contains the first validated real legal review case", () => {
    const value = registry();
    const legalCase = value.cases.find(item => item.id === "LEGAL-REAL-001");
    expect(legalCase).toBeDefined();
    expect(legalCase?.status).toBe("HUMAN_VALIDATED");
    expect(legalCase?.legalReport.reference).toBe("AJ-SAE 2026/16");
    expect(legalCase?.humanValidation.validated).toBe(true);
    expect(legalCase?.humanValidation.decision).toBe("DICTAMEN_ACCEPTED");
  });

  it("preserves all four legal observations and their accepted outcomes", () => {
    const legalCase = registry().cases.find(item => item.id === "LEGAL-REAL-001")!;
    expect(legalCase.legalReport.observations).toHaveLength(4);
    expect(legalCase.legalReport.observations.map(item => item.topic)).toEqual(expect.arrayContaining([
      "OFFICIAL_PCAP_MODEL",
      "NEEDS_BASED_CONTRACT_BUDGET_AND_EXTENSIONS",
      "SINGLE_AWARD_CRITERION",
      "MODIFICATION_NEW_UNPRICED_ITEMS"
    ]));
    expect(legalCase.legalReport.observations.every(item => item.decision.startsWith("ACCEPT"))).toBe(true);
  });

  it("requires corrections across Memoria, PCAP, PPT and proposal form", () => {
    const corrections = registry().cases.find(item => item.id === "LEGAL-REAL-001")!.expectedCrossDocumentCorrections;
    expect(corrections).toEqual(expect.arrayContaining([
      "MEMORY_ESTIMATED_VALUE_RECALCULATION",
      "MEMORY_AWARD_CRITERIA_PLURALITY",
      "PCAP_ANNEX_I_MODIFICATION_SCOPE",
      "PPT_CATALOGUE_CLOSED_TO_PRICED_ITEMS",
      "PROPOSAL_FORM_INCLUDES_DELIVERY_TIME"
    ]));
  });

  it("does not promote one lawyer report directly into a general normative rule", () => {
    const safety = registry().cases.find(item => item.id === "LEGAL-REAL-001")!.safety;
    expect(safety.promoteCaseFindingDirectlyToGeneralRule).toBe(false);
    expect(safety.requiresCurrentLawVerificationBeforeRulePromotion).toBe(true);
    expect(safety.requiresHumanValidationForLegalConclusion).toBe(true);
  });
});
