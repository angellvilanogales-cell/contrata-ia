import { describe, expect, it } from "vitest";
import { SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT } from "../src/interfaces/lb7/SupplyOfficialTemplatePendingFieldsScript";
import { SUPPLY_OFFICIAL_ANNEX_DRAFT_SCRIPT } from "../src/interfaces/lb7/SupplyOfficialAnnexDraftScript";
import { SUPPLY_OFFICIAL_PCAP_INSERTION_CONTROL_SCRIPT } from "../src/interfaces/lb7/SupplyOfficialPcapInsertionControlScript";
import { ADAPTIVE_FLOW_UI } from "../src/interfaces/lb7/AdaptiveFlowUi";

describe("Suministro DA 33 - PBL inicial, presupuesto máximo y Paso 10", () => {
  it("mantiene separadas las tres magnitudes económicas del expediente", () => {
    expect(() => new Function(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT)).not.toThrow();
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("SOURCE_INITIAL_PBL_EX_VAT=10552.44");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("SOURCE_INITIAL_PBL_INC_VAT=12768.45");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("INITIAL_PBL_DISTINCT_FROM_DA33_MAXIMUM_BUDGET");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("1439010000 G/32L/22000/00 01");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("2026,amount:1596.06");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("2027,amount:6384.23");
    expect(SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT).toContain("2028,amount:4788.16");
  });

  it("genera el borrador corregido sin confundir PBL y presupuesto máximo", () => {
    expect(() => new Function(SUPPLY_OFFICIAL_ANNEX_DRAFT_SCRIPT)).not.toThrow();
    expect(SUPPLY_OFFICIAL_ANNEX_DRAFT_SCRIPT).toContain("Presupuesto base de licitación correspondiente a la duración inicial");
    expect(SUPPLY_OFFICIAL_ANNEX_DRAFT_SCRIPT).toContain("Presupuesto máximo DA 33.ª para toda la vigencia");
    expect(SUPPLY_OFFICIAL_ANNEX_DRAFT_SCRIPT).toContain("ANNEX_I_PARAMETERIZED_DRAFT_CORRECTED_NOT_FULL_OFFICIAL_PCAP");
  });

  it("vincula el paso 10 al ODT oficial y al apartado 14 de modificaciones", () => {
    expect(() => new Function(SUPPLY_OFFICIAL_PCAP_INSERTION_CONTROL_SCRIPT)).not.toThrow();
    expect(SUPPLY_OFFICIAL_PCAP_INSERTION_CONTROL_SCRIPT).toContain("2025_12_17_pcap_suministro_abierto_simplificado_abreviado_autofinanciada.odt");
    expect(SUPPLY_OFFICIAL_PCAP_INSERTION_CONTROL_SCRIPT).toContain("Anexo I · apartado 14");
    expect(SUPPLY_OFFICIAL_PCAP_INSERTION_CONTROL_SCRIPT).toContain("COPY_OFFICIAL_ODT_AND_REPLACE_ONLY_ANNEX_I_VARIABLE_DESTINATIONS");
    expect(ADAPTIVE_FLOW_UI).toContain("SUPPLY_OFFICIAL_PCAP_INSERTION_CONTROL_SCRIPT");
  });
});
