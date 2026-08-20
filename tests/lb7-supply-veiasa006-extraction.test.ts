import { describe, expect, it } from "vitest";
import { SUPPLY_REGRESSION_CASE_006_VEIASA_WINDOWS } from "../src/regression/SupplyRegressionCase006VeiasaWindows";
import { SUPPLY_REGRESSION_VEIASA_006_EXTRACTION_SCRIPT } from "../src/interfaces/lb7/SupplyRegressionVeiasa006ExtractionScript";

describe("Paso 11.7.10 - REG-SUPPLY-006 VEIASA Windows Server", () => {
  it("mantiene la extracción pendiente de validación humana", () => {
    const c = SUPPLY_REGRESSION_CASE_006_VEIASA_WINDOWS;
    expect(c.id).toBe("REG-SUPPLY-006");
    expect(c.status).toBe("SOURCE_EXTRACTED_PENDING_HUMAN_VALIDATION");
    expect(c.humanValidationRequired).toBe(true);
    expect(c.facts.contractType).toBe("SUMINISTRO");
  });

  it("protege un suministro ordinario sin DA33", () => {
    const f = SUPPLY_REGRESSION_CASE_006_VEIASA_WINDOWS.facts;
    expect(f.procedure).toBe("ABIERTO_SIMPLIFICADO");
    expect(f.lots).toBe(false);
    expect(f.needsBasedDA33).toBe(false);
    expect(f.economicMode).toBe("PRECIO_GLOBAL");
    expect(f.awardMode).toBe("PRECIO_UNICO");
    expect(f.extensions).toBe(false);
    expect(f.plannedModification).toBe(false);
  });

  it("impide heredar reglas DA33 y económicas del golden", () => {
    const forbidden = SUPPLY_REGRESSION_CASE_006_VEIASA_WINDOWS.regressionGuards.forbiddenInheritedGoldenRules;
    expect(forbidden).toContain("DA33_ACTIVE");
    expect(forbidden).toContain("DA33_MAXIMUM_BUDGET");
    expect(forbidden).toContain("UNIT_PRICES");
    expect(forbidden).toContain("EXTENSIONS_12_12");
    expect(forbidden).toContain("DA33_NEEDS_INCREASE_MODIFICATION");
  });

  it("no congela datos finos todavía no validados", () => {
    const pending = SUPPLY_REGRESSION_CASE_006_VEIASA_WINDOWS.extractionScope.deliberatelyNotFrozenYet;
    expect(pending).toContain("importe exacto del PBL y del valor estimado");
    expect(pending).toContain("CPV exacto");
    expect(pending.length).toBeGreaterThanOrEqual(8);
  });

  it("expone 11.7.10 solo tras registrar la regresión Tablets", () => {
    expect(() => new Function(SUPPLY_REGRESSION_VEIASA_006_EXTRACTION_SCRIPT)).not.toThrow();
    expect(SUPPLY_REGRESSION_VEIASA_006_EXTRACTION_SCRIPT).toContain("11.7.10 REG-SUPPLY-006 · VEIASA Windows Server");
    expect(SUPPLY_REGRESSION_VEIASA_006_EXTRACTION_SCRIPT).toContain("supplyRegressionTablets005AutomaticGuardRegistered");
    expect(SUPPLY_REGRESSION_VEIASA_006_EXTRACTION_SCRIPT).toContain("Validar extracción documental 11.7.10");
  });
});
