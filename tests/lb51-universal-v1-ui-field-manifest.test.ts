import { describe, expect, it } from "vitest";
import { UNIVERSAL_V1_UI_FIELD_MANIFEST, evaluateUniversalV1UiFieldManifest } from "../src/application/intake/lb51/UniversalV1UiFieldManifest";

describe("LB51 - manifiesto UI universal V1", () => {
  it("incluye las semánticas exactas que el caso real obligó a separar", () => {
    const paths = UNIVERSAL_V1_UI_FIELD_MANIFEST.map(item => item.fieldPath);
    expect(paths).toEqual(expect.arrayContaining([
      "need",
      "object",
      "cpvMain",
      "cpvMainDescription",
      "cpvAdditional",
      "lots.cpvAssignments",
      "baseTenderBudgetCents",
      "durationMonths",
      "lots.noDivisionJustification",
      "economic.initialVatAmountCents",
      "economic.initialPblVatIncludedCents",
      "economic.needsBasedContractDa33",
      "economic.budgetCoversEntireContractLife",
      "economic.maximumApprovedBudgetCents",
      "economic.initialEstimatedValueBaseCents",
      "economic.extensionAmountExVatCents",
      "economic.modificationAmountExVatCents",
      "economic.optionsAmountExVatCents",
      "economic.otherEstimatedValueComponentsCents",
      "economic.estimatedValueCalculationMethod",
      "economic.priceDeterminationRegime",
      "economic.annualityBudgetRows",
      "economic.unitPrices",
      "execution.extensionStructure",
      "modificationPercent",
      "execution.extensionNoticeMonths",
      "execution.plannedModificationRegime",
      "criteria.judgmentCriteriaExist",
      "criteria.singleCriterionMotivation",
      "criteria.formulaJustification",
      "criteria.abnormallyLowTenderParameters",
      "criteria.tieBreakCriteria",
      "guarantees.provisionalGuaranteeRequired",
      "guarantees.provisionalGuaranteePercent",
      "guarantees.definitiveGuaranteePercent",
      "guarantees.complementaryGuaranteePercent",
    ]));
  });

  it("no contiene paths duplicados ni rutas de dominio inventadas", () => {
    const result = evaluateUniversalV1UiFieldManifest();
    expect(result.duplicatePaths).toEqual([]);
    expect(result.nonCanonicalPaths).toEqual([]);
    expect(UNIVERSAL_V1_UI_FIELD_MANIFEST.some(item => item.fieldPath === "technical.catalogue")).toBe(false);
    expect(UNIVERSAL_V1_UI_FIELD_MANIFEST.some(item => item.fieldPath === "economic.baseTenderBudgetCents")).toBe(false);
    expect(UNIVERSAL_V1_UI_FIELD_MANIFEST.some(item => item.fieldPath === "execution.durationMonths")).toBe(false);
  });

  it("exige revisión humana para los campos necesarios del caso supply ASA validado", () => {
    expect(evaluateUniversalV1UiFieldManifest().allRequiredFieldsHumanReviewable).toBe(true);
  });

  it("no confunde manifiesto definido con UI productiva", () => {
    const result = evaluateUniversalV1UiFieldManifest();
    expect(result.uiReadyForUniversalProduction).toBe(false);
    expect(result.blockers.join(" ")).toMatch(/persistencia/i);
    expect(result.blockers.join(" ")).toMatch(/conflictos/i);
  });
});
