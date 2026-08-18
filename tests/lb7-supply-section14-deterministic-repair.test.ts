import { describe, expect, it } from "vitest";
import { SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT } from "../src/interfaces/lb7/SupplySection14DeterministicRepairScript";
import { ADAPTIVE_FLOW_UI } from "../src/interfaces/lb7/AdaptiveFlowUi";

describe("Paso 11.2.2A - reconstrucción estructural tolerante del apartado 14", () => {
  it("compila de forma aislada", () => {
    expect(() => new Function(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT)).not.toThrow();
  });

  it("localiza apartado y causas por contenido, posición y fallback numerado", () => {
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("14. MODIFICACIONES");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("15. TRATAMIENTO");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("findNumbered");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("MAYORES NECESIDADES REALES");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("DISPOSICIÓN ADICIONAL 33");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("OTRAS CAUSAS DE MODIFICACIÓN");
  });

  it("fija semánticamente las tres causas", () => {
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("Porcentaje máximo del precio del contrato al que pueda afectar esta causa: No procede");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("Porcentaje máximo del precio inicial del contrato al que puede afectar esta modificación prevista: 20 %");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("no podrán incorporarse nuevos artículos ni establecerse nuevos precios unitarios");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("3. Otras causas de modificación previstas: No procede");
  });

  it("audita que el 20 por ciento solo quede en la causa 2", () => {
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("Causa 1 conserva el 20 %");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("Causa 2 sin 20 %");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("Causa 3 sin No procede");
  });

  it("informa los anclajes encontrados si el ODT no puede delimitarse", () => {
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("Anclajes: 14=");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("causa1=");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("causa2=");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("causa3=");
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
