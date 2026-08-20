import { describe, expect, it } from "vitest";
import { SUPPLY_REGRESSION_CASE_005_TABLETS_PLATFORM } from "../src/regression/SupplyRegressionCase005TabletsPlatform";
import { TABLETS_REGRESSION_BASELINE, TABLETS_REGRESSION_CHECKS } from "../src/regression/SupplyRegressionCase005TabletsPlatformGuard";
import { SUPPLY_REGRESSION_TABLETS_005_GUARD_SCRIPT } from "../src/interfaces/lb7/SupplyRegressionTablets005GuardScript";

function mutate(overrides: Partial<typeof SUPPLY_REGRESSION_CASE_005_TABLETS_PLATFORM.facts>) {
  return { ...SUPPLY_REGRESSION_CASE_005_TABLETS_PLATFORM.facts, ...overrides };
}

describe("Paso 11.7.9 - regresión automática Tablets + plataforma", () => {
  it("supera la línea base validada", () => {
    expect(TABLETS_REGRESSION_BASELINE.passed).toBe(true);
    expect(TABLETS_REGRESSION_BASELINE.blockers).toHaveLength(0);
    expect(TABLETS_REGRESSION_CHECKS).toHaveLength(10);
  });

  it("protege suministro complejo con plataforma y DA 33.ª", () => {
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

  it("detectaría degradaciones propias del golden", () => {
    expect(mutate({ procedure: "ABIERTO_SIMPLIFICADO_ABREVIADO" as never }).procedure).not.toBe("ABIERTO");
    expect(mutate({ awardMode: "PRECIO_UNICO" as never }).awardMode).not.toBe("CRITERIOS_MULTIPLES");
    expect(mutate({ complexSupplyWithPlatformComponent: false }).complexSupplyWithPlatformComponent).toBe(false);
    expect(mutate({ needsBasedDA33: false }).needsBasedDA33).toBe(false);
  });

  it("mantiene fuera de alcance los detalles no extraídos", () => {
    const pending = TABLETS_REGRESSION_BASELINE.deliberatelyNotFrozenYet;
    expect(pending).toContain("calificación jurídica detallada del componente de plataforma y su peso económico");
    expect(pending).toContain("CPV principal y CPV complementarios");
    expect(pending).toContain("protección de datos, seguridad y niveles de servicio de la plataforma");
  });

  it("integra la interfaz solo tras validar 11.7.8", () => {
    expect(() => new Function(SUPPLY_REGRESSION_TABLETS_005_GUARD_SCRIPT)).not.toThrow();
    expect(SUPPLY_REGRESSION_TABLETS_005_GUARD_SCRIPT).toContain("11.7.9 Regresión automática Tablets + plataforma");
    expect(SUPPLY_REGRESSION_TABLETS_005_GUARD_SCRIPT).toContain("supplyRegressionTablets005ExtractionValidated");
    expect(SUPPLY_REGRESSION_TABLETS_005_GUARD_SCRIPT).toContain("REG-SUPPLY-006");
  });
});
