import { describe, expect, it } from "vitest";
import { SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT } from "../src/interfaces/lb7/SupplyOfficialTemplatePendingFieldsScript";

describe("Paso 8 · relación PBL y presupuesto máximo DA33", () => {
  it("compila de forma aislada", () => {
    expect(() => new Function(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT)).not.toThrow();
  });

  it("preconfigura el PBL desde el presupuesto máximo y mantiene separado el valor estimado", () => {
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("var proposedPbl=pbl>0?pbl:budget");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("var proposedVat=vat>0?vat:21");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("PBL / presupuesto máximo vigente");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("La magnitud que permanece separada es el valor estimado");
  });

  it("impide validar un PBL distinto del presupuesto máximo DA33", () => {
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("Math.abs(pbl-budget)>0.01");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("DA33_PBL_EQUALS_MAXIMUM_APPROVED_BUDGET");
  });
});
