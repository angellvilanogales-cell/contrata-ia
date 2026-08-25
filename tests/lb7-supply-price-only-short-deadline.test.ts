import { describe, expect, it } from "vitest";
import { SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT } from "../src/interfaces/lb7/SupplyAwardCriteriaVisibilityHotfixScript";

describe("LB7 suministro: criterio unico de precio con plazo muy reducido", () => {
  it("trata cinco dias como plazo de partida muy reducido y no impone pluralidad", () => {
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("SHORT_DELIVERY_DAYS=5");
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("Validar motivación específica y mantener solo precio");
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).not.toContain("Reconfigurar a pluralidad de criterios automáticos");
  });

  it("mantiene la DA 33 separada y conserva control del articulo 145.3.f", () => {
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("disposición adicional 33.ª");
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("artículo 204 LCSP");
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("artículo 145.3.f LCSP");
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("no se aplica como regla automática general");
  });

  it("para plazos mayores permite revisar pluralidad sin imponerla", () => {
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("puede existir margen para valorar objetivamente una mejora del plazo");
    expect(SUPPLY_AWARD_CRITERIA_VISIBILITY_HOTFIX_SCRIPT).toContain("No se impondrá automáticamente la pluralidad");
  });
});
