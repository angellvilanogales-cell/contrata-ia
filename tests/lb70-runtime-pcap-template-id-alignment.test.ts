import { describe, expect, it } from "vitest";
import { V1_RUNTIME_ASSET_MANIFEST } from "../src/application/intake/lb53/VerifiedRuntimeTemplateStore";
import { JDA_SUPPLY_ASA_TEMPLATE_ID } from "../src/application/intake/lb25/JuntaSupplyAsaOfficialActivation";

describe("LB70 - identidad runtime PCAP alineada con renderer protegido", () => {
  it("usa el templateId físico que solicita UniversalOdtProductionRenderer", () => {
    const pcap = V1_RUNTIME_ASSET_MANIFEST.find(item => item.kind === "PCAP");
    expect(pcap?.templateId).toBe(JDA_SUPPLY_ASA_TEMPLATE_ID);
    expect(pcap?.sourceId).toBe("jda:cccp:pcap:supply:asa:autofinanced:2025-12-17:odt");
    expect(pcap?.sha256).toBe("45e1e6b16ec41d77206d3ef385c70f87c9120bb0ccce4e43d9a24d245812cadc");
  });
});
