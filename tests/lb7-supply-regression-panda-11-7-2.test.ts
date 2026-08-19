import { describe, expect, it } from "vitest";
import { SUPPLY_REGRESSION_CASE_002_PANDA } from "../src/regression/SupplyRegressionCase002Panda";
import { REGRESSION_COVERAGE_MATRIX } from "../src/regression/RegressionCoverageMatrix";
import { SUPPLY_REGRESSION_SOURCES_REGISTRY_SCRIPT } from "../src/interfaces/lb7/SupplyRegressionSourcesRegistryScript";

describe("Paso 11.7.2 - REG-SUPPLY-002 Panda Antivirus AVRA", () => {
  it("extrae los hechos documentales críticos del caso Panda", () => {
    const f = SUPPLY_REGRESSION_CASE_002_PANDA.facts;
    expect(f.needsBasedDA33).toBe(false);
    expect(f.lots).toBe(false);
    expect(f.initialDurationMonths).toBe(36);
    expect(f.extensions).toBe(false);
    expect(f.pblExVat).toBe(61192.25);
    expect(f.pblVatIncluded).toBe(74042.62);
    expect(f.estimatedValueExVat).toBe(61192.25);
    expect(f.economicMode).toBe("PRECIOS_UNITARIOS");
    expect(f.awardMode).toBe("PRECIO_UNICO");
    expect(f.awardPoints).toBe(100);
  });

  it("distingue la modificación prevista de Panda de la modificación DA 33 del golden case", () => {
    const f = SUPPLY_REGRESSION_CASE_002_PANDA.facts;
    expect(f.plannedModification).toBe(true);
    expect(f.plannedModificationPercent).toBe(20);
    expect(f.plannedModificationReason).toBe("REDUCCION_FINANCIACION_MEDIDAS_ESTABILIDAD_PRESUPUESTARIA");
    expect(f.plannedModificationIsDA33NeedsIncrease).toBe(false);
  });

  it("impide heredar reglas específicas del golden case", () => {
    expect(SUPPLY_REGRESSION_CASE_002_PANDA.regressionGuards.forbiddenInheritedGoldenRules).toEqual(
      expect.arrayContaining([
        "DA33_ACTIVE",
        "DA33_MAXIMUM_BUDGET",
        "DA33_NEEDS_INCREASE_MODIFICATION",
        "EXTENSIONS_12_12",
        "FERRETERIA_CATALOGUE_98_REFERENCES",
        "PACKAGING_WASTE_SPECIAL_EXECUTION_CONDITION",
      ]),
    );
  });

  it("sincroniza la matriz 11.7 con la extracción 11.7.2", () => {
    const matrixCase = REGRESSION_COVERAGE_MATRIX.find((item) => item.id === "REG-SUPPLY-002");
    expect(matrixCase).toBeDefined();
    expect(matrixCase?.needsBased).toBe(false);
    expect(matrixCase?.extensions).toBe(false);
    expect(matrixCase?.plannedModification).toBe(true);
    expect(matrixCase?.economicMode).toBe("PRECIOS_UNITARIOS");
    expect(matrixCase?.source?.legalValidation).toBe("PENDING");
  });

  it("mantiene validación humana explícita antes de usar la extracción como referencia", () => {
    expect(SUPPLY_REGRESSION_CASE_002_PANDA.humanValidationRequired).toBe(true);
    expect(SUPPLY_REGRESSION_CASE_002_PANDA.status).toBe("SOURCE_EXTRACTED_PENDING_HUMAN_VALIDATION");
    expect(() => new Function(SUPPLY_REGRESSION_SOURCES_REGISTRY_SCRIPT)).not.toThrow();
    expect(SUPPLY_REGRESSION_SOURCES_REGISTRY_SCRIPT).toContain("11.7.2 REG-SUPPLY-002");
    expect(SUPPLY_REGRESSION_SOURCES_REGISTRY_SCRIPT).toContain("Validar extracción documental 11.7.2");
    expect(SUPPLY_REGRESSION_SOURCES_REGISTRY_SCRIPT).toContain("SOURCE_EXTRACTION_HUMAN_VALIDATED");
  });
});
