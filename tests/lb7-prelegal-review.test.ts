import { describe, expect, it } from "vitest";
import { PreLegalReview } from "../src/application/legal-review/lb7/PreLegalReview";

describe("LB-7 preventive legal review", () => {
  const reviewer = new PreLegalReview();

  it("detects the three substantive risk signatures seen in LEGAL-REAL-001", () => {
    const result = reviewer.review({
      contractType: "SUPPLIES",
      usesOfficialRecommendedPcapModel: true,
      needsBasedUnderDa33: true,
      extensionMonths: 24,
      extensionAddsBudget: true,
      estimatedValueIncludesExtensionBudgetAgain: true,
      singleAwardCriterion: true,
      deliveryTimeVariable: false,
      plannedModification: true,
      modificationAllowsNewUnpricedItems: true,
      catalogueOpenEnded: true
    });

    expect(result.findings.map(finding => finding.riskId)).toEqual(expect.arrayContaining([
      "PRELEGAL-DA33-BUDGET-EXTENSION-001",
      "PRELEGAL-SINGLE-CRITERION-001",
      "PRELEGAL-UNPRICED-MODIFICATION-001"
    ]));
    expect(result.findings.every(finding => finding.originCaseId === "LEGAL-REAL-001")).toBe(true);
  });

  it("marks every finding as a review alert, never as a legal opinion", () => {
    const result = reviewer.review({
      contractType: "SUPPLIES",
      needsBasedUnderDa33: true,
      extensionAddsBudget: true,
      singleAwardCriterion: true,
      plannedModification: true,
      modificationAllowsNewUnpricedItems: true
    });
    expect(result.canBeTreatedAsLegalOpinion).toBe(false);
    expect(result.rulePromotionAllowed).toBe(false);
    expect(result.findings.every(finding => finding.legalStatus === "REQUIRES_CURRENT_LAW_VERIFICATION")).toBe(true);
    expect(result.findings.every(finding => finding.requiresHumanValidation)).toBe(true);
  });

  it("flags a non-official PCAP model only when the expediente explicitly says so", () => {
    expect(reviewer.review({ contractType: "SERVICES" }).findings.some(finding => finding.topic === "OFFICIAL_PCAP_MODEL")).toBe(false);
    expect(reviewer.review({ contractType: "SERVICES", usesOfficialRecommendedPcapModel: false }).findings.some(finding => finding.topic === "OFFICIAL_PCAP_MODEL")).toBe(true);
  });

  it("does not reproduce the LEGAL-REAL-001 alerts after the validated corrections", () => {
    const result = reviewer.review({
      contractType: "SUPPLIES",
      usesOfficialRecommendedPcapModel: true,
      needsBasedUnderDa33: true,
      extensionMonths: 24,
      extensionAddsBudget: false,
      estimatedValueIncludesExtensionBudgetAgain: false,
      singleAwardCriterion: false,
      plannedModification: true,
      modificationAllowsNewUnpricedItems: false,
      catalogueOpenEnded: false
    });
    expect(result.findings).toHaveLength(0);
  });
});
