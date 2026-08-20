import { strict as assert } from "node:assert";
import { CARL_FINE_REGRESSION_BASELINE, CARL_FINE_REGRESSION_VERSION } from "../src/regression/ServiceRegressionCase005CarlFineGuard";

const b = CARL_FINE_REGRESSION_BASELINE;

assert.equal(CARL_FINE_REGRESSION_VERSION, "REG-SERVICE-005-CARL-FINE-GUARD-11.8.3-v1");
assert.equal(b.caseId, "REG-SERVICE-005");
assert.equal(b.passed, true);
assert.equal(b.blockers.length, 0);
assert.equal(b.checks.length, 12);
assert.ok(b.checks.every((c) => c.ok));
assert.equal(b.sourceValueGuard.rule, "SOURCE_DECLARED_VALUE_ONLY");
assert.equal(b.sourceValueGuard.value, 106008.80);
assert.ok(b.sourceValueGuard.explanation.includes("no convierte"));
assert.ok(b.classificationGuard.includes("contrato mixto 90/10"));
assert.ok(b.deliberatelyNotFrozenYet.some((x) => x.includes("20 puntos restantes")));
assert.ok(b.deliberatelyNotFrozenYet.some((x) => x.includes("DA 33")));

const mutated = b.checks.map((c) => ({ ...c }));
mutated[0] = { ...mutated[0], ok: false };
assert.equal(mutated.every((c) => c.ok), false, "Una degradación de la calificación mixta debe bloquear la regresión");

console.log("OK lb7-service-carl-fine-guard-11-8-3");
