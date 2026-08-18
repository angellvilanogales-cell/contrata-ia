import { describe, expect, it } from "vitest";
import { SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT } from "../src/interfaces/lb7/SupplySection14DeterministicRepairScript";
import { ADAPTIVE_FLOW_UI } from "../src/interfaces/lb7/AdaptiveFlowUi";

describe("Paso 11.2.2A - reconstrucción determinista del apartado 14", () => {
  it("compila de forma aislada", () => {
    expect(() => new Function(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT)).not.toThrow();
  });

  it("delimita el apartado 14 y sus tres causas por posición", () => {
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("14. MODIFICACIONES DEL CONTRATO");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("1. REDUCCIÓN O SUPRESIÓN DE PRESTACIONES");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("2. MAYORES NECESIDADES REALES");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("3. OTRAS CAUSAS DE MODIFICACIÓN");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("15. TRATAMIENTO DE DATOS PERSONALES");
  });

  it("fija semánticamente causa 1, causa 2 DA33 y causa 3", () => {
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("causa 1 conserva indebidamente el 20 %");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("Porcentaje máximo del precio del contrato al que pueda afectar esta causa: No procede");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("Porcentaje máximo del precio inicial del contrato al que puede afectar esta modificación prevista: 20 %");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("no podrán incorporarse nuevos artículos ni establecerse nuevos precios unitarios");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("3. Otras causas de modificación previstas: No procede");
  });

  it("audita el significado y la posición y no una coincidencia global del 20 por ciento", () => {
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("auditSection14");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("La causa 1 conserva indebidamente el 20 %");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("La causa 2 no contiene el porcentaje máximo del 20 %");
    expect(SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT).toContain("La causa 3 no está cerrada como No procede");
  });

  it("queda integrado inmediatamente después de la auditoría integral", () => {
    expect(ADAPTIVE_FLOW_UI).toContain("SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT");
    const audit = ADAPTIVE_FLOW_UI.indexOf("SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT");
    const repair = ADAPTIVE_FLOW_UI.indexOf("SUPPLY_SECTION_14_DETERMINISTIC_REPAIR_SCRIPT");
    const pbl = ADAPTIVE_FLOW_UI.indexOf("SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT");
    expect(audit).toBeGreaterThanOrEqual(0);
    expect(repair).toBeGreaterThan(audit);
    expect(pbl).toBeGreaterThan(repair);
  });
});
