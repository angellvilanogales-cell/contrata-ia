import { describe, expect, it } from "vitest";
import {
  JDA_SUPPLY_ASA_ACTIVATION_LIMITATIONS,
  JDA_SUPPLY_ASA_EDITABLE_ASSET,
  JDA_SUPPLY_ASA_PHYSICAL_BINDINGS,
  JDA_SUPPLY_ASA_RENDERER_CONFIGURATION,
  JDA_SUPPLY_ASA_VERIFIED_MANIFEST,
} from "../src/application/intake/lb25/JuntaSupplyAsaOfficialActivation";
import { JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY } from "../src/application/intake/lb23/JuntaOfficialEditableTemplateDiscovery";

describe("V1 activation - original ODT oficial suministro ASA", () => {
  it("registra identidad, tamaño y hashes físicos verificados", () => {
    expect(JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY.qualification).toBe("OFFICIAL_EDITABLE_ORIGINAL");
    expect(JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY.humanValidated).toBe(true);
    expect(JDA_SUPPLY_ASA_VERIFIED_MANIFEST.byteLength).toBe(508759);
    expect(JDA_SUPPLY_ASA_VERIFIED_MANIFEST.contentHash).toBe("sha256:45e1e6b16ec41d77206d3ef385c70f87c9120bb0ccce4e43d9a24d245812cadc");
    expect(JDA_SUPPLY_ASA_VERIFIED_MANIFEST.styleFingerprint).toBe("sha256:9eb23463f4d56abd03531cb909206ef47d749054bf284087bd45867b39e6ceee");
    expect(JDA_SUPPLY_ASA_EDITABLE_ASSET.sourceId).toBe(JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY.sourceId);
  });

  it("mantiene un binding exacto por cada slot registrado y preserva un valueToken interior", () => {
    expect(JDA_SUPPLY_ASA_PHYSICAL_BINDINGS).toHaveLength(JDA_SUPPLY_ASA_EDITABLE_ASSET.slotIds.length);
    expect(new Set(JDA_SUPPLY_ASA_PHYSICAL_BINDINGS.map(item => item.slotId)).size).toBe(JDA_SUPPLY_ASA_PHYSICAL_BINDINGS.length);
    for (const binding of JDA_SUPPLY_ASA_PHYSICAL_BINDINGS) {
      expect(binding.xmlToken.length).toBeGreaterThan(20);
      expect(binding.valueToken).toBeTruthy();
      expect(binding.xmlToken.split(binding.valueToken ?? "").length - 1).toBe(1);
    }
  });

  it("bloquea silenciosamente alcances todavía no certificados", () => {
    const criteria = JDA_SUPPLY_ASA_RENDERER_CONFIGURATION.formattersBySlotId?.["pcap.anexoI.7.criterios"];
    const lots = JDA_SUPPLY_ASA_RENDERER_CONFIGURATION.formattersBySlotId?.["pcap.anexoI.1A.lotes"];
    expect(criteria?.([{ nombre: "Precio", ponderacion: 100, evaluableMedianteFormula: true }], "criteria.awardCriteria")).toBe("Sí");
    expect(() => criteria?.([{ nombre: "Precio", ponderacion: 80, evaluableMedianteFormula: true }, { nombre: "Plazo", ponderacion: 20, evaluableMedianteFormula: true }], "criteria.awardCriteria")).toThrow(/criterio único precio/);
    expect(() => lots?.([], "lots.lots")).toThrow(/exactamente un lote/);
    expect(JDA_SUPPLY_ASA_ACTIVATION_LIMITATIONS.join(" ")).toMatch(/resto de campos.*todavía automatizados/i);
  });
});
