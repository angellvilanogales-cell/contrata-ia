import { describe, expect, it } from "vitest";
import { DocumentType } from "../src/domain/documentModel/DocumentType";
import { createStandardContractDocumentProfiles } from "../src/domain/documentModel/StandardContractDocumentProfiles";

describe("Bloque 12.4 - perfiles documentales por tipo de contrato", () => {
  it("registra PCAP de servicios como modelo lógico completo y generable", () => {
    const registry = createStandardContractDocumentProfiles();
    const profile = registry.find("SERVICE", DocumentType.PCAP);

    expect(profile?.coverage).toBe("FULL_MODEL");
    expect(profile?.generationAllowed).toBe(true);
    expect(profile?.definition.sections.map(section => section.id)).toContain("ANNEX_I");
    expect(profile?.definition.sections.map(section => section.id)).toContain("SERVICE_ANNEXES");
    expect(registry.canGenerateFullDocument("SERVICE", DocumentType.PCAP)).toBe(true);
  });

  it("no eleva un PPT estructural de servicios a plantilla universal completa", () => {
    const registry = createStandardContractDocumentProfiles();
    const profile = registry.find("SERVICE", DocumentType.PPT);

    expect(profile?.coverage).toBe("STRUCTURAL_MODEL");
    expect(profile?.generationAllowed).toBe(false);
    expect(registry.canGenerateFullDocument("SERVICE", DocumentType.PPT)).toBe(false);
  });

  it("conserva el perfil histórico de Anexo I y añade el PCAP oficial completo de suministro ASA", () => {
    const registry = createStandardContractDocumentProfiles();
    const profile = registry.find("SUPPLY", DocumentType.PCAP);
    const all = registry.findAll("SUPPLY", DocumentType.PCAP);
    const full = all.find(item => item.id === "SUPPLY-PCAP-ASA-AUTOFINANCED-JDA-2025-12");

    expect(profile?.coverage).toBe("ANNEX_I_ONLY");
    expect(profile?.generationAllowed).toBe(false);
    expect(profile?.definition.id).toBe("PCAP_SUPPLY_ANNEX_I_JDA_2025_12");
    expect(full?.coverage).toBe("FULL_MODEL");
    expect(full?.generationAllowed).toBe(true);
    expect(registry.canGenerateFullDocument("SUPPLY", DocumentType.PCAP)).toBe(true);
  });

  it("registra el PPT de suministros por necesidades como patrón estructural, no universal", () => {
    const registry = createStandardContractDocumentProfiles();
    const profile = registry.find("SUPPLY", DocumentType.PPT);

    expect(profile?.coverage).toBe("STRUCTURAL_MODEL");
    expect(profile?.generationAllowed).toBe(false);
    expect(profile?.definition.sections.map(section => section.id)).toContain("ESTIMATED_CONSUMPTION");
    expect(profile?.definition.sections.map(section => section.id)).toContain("DEFECTIVE_GOODS");
  });
});
