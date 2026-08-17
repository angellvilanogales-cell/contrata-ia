import { describe, expect, it } from "vitest";
import { SUPPLY_ANNEX_I_AUDIT_FINAL_HOTFIX_SCRIPT } from "../src/interfaces/lb7/SupplyAnnexIAuditFinalHotfixScript";

describe("LB-7 cierre final Anexo I", () => {
  it("acepta el total monetario que LibreOffice/ODT serializa sin separador de miles", () => {
    expect(SUPPLY_ANNEX_I_AUDIT_FINAL_HOTFIX_SCRIPT).toContain('TOTAL: 4540,24 €');
    expect(SUPPLY_ANNEX_I_AUDIT_FINAL_HOTFIX_SCRIPT).toContain('TOTAL: 4.540,24 €');
  });

  it("exige las 98 denominaciones reales del catálogo además de los totales", () => {
    expect(SUPPLY_ANNEX_I_AUDIT_FINAL_HOTFIX_SCRIPT).toContain('catalogue.items.length===98');
    expect(SUPPLY_ANNEX_I_AUDIT_FINAL_HOTFIX_SCRIPT).toContain('catalogue.items.every');
    expect(SUPPLY_ANNEX_I_AUDIT_FINAL_HOTFIX_SCRIPT).toContain('TOTAL: 654 UNIDADES ESTIMADAS');
  });
});
