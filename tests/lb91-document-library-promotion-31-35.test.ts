import { describe, expect, it } from "vitest";
import { DocumentType } from "../src/domain/documentModel/DocumentType";
import { TipoProcedimiento } from "../src/domain/procedimiento/TipoProcedimiento";
import {
  SOURCE_BACKED_DOCUMENT_ASSETS,
  getGeneralOfficialGenerationCandidates,
} from "../src/domain/documentModel/SourceBackedDocumentAssetCatalogue";
import { assessGeneralOfficialAssetPromotion } from "../src/domain/documentModel/GeneralOfficialEditableAssetPromotion";
import { assessUniversalDocumentLibrary } from "../src/domain/documentModel/UniversalDocumentLibraryReadiness";
import { assessConcessionDocumentEvidence } from "../src/domain/documentModel/ConcessionDocumentEvidenceGate";
import { assessMixedContractDocumentSelection } from "../src/domain/documentModel/MixedContractDocumentSelectionGate";

describe("LB91.31-35 - promoción documental física", () => {
  it("promueve solo el PCAP oficial general de suministro ASA, no los activos de caso", () => {
    const candidates = getGeneralOfficialGenerationCandidates();
    expect(candidates.some(item => item.id === "JDA-SUPPLY-ASA-AUTOFINANCED-PCAP-OFFICIAL")).toBe(true);
    expect(candidates.some(item => item.caseId)).toBe(false);
    const protectedAsset = SOURCE_BACKED_DOCUMENT_ASSETS.find(item => item.id === "FERRETERIA-PCAP-PROTECTED-EDITABLE")!;
    expect(assessGeneralOfficialAssetPromotion(protectedAsset).promotable).toBe(false);
  });

  it("mantiene servicios bloqueados cuando la fuente general disponible es solo PDF", () => {
    const service = SOURCE_BACKED_DOCUMENT_ASSETS.find(item => item.id === "SERVICE-PCAP-OPEN-REAL-SOURCE")!;
    const result = assessGeneralOfficialAssetPromotion(service);
    expect(result.promotable).toBe(false);
    expect(result.blockers.join(" ")).toContain("editable");
  });

  it("reconoce PCAP de suministro ASA pero no declara paquete universal sin Memoria y PPT generales", () => {
    const result = assessUniversalDocumentLibrary("SUPPLY", TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO);
    expect(result.readyDocuments).toContain(DocumentType.PCAP);
    expect(result.missingDocuments).toContain(DocumentType.MEMORY);
    expect(result.missingDocuments).toContain(DocumentType.PPT);
    expect(result.universalPackageReady).toBe(false);
  });

  it("mantiene concesiones documentalmente bloqueadas mientras no exista caso real y modelo editable", () => {
    const result = assessConcessionDocumentEvidence();
    expect(result.realCaseEvidenceLocated).toBe(false);
    expect(result.editableModelLocated).toBe(false);
    expect(result.blockers.length).toBe(2);
  });

  it("no hereda ciegamente documentos de la prestación principal en un mixto", () => {
    const result = assessMixedContractDocumentSelection({
      principalContractType: "SUPPLY",
      procedure: TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO,
      mixedSpecificClausesRequired: true,
    });
    expect(result.ready).toBe(false);
    expect(result.blockers.some(item => item.includes("cláusulas específicas"))).toBe(true);
    expect(result.blockers.some(item => item.includes("MEMORY"))).toBe(true);
  });
});
