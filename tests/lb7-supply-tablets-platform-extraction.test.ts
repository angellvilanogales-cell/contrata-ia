import { describe, expect, it } from "vitest";
import { SUPPLY_REGRESSION_CASE_005_TABLETS_PLATFORM } from "../src/regression/SupplyRegressionCase005TabletsPlatform";
import { SUPPLY_REGRESSION_TABLETS_005_EXTRACTION_SCRIPT } from "../src/interfaces/lb7/SupplyRegressionTablets005ExtractionScript";
import { SUPPLY_REGRESSION_SAS_004_GUARD_SCRIPT } from "../src/interfaces/lb7/SupplyRegressionSas004GuardScript";

describe("Paso 11.7.8 - REG-SUPPLY-005 Tablets + plataforma", () => {
  it("mantiene la extracción como pendiente de validación humana", () => {
    const c = SUPPLY_REGRESSION_CASE_005_TABLETS_PLATFORM;
    expect(c.id).toBe("REG-SUPPLY-005");
    expect(c.status).toBe("SOURCE_EXTRACTED_PENDING_HUMAN_VALIDATION");
    expect(c.humanValidationRequired).toBe(true);
  });

  it("protege el suministro complejo con plataforma sin recalificarlo automáticamente", () => {
    const f = SUPPLY_REGRESSION_CASE_005_TABLETS_PLATFORM.facts;
    expect(f.contractType).toBe("SUMINISTRO");
    expect(f.complexSupplyWithPlatformComponent).toBe(true);
    expect(f.procedure).toBe("ABIERTO");
    expect(f.lots).toBe(false);
    expect(f.needsBasedDA33).toBe(true);
    expect(f.economicMode).toBe("PRECIOS_UNITARIOS");
    expect(f.awardMode).toBe("CRITERIOS_MULTIPLES");
    expect(f.formulaEvaluatedCriteria).toBe(true);
  });

  it("impide herencias o recalificaciones no soportadas por las fuentes", () => {
    const forbidden = SUPPLY_REGRESSION_CASE_005_TABLETS_PLATFORM.regressionGuards.forbiddenInheritedGoldenRules;
    expect(forbidden).toContain("FORCE_ABIERTO_SIMPLIFICADO_ABREVIADO");
    expect(forbidden).toContain("FORCE_PRICE_ONLY_100");
    expect(forbidden).toContain("DROP_PLATFORM_COMPONENT");
    expect(forbidden).toContain("RECLASSIFY_AS_SERVICE_WITHOUT_SOURCE_VALIDATION");
    expect(forbidden).toContain("RECLASSIFY_AS_MIXED_CONTRACT_WITHOUT_SOURCE_VALIDATION");
  });

  it("deja fuera los detalles jurídicos y económicos aún no extraídos", () => {
    const pending = SUPPLY_REGRESSION_CASE_005_TABLETS_PLATFORM.extractionScope.deliberatelyNotFrozenYet;
    expect(pending).toContain("calificación jurídica detallada del componente de plataforma y su peso económico");
    expect(pending).toContain("CPV principal y CPV complementarios");
    expect(pending).toContain("protección de datos, seguridad y niveles de servicio de la plataforma");
    expect(pending.length).toBeGreaterThanOrEqual(9);
  });

  it("expone 11.7.8 solo después de registrar la regresión SAS 11.7.7", () => {
    expect(() => new Function(SUPPLY_REGRESSION_TABLETS_005_EXTRACTION_SCRIPT)).not.toThrow();
    expect(SUPPLY_REGRESSION_TABLETS_005_EXTRACTION_SCRIPT).toContain("11.7.8 REG-SUPPLY-005 · Tablets + plataforma de gestión");
    expect(SUPPLY_REGRESSION_TABLETS_005_EXTRACTION_SCRIPT).toContain("supplyRegressionSas004AutomaticGuardRegistered");
    expect(SUPPLY_REGRESSION_TABLETS_005_EXTRACTION_SCRIPT).toContain("Validar extracción documental 11.7.8");
    expect(SUPPLY_REGRESSION_SAS_004_GUARD_SCRIPT).toContain("11.7.8 REG-SUPPLY-005 · Tablets + plataforma de gestión");
  });
});
