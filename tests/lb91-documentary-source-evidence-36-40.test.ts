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
    const ids = sources.map(item => item.id);
    expect(sources.length).toBeGreaterThanOrEqual(3);
    expect(ids).toContain("CARL-2024-PPT-SERVICE-CLEANING");
    expect(ids).toContain("SAE-HUELVA-PPT-SERVICE-CLEANING");
    expect(ids).toContain("FPE-5G-2024-PPT-SERVICE-TRAINING");
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

  it("reconoce la promoción LB94 de Memoria y PPT supply a plantillas generales derivadas acreditadas", () => {
    const memory = findDocumentarySourceEvidence("SUPPLY", DocumentType.MEMORY)
      .find(item => item.generalizable && item.editableBinaryVerified)!;
    const ppt = findDocumentarySourceEvidence("SUPPLY", DocumentType.PPT)
      .find(item => item.generalizable && item.editableBinaryVerified)!;
    expect(memory.format).toBe("ODT");
    expect(ppt.format).toBe("ODT");
    expect(memory.generalizable).toBe(true);
    expect(ppt.generalizable).toBe(true);
  });

  it("considera generalizables y editables los tres modelos supply actualmente acreditados", () => {
    const general = getGeneralizableEditableEvidence().filter(item => item.contractType === "SUPPLY");
    expect(general).toHaveLength(3);
    expect(general.map(item => item.documentType)).toEqual(expect.arrayContaining([
      DocumentType.PCAP,
      DocumentType.MEMORY,
      DocumentType.PPT,
    ]));
    expect(general.map(item => item.id)).toContain("JDA-SUPPLY-ASA-PCAP-GENERAL-ODT");
  });
});
