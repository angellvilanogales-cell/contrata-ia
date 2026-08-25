import { describe, expect, it } from "vitest";
import { SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT } from "../src/interfaces/lb7/SupplyOfficialTemplateParameterizationScript";
import { SUPPLY_FINALIZATION_SCRIPT } from "../src/interfaces/lb7/SupplyFinalizationScript";

describe("LB7 supply official template parameterization", () => {
  it("maps the official Annex I destinations without inventing economic data", () => {
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("7. Parametrización del Anexo I del DPCAF / PCAP oficial");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("Anexo I · apartado 1");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("Anexo I · apartado 2");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("Anexo I · apartado 3");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("Anexo I · apartado 7");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("Anexo I · apartado 8");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("Anexo I · apartado 10");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("Anexo I · apartado 14");
  });

  it("keeps current PBL and budget allocation under explicit validation", () => {
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("No se reutiliza automáticamente el PBL de versiones anteriores ni se copia por identidad el presupuesto máximo");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("Las anualidades y aplicaciones presupuestarias anteriores no se reutilizan automáticamente");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("parámetros de ofertas anormalmente bajas");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PARAMETERIZATION_SCRIPT).toContain("no se inventarán parámetros ni criterios de desempate");
  });

  it("is present in the composed finalization script", () => {
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("7. Parametrización del Anexo I del DPCAF / PCAP oficial");
  });
});
