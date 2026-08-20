import { strict as assert } from "node:assert";
import { SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_FINE } from "../src/regression/ServiceRegressionCase007MaintenanceSevilleFineExtraction";

const c = SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_FINE;

assert.equal(c.id, "REG-SERVICE-007");
assert.equal(c.step, "11.9.1");
assert.equal(c.confirmed.contractType, "SERVICIO");
assert.equal(c.confirmed.procedure, "ABIERTO");
assert.equal(c.confirmed.sara, true);
assert.equal(c.confirmed.lotCount, 4);
assert.equal(c.confirmed.lotNames.length, 4);
assert.equal(c.confirmed.cpvs.length, 6);
assert.equal(c.confirmed.insufficientOwnMeansJustified, true);
assert.equal(c.confirmed.gmaoRequiredAsTechnicalMeans, true);
assert.equal(c.blockedBySourceInconsistency.field, "MAX_LOTS_PER_TENDERER");
assert.equal(c.blockedBySourceInconsistency.severity, "BLOCKING_FOR_FREEZE");
assert.match(c.blockedBySourceInconsistency.statementA, /No existe limitación/);
assert.match(c.blockedBySourceInconsistency.statementB, /Dos lotes/);
assert.equal(c.evidencePolicy.contradictionCannotBeResolvedByPrevalenceHeuristic, true);
assert.equal(c.evidencePolicy.pendingFieldsCannotBeInheritedFromCarl, true);
assert.equal(c.evidencePolicy.pendingFieldsCannotBeInheritedFromSupplyCases, true);
assert.ok(c.pendingPrimaryEvidence.some((x) => x.includes("PBL")));
assert.ok(c.pendingPrimaryEvidence.some((x) => x.includes("DA 33")));
assert.ok(c.pendingPrimaryEvidence.some((x) => x.includes("subrogación")));
assert.equal(c.evidencePolicy.humanValidationRequired, true);

console.log("OK lb7-service-maintenance-fine-extraction-11-9-1");
