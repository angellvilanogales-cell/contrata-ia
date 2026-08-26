import { describe, expect, it } from "vitest";
import { DocumentType } from "../src/domain/documentModel/DocumentType";
import { TipoProcedimiento } from "../src/domain/procedimiento/TipoProcedimiento";
import {
  findDocumentarySourceEvidence,
  getGeneralizableEditableEvidence,
} from "../src/domain/documentModel/DocumentarySourceEvidenceCatalogue";
import { createStandardContractDocumentProfiles } from "../src/domain/documentModel/StandardContractDocumentProfiles";

describe("LB91.36-40 - explotación conservadora de fuentes documentales", () => {
  it("reconoce varias fuentes reales independientes para PPT de servicios", () => {
    const sources = findDocumentarySourceEvidence("SERVICE", DocumentType.PPT);
    expect(sources.length).toBeGreaterThanOrEqual(3);
    expect(new Set(sources.map(item => item.id))).toEqual(expect.objectContaining(new Set([
      "CARL-2024-PPT-SERVICE-CLEANING",
      "SAE-HUELVA-PPT-SERVICE-CLEANING",
      "FPE-5G-2024-PPT-SERVICE-TRAINING",
    ])));
    expect(sources.every(item => item.generalizable === false)).toBe(true);
  });

  it("incorpora el PCAP real de servicios por abierto simplificado ordinario como perfil lógico, no físico", () => {
    const registry = createStandardContractDocumentProfiles();
    const profile = registry.findAll("SERVICE", DocumentType.PCAP)
      .find(item => item.id === "SERVICE-PCAP-SIMPLIFIED-ORDINARY-CARL-2024");
    expect(profile?.coverage).toBe("FULL_MODEL");
    expect(profile?.generationAllowed).toBe(true);
    expect(profile?.applicableProcedures).toContain(TipoProcedimiento.ABIERTO_SIMPLIFICADO);
  });

  it("no convierte un PDF real de servicios en activo editable general", () => {
    const source = findDocumentarySourceEvidence("SERVICE", DocumentType.PCAP)
      .find(item => item.id === "CARL-2024-PCAP-SERVICE-SIMPLIFIED-ORDINARY")!;
    expect(source.format).toBe("PDF");
    expect(source.editableBinaryVerified).toBe(false);
    expect(source.generalizable).toBe(false);
  });

  it("mantiene Memoria y PPT editables de ferretería como fuentes de caso, no universales", () => {
    const memory = findDocumentarySourceEvidence("SUPPLY", DocumentType.MEMORY)[0]!;
    const ppt = findDocumentarySourceEvidence("SUPPLY", DocumentType.PPT)[0]!;
    expect(memory.format).toBe("ODT");
    expect(ppt.format).toBe("ODT");
    expect(memory.generalizable).toBe(false);
    expect(ppt.generalizable).toBe(false);
  });

  it("solo considera generalizable y editable el PCAP oficial supply ASA actualmente acreditado", () => {
    const general = getGeneralizableEditableEvidence();
    expect(general).toHaveLength(1);
    expect(general[0].id).toBe("JDA-SUPPLY-ASA-PCAP-GENERAL-ODT");
  });
});
