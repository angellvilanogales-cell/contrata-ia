import { describe, expect, it } from "vitest";
import { UNIVERSAL_V1_UI_FIELD_MANIFEST, evaluateUniversalV1UiFieldManifest } from "../src/application/intake/lb51/UniversalV1UiFieldManifest";

describe("LB51 - manifiesto UI universal V1", () => {
  it("incluye las semánticas exactas que el caso real obligó a separar", () => {
    const paths = UNIVERSAL_V1_UI_FIELD_MANIFEST.map(item => item.fieldPath);
    expect(paths).toEqual(expect.arrayContaining([
      "lots.noDivisionJustification",
      "economic.initialVatAmountCents",
      "economic.initialPblVatIncludedCents",
      "economic.needsBasedContractDa33",
      "economic.budgetCoversEntireContractLife",
      "economic.estimatedValueCalculationMethod",
      "economic.priceDeterminationRegime",
      "execution.extensionStructure",
      "execution.extensionNoticeMonths",
      "execution.plannedModificationRegime",
      "criteria.singleCriterionMotivation",
    ]));
  });

  it("no contiene paths duplicados", () => {
    expect(evaluateUniversalV1UiFieldManifest().duplicatePaths).toEqual([]);
  });

  it("exige revisión humana para los campos necesarios del caso supply ASA validado", () => {
    expect(evaluateUniversalV1UiFieldManifest().allRequiredFieldsHumanReviewable).toBe(true);
  });

  it("no confunde manifiesto definido con UI productiva", () => {
    const result = evaluateUniversalV1UiFieldManifest();
    expect(result.uiReadyForUniversalProduction).toBe(false);
    expect(result.blockers.join(" ")).toMatch(/persistencia universal/i);
    expect(result.blockers.join(" ")).toMatch(/conflictos/i);
  });
});
