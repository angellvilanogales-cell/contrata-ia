import { describe, expect, it } from "vitest";
import { SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT } from "../src/interfaces/lb7/SupplyOfficialPcapOdtGeneratorScript";
import { ADAPTIVE_FLOW_UI } from "../src/interfaces/lb7/AdaptiveFlowUi";

describe("Paso 11.1 - ODT oficial parametrizado estructuralmente", () => {
  it("compila el módulo aislado sin error de sintaxis", () => {
    expect(() => new Function(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT)).not.toThrow();
  });

  it("trabaja sobre el ODT oficial y exige destinos estructurales esenciales", () => {
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("2025_12_17_pcap_suministro_abierto_simplificado_abreviado_autofinanciada.odt");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("content.xml");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("1.C. CONTRATO EN FUNCIÓN DE LAS NECESIDADES");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("Importe total (IVA excluido):");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("Método de cálculo:");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("Plazo total (en meses):");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("7.B. PARÁMETROS OBJETIVOS PARA CONSIDERAR UNA OFERTA ANORMALMENTE BAJA");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("Condición especial de ejecución de tipo ambiental o social");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("Penalidades por cumplimiento defectuoso:");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("2. Mayores necesidades reales respecto de las estimadas inicialmente");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("Destinos estructurales no reconocidos");
  });

  it("rellena anualidades tanto en tabla ODF como con cabeceras visuales fragmentadas", () => {
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("firstFollowingTable");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("fillAnnualitiesAsParagraphs");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("yearHeaderIndex");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("amountHeaderIndex");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("headerEndIndex=Math.max(yearHeaderIndex,amountHeaderIndex,budgetHeaderIndex)");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("setTabbedParagraph");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("text:tab");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("Anualidades (IVA incluido)");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("TRAMITACIÓN DEL GASTO");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("clearCellAndSet(dataRows[k].cells[0],String(vals[k].year))");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("setTabbedParagraph(rowParas[k],[String(vals[k].year),money(vals[k].amount),String(a.supplyCurrentBudgetApplication||\"\")])");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).not.toContain('if(ht.indexOf("AÑO")>=0&&ht.indexOf("IMPORTE")>=0){headerIndex=h');
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("2a-tabla-anualidades");
  });

  it("preserva la expresión regular de espacios al compilar el script embebido", () => {
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain('replace(/\\s+/g," ")');
  });

  it("localiza el porcentaje del apartado 14 por contenido y no por guion o inicio exacto", () => {
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("function findContains");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("function setContains");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("Porcentaje máximo del precio del contrato al que pueda afectar");
    expect(SUPPLY_OFFICIAL_PCAP_ODT_GENERATOR_SCRIPT).toContain("14-porcentaje");
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
