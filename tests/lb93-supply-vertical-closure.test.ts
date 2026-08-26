import test from "node:test";
import assert from "node:assert/strict";
import { evaluateLB93SupplyVerticalClosure } from "../src/domain/capabilities/LB93SupplyVerticalClosureGate";
import { UNIVERSAL_V1_JOURNEY_UI } from "../src/interfaces/lb55/UniversalV1JourneyUi";
import { SUPPLY_VERTICAL_FIELD_MANIFEST } from "../src/application/intake/lb93/SupplyVerticalFieldManifest";

const completeInput = {
  canonicalEvidenceWorkspaceExtended: true,
  durablePersistenceVerified: true,
  guidedSupplyFieldsExposed: true,
  supplyProgressVisible: true,
  legalBoundaryChecksCovered: true,
  supplyVariantIsolationCovered: true,
  physicalDocumentGatePreserved: true,
  humanValidationPreserved: true,
  fullCiGreen: true,
};

test("LB93: cierre de ingeniería no declara paquete físico ni producción", () => {
  const result = evaluateLB93SupplyVerticalClosure(completeInput);
  assert.equal(result.engineeringClosed, true);
  assert.equal(result.pilotWorkflowViable, true);
  assert.equal(result.fullPhysicalPackageReady, false);
  assert.equal(result.productionReady, false);
  assert.equal(result.humanAcceptanceRequired, true);
});

test("LB93: cualquier debilitamiento del gate físico impide cierre", () => {
  const result = evaluateLB93SupplyVerticalClosure({ ...completeInput, physicalDocumentGatePreserved: false });
  assert.equal(result.engineeringClosed, false);
  assert.ok(result.blockers.some(item => item.includes("gate físico")));
});

test("LB93: interfaz única presenta progreso Supply sin exponer nomenclatura LB al usuario", () => {
  assert.match(UNIVERSAL_V1_JOURNEY_UI, /Progreso del contrato de suministro/);
  assert.match(UNIVERSAL_V1_JOURNEY_UI, /Tramitación y revisión del expediente/);
  assert.doesNotMatch(UNIVERSAL_V1_JOURNEY_UI, /LB93|LB91|LB92/);
});

test("LB93: manifiesto Supply pregunta solo dimensiones que no deben inferirse silenciosamente", () => {
  const paths = SUPPLY_VERTICAL_FIELD_MANIFEST.map(field => field.fieldPath);
  assert.ok(paths.includes("procedure"));
  assert.ok(paths.includes("economic.fundingSource"));
  assert.ok(paths.includes("technical.supplyVariant"));
  assert.ok(paths.includes("criteria.economicSolvency"));
  assert.ok(paths.includes("criteria.technicalSolvency"));
});
