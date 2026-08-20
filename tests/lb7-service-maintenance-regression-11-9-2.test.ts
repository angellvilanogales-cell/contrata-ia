import { strict as assert } from "node:assert";
import { MAINTENANCE_007_REGRESSION_RESULT } from "../src/regression/ServiceRegressionCase007MaintenanceSevilleGuard";

const r = MAINTENANCE_007_REGRESSION_RESULT;

assert.equal(r.caseId, "REG-SERVICE-007");
assert.equal(r.step, "11.9.2");
assert.equal(r.passed, true);
assert.equal(r.blockers.length, 0);
assert.equal(r.checks.length, 8);
assert.equal(r.protectedScope.contractType, "SERVICIO");
assert.equal(r.protectedScope.procedure, "ABIERTO");
assert.equal(r.protectedScope.sara, true);
assert.equal(r.protectedScope.lots, true);
assert.equal(r.protectedScope.lotCount, 4);
assert.equal(r.protectedScope.lotNames.length, 4);
assert.equal(r.protectedScope.cpvs.length, 6);
assert.equal(r.protectedScope.gmaoRequiredAsTechnicalMeans, true);
assert.equal(r.blockingSourceInconsistency.unresolved, true);
assert.equal(r.blockingSourceInconsistency.severity, "BLOCKING_FOR_RULE_FREEZE");
assert.ok(r.forbiddenInheritance.includes("MAXIMO_DOS_LOTES_COMO_REGLA_RESUELTA"));
assert.ok(r.forbiddenInheritance.includes("SIN_LIMITACION_DE_LOTES_COMO_REGLA_RESUELTA"));
assert.ok(r.deliberatelyNotFrozenYet.some((x) => x.includes("PBL")));
assert.equal(r.requiresFineExtractionHumanValidation, true);

console.log("OK lb7-service-maintenance-regression-11-9-2");
