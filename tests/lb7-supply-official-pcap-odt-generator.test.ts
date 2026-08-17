import { describe, expect, it } from "vitest";
import { SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT } from "../src/interfaces/lb7/SupplyOfficialPcapOdtGeneratorScript";
import { ADAPTIVE_FLOW_UI } from "../src/interfaces/lb7/AdaptiveFlowUi";

describe("Paso 11 - ODT oficial parametrizado", () => {
  it("compila el módulo aislado sin error de sintaxis", () => {
    expect(() => new Function(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT)).not.toThrow();
  });

  it("trabaja sobre el ODT oficial y exige destinos estructurales esenciales", () => {
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("2025_12_17_pcap_suministro_abierto_simplificado_abreviado_autofinanciada.odt");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("content.xml");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("1.C. CONTRATO EN FUNCIÓN DE LAS NECESIDADES");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("Importe total (IVA excluido):");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("Valor estimado del contrato:");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("14. MODIFICACIONES DEL CONTRATO");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("Destinos no reconocidos");
  });

  it("preserva la estabilidad del flujo y mantiene el paso 11 aislado", () => {
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).not.toContain("MutationObserver");
    expect(ADAPTIVE_FLOW_UI).toContain("Contrata-IA Paso 8 aislado:");
    expect(ADAPTIVE_FLOW_UI).toContain("Contrata-IA Paso 9 borrador editable:");
    expect(ADAPTIVE_FLOW_UI).toContain("Contrata-IA Paso 10 inserción PCAP oficial:");
    expect(ADAPTIVE_FLOW_UI).toContain("Contrata-IA Paso 11 ODT oficial:");
  });

  it("mantiene separadas las magnitudes económicas", () => {
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("supplyCurrentTenderBudgetExVat");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("supplyMaximumApprovedBudgetExVat");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("supplyEstimatedValueExVat");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).not.toContain("DA33_PBL_EQUALS_MAXIMUM_APPROVED_BUDGET");
  });

  it("construye una cabecera central ZIP válida y se autoverifica antes de descargar", () => {
    const validCentralHeader = "put16(20),put16(20),put16(2048),put16(0),put16(0),put16(0x5c21),put32(crc)";
    const corruptCentralHeader = "put16(20),put16(20),put16(2048),put16(0),put16(0),put16(0),put16(0x5c21),put32(crc)";
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain(validCentralHeader);
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).not.toContain(corruptCentralHeader);
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("var output=writeStoredZip(entries);await readZip(output)");
  });
});
