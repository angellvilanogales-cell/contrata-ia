import { describe, expect, it } from "vitest";
import { SUPPLY_REGRESSION_CASE_003_AULAS_DIGITALES } from "../src/regression/SupplyRegressionCase003AulasDigitales";
import { SUPPLY_REGRESSION_AULAS_003_EXTRACTION_SCRIPT } from "../src/interfaces/lb7/SupplyRegressionAulas003ExtractionScript";
import { SUPPLY_REGRESSION_PANDA_002_GUARD_SCRIPT } from "../src/interfaces/lb7/SupplyRegressionPanda002GuardScript";

describe("Paso 11.7.4 - extracción Aulas digitales", () => {
  it("conserva los rasgos funcionales de cobertura comprobados", () => {
    const c = SUPPLY_REGRESSION_CASE_003_AULAS_DIGITALES;
    expect(c.id).toBe("REG-SUPPLY-003");
    expect(c.expediente).toBe("CONTR 2025 0000489703");
    expect(c.facts.contractType).toBe("SUMINISTRO");
    expect(c.facts.procedure).toBe("ABIERTO");
    expect(c.facts.sara).toBe(true);
    expect(c.facts.lots).toBe(true);
    expect(c.facts.lotCount).toBe(9);
    expect(c.facts.needsBasedDA33).toBe(true);
    expect(c.facts.europeanFunds).toBe(true);
    expect(c.facts.economicMode).toBe("PRECIOS_UNITARIOS");
    expect(c.facts.awardMode).toBe("CRITERIOS_MULTIPLES");
  });

  it("no congela detalles documentales que todavía requieren extracción específica", () => {
    const pending = SUPPLY_REGRESSION_CASE_003_AULAS_DIGITALES.extractionScope.deliberatelyNotFrozenYet;
    expect(pending).toContain("importes económicos detallados");
    expect(pending).toContain("CPV por lote");
    expect(pending).toContain("ponderación y fórmula de cada criterio de adjudicación");
    expect(pending).toContain("duración exacta y detalle de prórrogas");
  });

  it("impide heredar simplificaciones del golden case", () => {
    const forbidden = SUPPLY_REGRESSION_CASE_003_AULAS_DIGITALES.regressionGuards.forbiddenInheritedGoldenRules;
    expect(forbidden).toContain("FORCE_SINGLE_LOT");
    expect(forbidden).toContain("FORCE_ABIERTO_SIMPLIFICADO_ABREVIADO");
    expect(forbidden).toContain("FORCE_PRICE_ONLY_100");
    expect(forbidden).toContain("FORCE_AUTOFINANCING");
  });

  it("exige 11.7.3 registrado antes de mostrar y validar 11.7.4", () => {
    expect(() => new Function(SUPPLY_REGRESSION_AULAS_003_EXTRACTION_SCRIPT)).not.toThrow();
    expect(SUPPLY_REGRESSION_AULAS_003_EXTRACTION_SCRIPT).toContain("supplyRegressionPanda002AutomaticGuardRegistered");
    expect(SUPPLY_REGRESSION_AULAS_003_EXTRACTION_SCRIPT).toContain("11.7.4 REG-SUPPLY-003 · Aulas digitales");
    expect(SUPPLY_REGRESSION_AULAS_003_EXTRACTION_SCRIPT).toContain("Validar extracción documental 11.7.4");
  });

  it("queda encadenado al script ya integrado en /adaptive", () => {
    expect(SUPPLY_REGRESSION_PANDA_002_GUARD_SCRIPT).toContain("11.7.4 REG-SUPPLY-003 · Aulas digitales");
  });
});
