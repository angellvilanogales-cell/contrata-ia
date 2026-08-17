import { describe, expect, it } from "vitest";
import { SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT } from "../src/interfaces/lb7/SupplyOfficialTemplatePendingFieldsScript";

describe("Paso 8 · relación PBL inicial y presupuesto máximo DA33", () => {
  it("compila de forma aislada", () => {
    expect(() => new Function(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT)).not.toThrow();
  });

  it("recupera el PBL inicial documentado y lo mantiene separado del presupuesto máximo", () => {
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("SOURCE_INITIAL_PBL_EX_VAT=10552.44");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("SOURCE_INITIAL_PBL_INC_VAT=12768.45");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("INITIAL_PBL_DISTINCT_FROM_DA33_MAXIMUM_BUDGET");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("PBL de la duración inicial");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("Presupuesto máximo DA 33.ª para toda la vigencia");
  });

  it("migra expresamente la antigua igualdad incorrecta sin volver a imponerla", () => {
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("migrateIncorrectEquality");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain('oldRelation=a.supplyCurrentTenderBudgetRelationship===\"DA33_PBL_EQUALS_MAXIMUM_APPROVED_BUDGET\"');
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).not.toContain("var proposedPbl=pbl>0?pbl:budget");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).not.toContain("Math.abs(pbl-budget)>0.01");
  });
});
