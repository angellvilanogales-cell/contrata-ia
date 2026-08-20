import { describe, expect, it } from "vitest";
import { VEIASA_REGRESSION_BASELINE, VEIASA_REGRESSION_VERSION } from "../src/regression/SupplyRegressionCase006VeiasaWindowsGuard";
import { SUPPLY_REGRESSION_VEIASA_006_GUARD_SCRIPT } from "../src/interfaces/lb7/SupplyRegressionVeiasa006GuardScript";

describe("Paso 11.7.11 - regresión automática VEIASA", () => {
  it("supera la línea base validada sin bloqueantes", () => {
    expect(VEIASA_REGRESSION_VERSION).toBe("REG-SUPPLY-006-VEIASA-GUARD-11.7.11-v1");
    expect(VEIASA_REGRESSION_BASELINE.caseId).toBe("REG-SUPPLY-006");
    expect(VEIASA_REGRESSION_BASELINE.passed).toBe(true);
    expect(VEIASA_REGRESSION_BASELINE.blockers).toHaveLength(0);
    expect(VEIASA_REGRESSION_BASELINE.checks).toHaveLength(8);
  });

  it("protege DA33 desactivada, precio global y ausencia de prórroga/modificación", () => {
    const ids = VEIASA_REGRESSION_BASELINE.checks.map((check) => check.id);
    expect(ids).toContain("VEIASA-DA33-OFF");
    expect(ids).toContain("VEIASA-GLOBAL-PRICE");
    expect(ids).toContain("VEIASA-NO-EXTENSIONS");
    expect(ids).toContain("VEIASA-NO-PLANNED-MODIFICATION");
  });

  it("bloquea la herencia de reglas específicas del golden case", () => {
    const forbidden = VEIASA_REGRESSION_BASELINE.forbiddenGoldenInheritance;
    expect(forbidden).toContain("DA33_ACTIVE");
    expect(forbidden).toContain("DA33_MAXIMUM_BUDGET");
    expect(forbidden).toContain("UNIT_PRICES");
    expect(forbidden).toContain("EXTENSIONS_12_12");
    expect(forbidden).toContain("DA33_NEEDS_INCREASE_MODIFICATION");
    expect(forbidden).toContain("FERRETERIA_CATALOGUE_98_REFERENCES");
  });

  it("mantiene fuera de la regresión los detalles no extraídos", () => {
    const pending = VEIASA_REGRESSION_BASELINE.deliberatelyNotFrozenYet;
    expect(pending).toContain("importe exacto del PBL y del valor estimado");
    expect(pending).toContain("CPV exacto");
    expect(pending).toContain("duración exacta");
    expect(pending).toContain("fórmula exacta de valoración económica");
  });

  it("expone la interfaz solo tras validación humana de 11.7.10", () => {
    expect(() => new Function(SUPPLY_REGRESSION_VEIASA_006_GUARD_SCRIPT)).not.toThrow();
    expect(SUPPLY_REGRESSION_VEIASA_006_GUARD_SCRIPT).toContain("supplyRegressionVeiasa006ExtractionValidated");
    expect(SUPPLY_REGRESSION_VEIASA_006_GUARD_SCRIPT).toContain("Registrar regresión automática 11.7.11");
    expect(SUPPLY_REGRESSION_VEIASA_006_GUARD_SCRIPT).toContain("REG-SERVICE-005");
  });
});
