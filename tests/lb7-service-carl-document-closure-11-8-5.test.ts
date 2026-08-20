import { strict as assert } from "node:assert";
import { CARL_DOCUMENT_CLOSURE_11_8_5, CARL_DOCUMENT_CLOSURE_ITEMS } from "../src/regression/ServiceRegressionCase005CarlDocumentClosure";

const c = CARL_DOCUMENT_CLOSURE_11_8_5;

assert.equal(c.id, "REG-SERVICE-005");
assert.equal(c.step, "11.8.5");
assert.equal(c.status, "DOCUMENTARY_CLOSURE_WITH_OPEN_ITEMS");
assert.equal(c.humanValidationRequired, true);
assert.ok(c.counts.CONFIRMED > 0);
assert.ok(c.counts.CONFIRMED_PARTIAL > 0);
assert.ok(c.counts.PENDING_SOURCE_EVIDENCE > 0);
assert.ok(c.counts.NOT_APPLICABLE > 0);
assert.equal(
  Object.values(c.counts).reduce((sum, value) => sum + value, 0),
  CARL_DOCUMENT_CLOSURE_ITEMS.length,
);
assert.equal(CARL_DOCUMENT_CLOSURE_ITEMS.find((x) => x.id === "CARL-CLOSE-DA33")?.status, "PENDING_SOURCE_EVIDENCE");
assert.equal(CARL_DOCUMENT_CLOSURE_ITEMS.find((x) => x.id === "CARL-CLOSE-JUDGEMENT")?.status, "NOT_APPLICABLE");
assert.equal(CARL_DOCUMENT_CLOSURE_ITEMS.find((x) => x.id === "CARL-CLOSE-VE")?.status, "CONFIRMED");
assert.ok(CARL_DOCUMENT_CLOSURE_ITEMS.find((x) => x.id === "CARL-CLOSE-VE")?.evidence.includes("no se generaliza"));
assert.match(c.closureRule, /PENDING_SOURCE_EVIDENCE/);
assert.match(c.promotionRule, /fuente primaria/i);

console.log("OK lb7-service-carl-document-closure-11-8-5");
