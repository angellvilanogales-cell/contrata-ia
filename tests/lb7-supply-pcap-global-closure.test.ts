import { describe, expect, it } from "vitest";
import { SUPPLY_PCAP_GLOBAL_CLOSURE_SCRIPT } from "../src/interfaces/lb7/SupplyPcapGlobalClosureScript";
import { ADAPTIVE_FLOW_UI } from "../src/interfaces/lb7/AdaptiveFlowUi";

describe("Paso 11.3 - cierre global del PCAP", () => {
  it("compila de forma aislada", () => {
    expect(() => new Function(SUPPLY_PCAP_GLOBAL_CLOSURE_SCRIPT)).not.toThrow();
  });

  it("recupera la referencia del informe jurídico del expediente", () => {
    expect(SUPPLY_PCAP_GLOBAL_CLOSURE_SCRIPT).toContain("Asesoría Jurídica del Servicio Andaluz de Empleo");
    expect(SUPPLY_PCAP_GLOBAL_CLOSURE_SCRIPT).toContain("29 de julio de 2026");
    expect(SUPPLY_PCAP_GLOBAL_CLOSURE_SCRIPT).toContain("AJ-SAE 2026/16");
  });

  it("propone la penalidad de subcontratación sin superar el máximo legal", () => {
    expect(SUPPLY_PCAP_GLOBAL_CLOSURE_SCRIPT).toContain("SUBCONTRACT_PERCENT=20");
    expect(SUPPLY_PCAP_GLOBAL_CLOSURE_SCRIPT).toContain("artículo 215.3 LCSP");
    expect(SUPPLY_PCAP_GLOBAL_CLOSURE_SCRIPT).toContain("hasta el 50 %");
    expect(SUPPLY_PCAP_GLOBAL_CLOSURE_SCRIPT).toContain("Validar propuestas del cierre global");
  });

  it("limpia únicamente campos subordinados ya cerrados en No/No procede", () => {
    expect(SUPPLY_PCAP_GLOBAL_CLOSURE_SCRIPT).toContain("no se prevén pagos directos a subcontratistas");
    expect(SUPPLY_PCAP_GLOBAL_CLOSURE_SCRIPT).toContain("Porcentaje reservado: No procede");
    expect(SUPPLY_PCAP_GLOBAL_CLOSURE_SCRIPT).toContain("Mecanismos de control: No procede");
  });

  it("está integrado después del cierre del PBL", () => {
    expect(ADAPTIVE_FLOW_UI).toContain("SUPPLY_PCAP_GLOBAL_CLOSURE_SCRIPT");
    expect(ADAPTIVE_FLOW_UI.indexOf("SUPPLY_PCAP_GLOBAL_CLOSURE_SCRIPT")).toBeGreaterThan(
      ADAPTIVE_FLOW_UI.indexOf("SUPPLY_PBL_BREAKDOWN_PROPOSAL_SCRIPT"),
    );
  });
});
