import { strict as assert } from "node:assert";
import { SERVICE_REGRESSION_CASE_005_CARL_FINE } from "../src/regression/ServiceRegressionCase005CarlFineExtraction";

const c = SERVICE_REGRESSION_CASE_005_CARL_FINE;

assert.equal(c.id, "REG-SERVICE-005");
assert.equal(c.step, "11.8.2");
assert.equal(c.facts.legalCharacterization, "CONTRATO_MIXTO_SERVICIOS_SUMINISTROS_CON_PRESTACION_PRINCIPAL_SERVICIOS");
assert.equal(c.facts.serviceSharePercent, 90);
assert.equal(c.facts.supplySharePercent, 10);
assert.equal(c.facts.lots, false);
assert.equal(c.facts.initialDurationMonths, 12);
assert.equal(c.facts.extensionMonths, 12);
assert.equal(c.facts.pblExVat, 44170.33);
assert.equal(c.facts.vatAmount, 9275.77);
assert.equal(c.facts.pblIncVat, 53446.10);
assert.equal(c.facts.estimatedValueExVat, 106008.80);
assert.equal(c.facts.plannedModificationPercent, 20);
assert.equal(c.facts.awardCriteriaMode, "MULTIPLES_SOLO_FORMULAS");
assert.equal(c.facts.awardCriteriaTotalPoints, 100);
assert.equal(c.facts.economicOfferPoints, 80);
assert.equal(c.facts.paymentMode, "MENSUALIDADES_NATURALES_VENCIDAS");
assert.equal(c.facts.laborCostReference2025, 24697.91);
assert.equal(c.facts.directCosts + c.facts.indirectCosts, c.facts.pblExVat);
assert.ok(c.sourceBoundaries.deliberatelyPending.some((x) => x.includes("20 puntos restantes")));
assert.ok(c.sourceBoundaries.deliberatelyPending.some((x) => x.includes("DA 33")));
assert.equal(c.humanValidationRequired, true);

console.log("OK lb7-service-carl-fine-extraction-11-8-2");
