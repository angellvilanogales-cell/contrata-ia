import { describe, expect, it } from "vitest";
import { SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT } from "../src/interfaces/lb7/SupplyOfficialTemplateParameterizationScript";

describe("LB7 supply official template parameterization DA33 consistency", () => {
  it("recovers only stable administrative data from the real ferreteria PCAP", () => {
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("CONTR/2026/240267");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain('locality:"SEVILLA"');
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain('nuts:"ES618"');
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("SOURCE_PCAP_CONTR_2026_240267");
  });

  it("keeps the previous economic configuration as historical and non reusable", () => {
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("HISTORICAL_SUPERSEDED_BY_DA33_REVIEW");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("Configuración económica anterior del expediente");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("no se reutiliza automáticamente");
  });

  it("separates DA33 maximum budget, current PBL and estimated value", () => {
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("Presupuesto máximo DA 33.ª para toda la vigencia");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("PBL / presupuesto base de licitación vigente");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("Valor estimado");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("supplyCurrentTenderBudgetExVat");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("supplyCurrentTenderBudgetValidated");
  });
});
