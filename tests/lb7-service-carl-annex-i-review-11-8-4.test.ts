import { strict as assert } from "node:assert";
import { SERVICE_REGRESSION_CASE_005_CARL_ANNEX_I_CLOSURE } from "../src/regression/ServiceRegressionCase005CarlAnnexIClosure";

const c = SERVICE_REGRESSION_CASE_005_CARL_ANNEX_I_CLOSURE;

assert.equal(c.id, "REG-SERVICE-005");
assert.equal(c.step, "11.8.4");
assert.equal(c.confirmedFromSources.solvencyRequired, true);
assert.equal(c.confirmedFromSources.solvencyLocation, "ANEXO_I_APARTADO_4");
assert.equal(c.confirmedFromSources.economicProposalModelPresent, true);
assert.equal(c.confirmedFromSources.awardCriteriaAllFormulaBased, true);
assert.equal(c.confirmedFromSources.awardCriteriaTotalPoints, 100);
assert.equal(c.confirmedFromSources.economicOfferPoints, 80);
assert.equal(c.confirmedFromSources.plannedModificationPercent, 20);
assert.equal(c.evidencePolicy.noInferenceToFillAnnexI, true);
assert.equal(c.evidencePolicy.sourceTextRequiredForFreeze, true);
assert.equal(c.evidencePolicy.humanValidationRequired, true);
assert.ok(c.unresolvedBecauseExactAnnexITextNotReliablyRecovered.some((x) => x.includes("solvencia económica")));
assert.ok(c.unresolvedBecauseExactAnnexITextNotReliablyRecovered.some((x) => x.includes("garantía definitiva")));
assert.ok(c.unresolvedBecauseExactAnnexITextNotReliablyRecovered.some((x) => x.includes("20 puntos restantes")));
assert.ok(c.unresolvedBecauseExactAnnexITextNotReliablyRecovered.some((x) => x.includes("DA 33")));

console.log("OK lb7-service-carl-annex-i-review-11-8-4");
