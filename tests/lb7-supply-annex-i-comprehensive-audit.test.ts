import { describe, expect, it } from "vitest";
import { SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT } from "../src/interfaces/lb7/SupplyAnnexIComprehensiveAuditScript";
import { ADAPTIVE_FLOW_UI } from "../src/interfaces/lb7/AdaptiveFlowUi";

describe("Paso 11.2.2 - auditoría integral del Anexo I", () => {
  it("compila de forma aislada", () => {
    expect(() => new Function(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT)).not.toThrow();
  });

  it("limita la auditoría al Anexo I y excluye los anexos de la persona licitadora", () => {
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain("TÍTULO DEL CONTRATO:");
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain("ANEXO II");
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain("No se auditan como pendientes los Anexos II y siguientes");
  });

  it("distingue ramas condicionales cerradas de bloqueantes reales", () => {
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain("closedPatterns");
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain("COMBINACIÓN O COMBINACIONES DE LOTES");
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain("URGENTE, SEGÚN RESOLUCIÓN");
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain("EL TRATAMIENTO CONSISTIRÁ EN:");
  });

  it("completa destinos duplicados ya validados de penalidades", () => {
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain("8B-penalidades-detalle");
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain("10-demora-detalle");
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain("10-medioambiental-detalle");
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain("10,00 € sin IVA por cada día hábil de retraso");
  });

  it("ancla el 20 por ciento dentro de la causa DA 33 y no en la causa 1", () => {
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain("2. Mayores necesidades reales respecto de las estimadas inicialmente");
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain("20 %");
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain("14-causa1-porcentaje-no-procede");
  });

  it("mantiene como bloqueo real el desglose del PBL cuando el modelo conserva líneas vacías", () => {
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain("2.A. Desglose del PBL");
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain("Contrata-IA no debe inventar esos importes");
  });

  it("queda integrado después de la auditoría 11.2.1", () => {
    expect(ADAPTIVE_FLOW_UI).toContain("SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT");
    expect(ADAPTIVE_FLOW_UI).toContain("Contrata-IA Paso 11.2.2 auditoría integral");
  });
});
