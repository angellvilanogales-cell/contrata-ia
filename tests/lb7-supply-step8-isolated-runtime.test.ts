import { describe, expect, it } from "vitest";
import { SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT } from "../src/interfaces/lb7/SupplyOfficialTemplatePendingFieldsScript";

describe("LB-7 Paso 8 aislado", () => {
  it("compila como JavaScript antes de integrarse en /adaptive", () => {
    expect(() => new Function(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT)).not.toThrow();
  });

  it("mantiene los cuatro bloques de cierre previstos", () => {
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("8.1 PBL vigente");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("8.2 Aplicación presupuestaria y anualidades");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("8.3 Oferta anormalmente baja y desempate");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("8.4 Penalidades específicas");
  });

  it("evita el patrón de salto de línea que rompió el script generado", () => {
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("String.fromCharCode(10)");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).not.toContain("MutationObserver");
  });

  it("permanece desacoplado del script final mientras no se valide aisladamente", async () => {
    const finalization = await import("../src/interfaces/lb7/SupplyFinalizationScript");
    expect(finalization.SUPPLY_FINALIZATION_SCRIPT).not.toContain("8. Cierre de campos pendientes del Anexo I");
  });
});
