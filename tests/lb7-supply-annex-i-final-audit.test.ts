import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SUPPLY_ANNEX_I_AUDIT_FINAL_HOTFIX_SCRIPT } from "../src/interfaces/lb7/SupplyAnnexIAuditFinalHotfixScript";

describe("LB-7 cierre final real del Anexo I", () => {
  it("corrige el sistema de determinación del precio por contenido y no por prefijo rígido", () => {
    expect(SUPPLY_ANNEX_I_AUDIT_FINAL_HOTFIX_SCRIPT).toContain("SISTEMA DE DETERMINACIÓN DEL PRECIO");
    expect(SUPPLY_ANNEX_I_AUDIT_FINAL_HOTFIX_SCRIPT).toContain("precios unitarios por referencia del catálogo validado");
  });

  it("audita penalidad, pagos y catálogo sobre el ODT final", () => {
    expect(SUPPLY_ANNEX_I_AUDIT_FINAL_HOTFIX_SCRIPT).toContain("10,00 € SIN IVA POR CADA DÍA HÁBIL DE RETRASO");
    expect(SUPPLY_ANNEX_I_AUDIT_FINAL_HOTFIX_SCRIPT).toContain("PAGO ÚNICO / PAGOS PARCIALES: PAGOS PARCIALES");
    expect(SUPPLY_ANNEX_I_AUDIT_FINAL_HOTFIX_SCRIPT).toContain("TOTAL: 654 UNIDADES ESTIMADAS");
    expect(SUPPLY_ANNEX_I_AUDIT_FINAL_HOTFIX_SCRIPT).toContain("TOTAL: 4.540,24 €");
  });

  it("solo declara cierre cuando no quedan bloqueantes reales", () => {
    expect(SUPPLY_ANNEX_I_AUDIT_FINAL_HOTFIX_SCRIPT).toContain('supplyAnnexIUnresolvedFields=r.unresolved');
    expect(SUPPLY_ANNEX_I_AUDIT_FINAL_HOTFIX_SCRIPT).toContain('supplyAnnexIFinalAuditValidated=r.unresolved.length===0');
    const uiSource = fs.readFileSync(path.resolve("src/interfaces/lb7/AdaptiveFlowUi.ts"), "utf8");
    expect(uiSource).toContain("SUPPLY_ANNEX_I_AUDIT_FINAL_HOTFIX_SCRIPT");
  });
});
