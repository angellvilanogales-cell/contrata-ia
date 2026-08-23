import { describe, expect, it } from "vitest";
import { qualifyRealTemplateMapping } from "../src/application/intake/lb22/UniversalRealTemplateMappingRegistry";
import { JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY } from "../src/application/intake/lb23/JuntaOfficialEditableTemplateDiscovery";
import {
  JDA_SUPPLY_ASA_EXPANDED_EDITABLE_ASSET,
  JDA_SUPPLY_ASA_EXPANDED_PHYSICAL_BINDINGS,
  JDA_SUPPLY_ASA_EXPANDED_RENDERER_CONFIGURATION,
  JDA_SUPPLY_ASA_LB28_REMAINING_PHYSICAL_BLOCKERS,
  JDA_SUPPLY_ASA_PRODUCTION_MAPPING_PROFILE,
} from "../src/application/intake/lb28/JuntaSupplyAsaExpandedPhysicalProfile";

describe("LB28 - ampliación física del Anexo I oficial", () => {
  it("mantiene inventario exacto entre activo y bindings físicos", () => {
    expect(JDA_SUPPLY_ASA_EXPANDED_EDITABLE_ASSET.slotIds.length).toBe(JDA_SUPPLY_ASA_EXPANDED_PHYSICAL_BINDINGS.length);
    expect(new Set(JDA_SUPPLY_ASA_EXPANDED_EDITABLE_ASSET.slotIds).size).toBe(JDA_SUPPLY_ASA_EXPANDED_EDITABLE_ASSET.slotIds.length);
    expect(new Set(JDA_SUPPLY_ASA_EXPANDED_PHYSICAL_BINDINGS.map(item => item.slotId)).size).toBe(JDA_SUPPLY_ASA_EXPANDED_PHYSICAL_BINDINGS.length);
    expect(JDA_SUPPLY_ASA_EXPANDED_EDITABLE_ASSET.slotIds).toContain("pcap.anexoI.1A.justificacionNoDivision");
    expect(JDA_SUPPLY_ASA_EXPANDED_EDITABLE_ASSET.slotIds).toContain("pcap.anexoI.1C.da33");
    expect(JDA_SUPPLY_ASA_EXPANDED_EDITABLE_ASSET.slotIds).toContain("pcap.anexoI.2B.metodoCalculo");
    expect(JDA_SUPPLY_ASA_EXPANDED_EDITABLE_ASSET.slotIds).toContain("pcap.anexoI.3.preavisoProrroga");
  });

  it("cualifica el perfil de producción contra el original oficial validado", () => {
    const result = qualifyRealTemplateMapping(JDA_SUPPLY_ASA_PRODUCTION_MAPPING_PROFILE, [JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY]);
    expect(result.structurallyVerified).toBe(true);
    expect(result.productionEligible).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.mappingSpec?.templateId).toBe(JDA_SUPPLY_ASA_EXPANDED_EDITABLE_ASSET.templateId);
  });

  it("formatea únicamente decisiones y magnitudes compatibles con el perfil certificado", () => {
    const formatters = JDA_SUPPLY_ASA_EXPANDED_RENDERER_CONFIGURATION.formattersBySlotId!;
    expect(formatters["pcap.anexoI.1C.da33"]?.(true, "economic.needsBasedContractDa33")).toBe("Sí");
    // Intl es-ES no agrupa cuatro cifras en todos los runtimes ICU; se preservan siempre dos decimales y coma decimal.
    expect(formatters["pcap.anexoI.2A.iva"]?.(221_601, "economic.initialVatAmountCents")).toBe("2216,01");
    expect(formatters["pcap.anexoI.2A.pblIncVat"]?.(1_276_845, "economic.initialPblVatIncludedCents")).toBe("12.768,45");
    expect(formatters["pcap.anexoI.3.posibilidadProrroga"]?.(24, "extensionMonths")).toBe("Sí");
    expect(formatters["pcap.anexoI.3.preavisoProrroga"]?.(2, "execution.extensionNoticeMonths")).toBe("2 meses");
    expect(formatters["pcap.anexoI.2C.revisionPreciosCorto"]?.("No procede", "economic.priceRevisionRegime")).toBe("No");
    expect(() => formatters["pcap.anexoI.2C.revisionPreciosCorto"]?.("Sí, fórmula X", "economic.priceRevisionRegime")).toThrow(/solo certifica físicamente/i);
  });

  it("conserva bloqueados los controles y tablas que todavía no pueden editarse sin riesgo", () => {
    expect(JDA_SUPPLY_ASA_LB28_REMAINING_PHYSICAL_BLOCKERS).toHaveLength(5);
    expect(JDA_SUPPLY_ASA_LB28_REMAINING_PHYSICAL_BLOCKERS.join(" ")).toMatch(/anualidades/i);
    expect(JDA_SUPPLY_ASA_LB28_REMAINING_PHYSICAL_BLOCKERS.join(" ")).toMatch(/controles ODF/i);
    expect(JDA_SUPPLY_ASA_LB28_REMAINING_PHYSICAL_BLOCKERS.join(" ")).toMatch(/modificación prevista/i);
  });
});
