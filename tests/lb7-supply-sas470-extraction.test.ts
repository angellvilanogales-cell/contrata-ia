import { describe, expect, it } from "vitest";
import { SUPPLY_REGRESSION_CASE_004_SAS_470 } from "../src/regression/SupplyRegressionCase004Sas470";
import { SUPPLY_REGRESSION_SAS_004_EXTRACTION_SCRIPT } from "../src/interfaces/lb7/SupplyRegressionSas004ExtractionScript";

describe("Paso 11.7.6 - REG-SUPPLY-004 SAS 470/2025", () => {
  it("mantiene el acuerdo marco como extracción pendiente de validación humana", () => {
    const c = SUPPLY_REGRESSION_CASE_004_SAS_470;
    expect(c.id).toBe("REG-SUPPLY-004");
    expect(c.status).toBe("SOURCE_EXTRACTED_PENDING_HUMAN_VALIDATION");
    expect(c.humanValidationRequired).toBe(true);
    expect(c.facts.procurementInstrument).toBe("ACUERDO_MARCO");
    expect(c.facts.contractType).toBe("SUMINISTRO");
  });

  it("protege la configuración funcional ya identificada", () => {
    const f = SUPPLY_REGRESSION_CASE_004_SAS_470.facts;
    expect(f.procedure).toBe("ABIERTO");
    expect(f.lots).toBe(true);
    expect(f.successiveSupply).toBe(true);
    expect(f.economicMode).toBe("PRECIOS_UNITARIOS");
    expect(f.awardMode).toBe("CRITERIOS_MULTIPLES");
    expect(f.judgmentValueCriteria).toBe(true);
    expect(f.automaticCriteria).toBe(true);
  });

  it("impide heredar simplificaciones del golden case", () => {
    const forbidden = SUPPLY_REGRESSION_CASE_004_SAS_470.regressionGuards.forbiddenInheritedGoldenRules;
    expect(forbidden).toContain("FORCE_SINGLE_LOT");
    expect(forbidden).toContain("FORCE_ABIERTO_SIMPLIFICADO_ABREVIADO");
    expect(forbidden).toContain("FORCE_PRICE_ONLY_100");
    expect(forbidden).toContain("TREAT_AS_SINGLE_SUPPLY_CONTRACT_WITHOUT_FRAMEWORK");
  });

  it("no congela detalles que aún requieren extracción documental específica", () => {
    const pending = SUPPLY_REGRESSION_CASE_004_SAS_470.extractionScope.deliberatelyNotFrozenYet;
    expect(pending).toContain("número exacto y descripción de cada lote");
    expect(pending).toContain("ponderación exacta de cada criterio");
    expect(pending).toContain("condiciones de los contratos basados");
    expect(pending.length).toBeGreaterThanOrEqual(8);
  });

  it("expone el paso 11.7.6 solo después de la regresión Aulas registrada", () => {
    expect(() => new Function(SUPPLY_REGRESSION_SAS_004_EXTRACTION_SCRIPT)).not.toThrow();
    expect(SUPPLY_REGRESSION_SAS_004_EXTRACTION_SCRIPT).toContain("11.7.6 REG-SUPPLY-004 · SAS 470/2025");
    expect(SUPPLY_REGRESSION_SAS_004_EXTRACTION_SCRIPT).toContain("supplyRegressionAulas003AutomaticGuardRegistered");
    expect(SUPPLY_REGRESSION_SAS_004_EXTRACTION_SCRIPT).toContain("Validar extracción documental 11.7.6");
    expect(SUPPLY_REGRESSION_SAS_004_EXTRACTION_SCRIPT).toContain("El caso queda listo para construir su regresión específica");
  });
});
