import { describe, expect, it } from "vitest";
import { SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_ECONOMICS } from "../src/regression/ServiceRegressionCase007MaintenanceSevilleEconomics";

describe("LB-7 service maintenance economics regression 11.9.3", () => {
  const e = SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_ECONOMICS;

  it("preserves the source-declared estimated values and diagnostic rounding differences", () => {
    expect(e.id).toBe("REG-SERVICE-007");
    expect(e.step).toBe("11.9.3");
    expect(e.currency).toBe("EUR");
    expect(e.sourceValuePolicy.declaredValuesAreAuthoritativeEvidence).toBe(true);
    expect(e.sourceValuePolicy.doNotNormalizeDeclaredRounding).toBe(true);
    expect(e.sourceValuePolicy.arithmeticChecksAreDiagnosticOnly).toBe(true);

    expect(e.estimatedValue.modificationArticle204Percent).toBe(20);
    expect(e.estimatedValue.extensionMonths).toBe(24);
    expect(e.estimatedValue.lots).toHaveLength(4);
    expect(e.estimatedValue.lots.map((lot) => lot.declaredEstimatedValueCents)).toEqual([
      34_915_294,
      22_543_526,
      45_112_162,
      79_828_134,
    ]);
    expect(e.estimatedValue.declaredTotals.tenderAmountExVatCents).toBe(82_908_688);
    expect(e.estimatedValue.declaredTotals.modificationCents).toBe(16_581_738);
    expect(e.estimatedValue.declaredTotals.extensionCents).toBe(82_908_688);
    expect(e.estimatedValue.declaredTotals.estimatedValueCents).toBe(182_399_114);

    expect(e.estimatedValue.lots[1].declaredMinusArithmeticCents).toBe(1);
    expect(e.estimatedValue.lots[3].declaredMinusArithmeticCents).toBe(1);
    expect(e.estimatedValue.diagnostic.sumDeclaredLotEstimatedValuesCents).toBe(182_399_116);
    expect(e.estimatedValue.diagnostic.declaredGlobalEstimatedValueCents).toBe(182_399_114);
    expect(e.estimatedValue.diagnostic.lotSumMinusDeclaredGlobalCents).toBe(2);
    expect(e.estimatedValue.diagnostic.treatment).toBe("PRESERVE_SOURCE_DECLARATIONS_DO_NOT_AUTOCORRECT");
  });

  it("preserves the declared VAT-included annualities and the fields still open for later steps", () => {
    expect(e.annualitiesVatIncluded.rows).toHaveLength(12);
    expect(e.annualitiesVatIncluded.declaredTotalCents).toBe(100_319_513);
    expect(e.annualitiesVatIncluded.budgetApplication).toBe("1439030000 G/32L/21200/41 01");
    expect(e.annualitiesVatIncluded.expenditureProcessing).toBe("ORDINARIA");
    expect(e.annualitiesVatIncluded.rows.reduce((sum, row) => sum + row.amountCents, 0)).toBe(
      e.annualitiesVatIncluded.declaredTotalCents,
    );

    expect(e.deliberatelyStillOpen.some((x) => x.includes("criterios de adjudicación"))).toBe(true);
    expect(e.deliberatelyStillOpen.some((x) => x.includes("juicio de valor"))).toBe(true);
  });
});
