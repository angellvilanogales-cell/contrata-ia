import { describe, expect, it } from "vitest";
import { SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT } from "../src/interfaces/lb7/SupplyAnnexIComprehensiveAuditScript";

describe("Paso 11.2.2 - anclaje DA33 en apartado 14", () => {
  it("ancla la búsqueda en el apartado 14 y en la causa 2", () => {
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain('var sec14=idx("14. MODIFICACIONES DEL CONTRATO")');
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain('findIndex(ps,"2. Mayores necesidades reales respecto de las estimadas inicialmente",sec14)');
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain('findIndex(ps,"3. Otras causas de modificación previstas",da+1)');
  });

  it("escribe el 20 por ciento dentro de la causa DA33 y no en la causa 1", () => {
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain("Porcentaje máximo del precio inicial del contrato al que puede afectar esta modificación prevista: 20 %");
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain("Porcentaje máximo del precio del contrato al que pueda afectar: No procede.");
  });

  it("dispone de fallback de inserción si el modelo no expone una línea libre utilizable", () => {
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain("insertAfterParagraph");
    expect(SUPPLY_ANNEX_I_COMPREHENSIVE_AUDIT_SCRIPT).toContain("14-da33-porcentaje-insertado");
  });
});
