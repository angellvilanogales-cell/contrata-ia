import { describe, expect, it } from "vitest";
import { SERVICE_REGRESSION_CASE_005_CARL_CLEANING } from "../src/regression/ServiceRegressionCase005CarlCleaning";
import { CARL_SERVICE_REGRESSION_MANIFEST } from "../src/regression/ServiceRegressionCase005CarlCleaningGuard";
import { SERVICE_REGRESSION_CARL_005_EXTRACTION_SCRIPT } from "../src/interfaces/lb7/ServiceRegressionCarl005ExtractionScript";
import { SERVICE_REGRESSION_CARL_005_GUARD_SCRIPT } from "../src/interfaces/lb7/ServiceRegressionCarl005GuardScript";

describe("Paso 11.8.1 - regresión automática de servicios CARL", () => {
  it("protege únicamente el alcance validado en 11.8", () => {
    expect(CARL_SERVICE_REGRESSION_MANIFEST.passed).toBe(true);
    expect(CARL_SERVICE_REGRESSION_MANIFEST.blockers).toHaveLength(0);
    expect(CARL_SERVICE_REGRESSION_MANIFEST.checks).toHaveLength(7);
    expect(SERVICE_REGRESSION_CASE_005_CARL_CLEANING.facts.contractType).toBe("SERVICIO");
    expect(SERVICE_REGRESSION_CASE_005_CARL_CLEANING.facts.mainCpv).toBe("90919200-4");
    expect(SERVICE_REGRESSION_CASE_005_CARL_CLEANING.facts.insufficientOwnMeans).toBe(true);
    expect(SERVICE_REGRESSION_CASE_005_CARL_CLEANING.facts.personnelSubrogation).toBe(true);
  });

  it("impide herencia indebida de reglas de suministros", () => {
    const forbidden = CARL_SERVICE_REGRESSION_MANIFEST.forbiddenSupplyInheritance;
    expect(forbidden).toContain("RECLASSIFY_AS_SUPPLY_DUE_TO_ACCESSORY_MATERIALS");
    expect(forbidden).toContain("FORCE_SUPPLY_DELIVERY_LOGIC");
    expect(forbidden).toContain("FERRETERIA_CATALOGUE_98_REFERENCES");
    expect(forbidden).toContain("FORCE_DA33_WITHOUT_SERVICE_SOURCE_EVIDENCE");
    expect(forbidden).toContain("DROP_PERSONNEL_SUBROGATION");
  });

  it("mantiene fuera de línea base los campos aún no extraídos", () => {
    const pending = CARL_SERVICE_REGRESSION_MANIFEST.deliberatelyNotFrozenYet;
    expect(pending).toContain("división o no en lotes y su justificación");
    expect(pending).toContain("aplicación o no de DA 33.ª");
    expect(pending).toContain("PBL, IVA y valor estimado exactos");
    expect(pending).toContain("detalle nominal/económico de la información de subrogación");
  });

  it("encadena 11.8.1 tras validación humana de 11.8", () => {
    expect(() => new Function(SERVICE_REGRESSION_CARL_005_GUARD_SCRIPT)).not.toThrow();
    expect(() => new Function(SERVICE_REGRESSION_CARL_005_EXTRACTION_SCRIPT)).not.toThrow();
    expect(SERVICE_REGRESSION_CARL_005_GUARD_SCRIPT).toContain("serviceRegressionCarl005ExtractionValidated");
    expect(SERVICE_REGRESSION_CARL_005_GUARD_SCRIPT).toContain("Registrar regresión automática 11.8.1");
    expect(SERVICE_REGRESSION_CARL_005_EXTRACTION_SCRIPT).toContain("11.8.1 Regresión automática servicios CARL");
  });
});
