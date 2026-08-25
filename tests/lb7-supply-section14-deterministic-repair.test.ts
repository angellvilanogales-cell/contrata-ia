import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT } from "../src/interfaces/lb7/SupplySection14DeterministicRepairScript";

describe("Paso 11.2.2A - reconstrucción del apartado 14 por límites reales", () => {
  it("compila de forma aislada", () => {
    expect(() => new Function(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT)).not.toThrow();
  });

  it("ignora el índice y localiza el bloque real por contenido", () => {
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("MODIFICACIONES DEL CONTRATO");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("POSIBILIDAD DE MODIFICACIÓN DEL CONTRATO");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("TRATAMIENTO DE DATOS PERSONALES");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("candidateCount");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).not.toContain("endAnnex");
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
    const uiSource = fs.readFileSync(path.resolve("src/interfaces/lb7/AdaptiveFlowUi.ts"), "utf8");
    const audit = uiSource.indexOf("${SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT}");
    const repair = uiSource.indexOf("${SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT}");
    const pbl = uiSource.indexOf("${SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT}");
    expect(audit).toBeGreaterThanOrEqual(0);
    expect(repair).toBeGreaterThan(audit);
    expect(pbl).toBeGreaterThan(repair);
  });
});
