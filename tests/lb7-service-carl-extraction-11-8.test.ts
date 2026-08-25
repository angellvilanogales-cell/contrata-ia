import { describe, expect, it } from "vitest";
import { SERVICE_REGRESSION_CASE_005_CARL_CLEANING } from "../src/regression/ServiceRegressionCase005CarlCleaning";
import { SERVICE_REGRESSION_CARL_005_EXTRACTION_SCRIPT } from "../src/interfaces/lb7/ServiceRegressionCarl005ExtractionScript";
import { SUPPLY_REGRESSION_VEIASA_006_GUARD_SCRIPT } from "../src/interfaces/lb7/SupplyRegressionVeiasa006GuardScript";

describe("Paso 11.8 - REG-SERVICE-005 limpieza CARL", () => {
  it("abre cobertura real a servicios sin declararlo golden", () => {
    const c = SERVICE_REGRESSION_CASE_005_CARL_CLEANING;
    expect(c.id).toBe("REG-SERVICE-005");
    expect(c.status).toBe("SOURCE_EXTRACTED_PENDING_HUMAN_VALIDATION");
    expect(c.facts.contractType).toBe("SERVICIO");
    expect(c.humanValidationRequired).toBe(true);
  });

  it("protege los hechos directamente soportados por Memoria, PCAP y PPT", () => {
    const f = SERVICE_REGRESSION_CASE_005_CARL_CLEANING.facts;
    expect(f.serviceCategory).toBe("LIMPIEZA");
    expect(f.procedure).toBe("ABIERTO_SIMPLIFICADO");
    expect(f.ordinarySimplified).toBe(true);
    expect(f.mainCpv).toBe("90919200-4");
    expect(f.accessoryCpvs).toEqual(["39830000-9", "42995000-7"]);
    expect(f.insufficientOwnMeans).toBe(true);
    expect(f.personnelSubrogation).toBe(true);
    expect(f.accessoryCleaningMaterialsAndMachineryIncluded).toBe(true);
  });

  it("impide recalificar como suministro por materiales accesorios", () => {
    const guards = SERVICE_REGRESSION_CASE_005_CARL_CLEANING.regressionGuards;
    expect(guards.forbiddenSupplyInheritance).toContain("RECLASSIFY_AS_SUPPLY_DUE_TO_ACCESSORY_MATERIALS");
    expect(guards.forbiddenSupplyInheritance).toContain("FORCE_DA33_WITHOUT_SERVICE_SOURCE_EVIDENCE");
    expect(guards.requiredCaseRules).toContain("PERSONNEL_SUBROGATION");
    expect(guards.requiredCaseRules).toContain("INSUFFICIENT_OWN_MEANS");
  });

  it("no congela los campos que aún requieren extracción específica", () => {
    const pending = SERVICE_REGRESSION_CASE_005_CARL_CLEANING.extractionScope.deliberatelyNotFrozenYet;
    expect(pending).toContain("división o no en lotes y su justificación");
    expect(pending).toContain("aplicación o no de DA 33.ª");
    expect(pending).toContain("PBL, IVA y valor estimado exactos");
    expect(pending).toContain("detalle nominal/económico de la información de subrogación");
  });

  it("expone 11.8 únicamente tras registrar la regresión VEIASA", () => {
    expect(() => new Function(SERVICE_REGRESSION_CARL_005_EXTRACTION_SCRIPT)).not.toThrow();
    expect(SERVICE_REGRESSION_CARL_005_EXTRACTION_SCRIPT).toContain("11.8 REG-SERVICE-005 · Limpieza sede CARL");
    expect(SERVICE_REGRESSION_CARL_005_EXTRACTION_SCRIPT).toContain("supplyRegressionVeiasa006AutomaticGuardRegistered");
    expect(SERVICE_REGRESSION_CARL_005_EXTRACTION_SCRIPT).toContain("Validar extracción documental 11.8");
    expect(SUPPLY_REGRESSION_VEIASA_006_GUARD_SCRIPT).toContain("11.8 REG-SERVICE-005 · Limpieza sede CARL");
  });
});
