import { describe, expect, it } from "vitest";
import { SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT } from "../src/interfaces/lb7/SupplySection14DeterministicRepairScript";
import { ADAPTIVE_FLOW_UI } from "../src/interfaces/lb7/AdaptiveFlowUi";

describe("Paso 11.2.2A - reconstrucción del apartado 14 por límites de sección", () => {
  it("compila de forma aislada", () => {
    expect(() => new Function(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT)).not.toThrow();
  });

  it("delimita el apartado sin depender de numeración automática", () => {
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("MODIFICACIONES DEL CONTRATO");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("TRATAMIENTO DE DATOS PERSONALES");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("locateBounds");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).not.toContain("findNumbered");
  });

  it("reconstruye íntegramente las tres causas canónicas", () => {
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("1. Reducción o supresión de prestaciones por medidas de estabilidad presupuestaria: No procede");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("2. Mayores necesidades reales respecto de las estimadas inicialmente");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("disposición adicional 33.ª LCSP");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("Porcentaje máximo del precio inicial del contrato al que puede afectar esta modificación prevista: 20 %");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("no podrán incorporarse nuevos artículos ni establecerse nuevos precios unitarios");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("3. Otras causas de modificación previstas: No procede");
  });

  it("neutraliza el contenido previo antes de insertar la versión canónica", () => {
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("ps[i].textContent=\"\"");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("CANONICAL.forEach");
  });

  it("audita posición y significado tras reconstruir", () => {
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("Causa 1 conserva el 20 %");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("Causa 2 sin 20 %");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("Causa 3 sin No procede");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("No se reconocen las tres causas canónicas en el orden esperado");
  });

  it("sigue integrado entre la auditoría integral y el cierre PBL", () => {
    expect(ADAPTIVE_FLOW_UI).toContain("SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT");
    const audit = ADAPTIVE_FLOW_UI.indexOf("SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT");
    const repair = ADAPTIVE_FLOW_UI.indexOf("SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT");
    const pbl = ADAPTIVE_FLOW_UI.indexOf("SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT");
    expect(audit).toBeGreaterThanOrEqual(0);
    expect(repair).toBeGreaterThan(audit);
    expect(pbl).toBeGreaterThan(repair);
  });
});
