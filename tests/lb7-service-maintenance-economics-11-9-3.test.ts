import { strict as assert } from "node:assert";
import { SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_ECONOMICS } from "../src/regression/ServiceRegressionCase007MaintenanceSevilleEconomics";

const e = SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_ECONOMICS;

assert.equal(e.id, "REG-SERVICE-007");
assert.equal(e.step, "11.9.3");
assert.equal(e.currency, "EUR");
assert.equal(e.sourceValuePolicy.declaredValuesAreAuthoritativeEvidence, true);
assert.equal(e.sourceValuePolicy.doNotNormalizeDeclaredRounding, true);
assert.equal(e.sourceValuePolicy.arithmeticChecksAreDiagnosticOnly, true);

assert.equal(e.estimatedValue.modificationArticle204Percent, 20);
assert.equal(e.estimatedValue.extensionMonths, 24);
assert.equal(e.estimatedValue.lots.length, 4);

assert.deepEqual(
  e.estimatedValue.lots.map((lot) => lot.declaredEstimatedValueCents),
  [34_915_294, 22_543_526, 45_112_162, 79_828_134],
);
assert.equal(e.estimatedValue.declaredTotals.tenderAmountExVatCents, 82_908_688);
assert.equal(e.estimatedValue.declaredTotals.modificationCents, 16_581_738);
assert.equal(e.estimatedValue.declaredTotals.extensionCents, 82_908_688);
assert.equal(e.estimatedValue.declaredTotals.estimatedValueCents, 182_399_114);

assert.equal(e.estimatedValue.lots[1].declaredMinusArithmeticCents, 1);
assert.equal(e.estimatedValue.lots[3].declaredMinusArithmeticCents, 1);
assert.equal(e.estimatedValue.diagnostic.sumDeclaredLotEstimatedValuesCents, 182_399_116);
assert.equal(e.estimatedValue.diagnostic.declaredGlobalEstimatedValueCents, 182_399_114);
assert.equal(e.estimatedValue.diagnostic.lotSumMinusDeclaredGlobalCents, 2);
assert.equal(e.estimatedValue.diagnostic.treatment, "PRESERVE_SOURCE_DECLARATIONS_DO_NOT_AUTOCORRECT");

assert.equal(e.annualitiesVatIncluded.rows.length, 12);
assert.equal(e.annualitiesVatIncluded.declaredTotalCents, 100_319_513);
assert.equal(e.annualitiesVatIncluded.budgetApplication, "1439030000 G/32L/21200/41 01");
assert.equal(e.annualitiesVatIncluded.expenditureProcessing, "ORDINARIA");
assert.equal(
  e.annualitiesVatIncluded.rows.reduce((sum, row) => sum + row.amountCents, 0),
  e.annualitiesVatIncluded.declaredTotalCents,
);

assert.ok(e.deliberatelyStillOpen.some((x) => x.includes("criterios de adjudicación")));
assert.ok(e.deliberatelyStillOpen.some((x) => x.includes("juicio de valor")));

console.log("OK lb7-service-maintenance-economics-11-9-3");
