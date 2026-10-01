import { describe, expect, it } from "vitest";
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

describe("LB93 Supply vertical closure", () => {
  it("no declara paquete físico ni producción al cerrar ingeniería", () => {
    const result = evaluateLB93SupplyVerticalClosure(completeInput);
    expect(result.engineeringClosed).toBe(true);
    expect(result.pilotWorkflowViable).toBe(true);
    expect(result.fullPhysicalPackageReady).toBe(false);
    expect(result.productionReady).toBe(false);
    expect(result.humanAcceptanceRequired).toBe(true);
  });

  it("impide cierre si se debilita el gate físico", () => {
    const result = evaluateLB93SupplyVerticalClosure({ ...completeInput, physicalDocumentGatePreserved: false });
    expect(result.engineeringClosed).toBe(false);
    expect(result.blockers.some(item => item.includes("gate físico"))).toBe(true);
  });

  it("presenta progreso Supply sin nomenclatura LB al usuario", () => {
    expect(UNIVERSAL_V1_JOURNEY_UI).toMatch(/Progreso del contrato de suministro/);
    expect(UNIVERSAL_V1_JOURNEY_UI).toMatch(/Tramitación y revisión del expediente/);
    expect(UNIVERSAL_V1_JOURNEY_UI).not.toMatch(/LB93|LB91|LB92/);
  });

  it("pregunta dimensiones que no deben inferirse silenciosamente", () => {
    const paths = SUPPLY_VERTICAL_FIELD_MANIFEST.map(field => field.fieldPath);
    expect(paths).toContain("procedure");
    expect(paths).toContain("economic.fundingSource");
    expect(paths).toContain("technical.supplyVariant");
    expect(paths).toContain("criteria.economicSolvency");
    expect(paths).toContain("criteria.technicalSolvency");
  });
});
