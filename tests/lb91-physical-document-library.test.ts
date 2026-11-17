import { describe, expect, it } from "vitest";
import { DocumentType } from "../src/domain/documentModel/DocumentType";
import { TipoProcedimiento } from "../src/domain/procedimiento/TipoProcedimiento";
import { getVerifiedEditableAssets } from "../src/domain/documentModel/SourceBackedDocumentAssetCatalogue";
import { classifyDocumentAssets } from "../src/domain/documentModel/UniversalDocumentAssetClassifier";
import { assessProtectedEditableAssetManifest } from "../src/domain/documentModel/ProtectedEditableAssetManifest";
import { assessUniversalPhysicalModelReadiness } from "../src/domain/documentModel/UniversalPhysicalModelReadiness";
import { buildUniversalPhysicalCoverageMatrix, canClaimUniversalPhysicalDocumentCoverage } from "../src/domain/documentModel/UniversalPhysicalCoverageMatrix";

describe("LB91.26-30 - biblioteca física documental", () => {
  it("inventaría exactamente los tres activos editables verificados del caso protegido de ferretería", () => {
    const assets = getVerifiedEditableAssets();
    expect(assets).toHaveLength(3);
    expect(new Set(assets.map(asset => asset.documentType))).toEqual(new Set([DocumentType.MEMORY, DocumentType.PCAP, DocumentType.PPT]));
    expect(assets.every(asset => asset.caseId === "CONTR/2026/240267" && asset.scope === "CASE_PROTECTED")).toBe(true);
  });

  it("conserva identidad, hash y huella de estilo del PCAP oficial protegido", () => {
    const [pcap] = classifyDocumentAssets({ contractType: "SUPPLY", documentType: DocumentType.PCAP, procedure: TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO, caseId: "CONTR/2026/240267" });
    expect(pcap.asset.templateId).toBe("JDA-PCAP-SUPPLY-ASA-AUTOFINANCED-2025-12-17");
    expect(pcap.asset.sha256).toBe("45e1e6b16ec41d77206d3ef385c70f87c9120bb0ccce4e43d9a24d245812cadc");
    expect(pcap.asset.styleFingerprint).toBe("sha256:9eb23463f4d56abd03531cb909206ef47d749054bf284087bd45867b39e6ceee");
    expect(pcap.usableForCase).toBe(true);
    expect(pcap.usableAsGeneralModel).toBe(false);
  });

  it("no permite reutilizar un activo protegido en otro expediente aunque coincidan tipo y procedimiento", () => {
    const [pcap] = classifyDocumentAssets({ contractType: "SUPPLY", documentType: DocumentType.PCAP, procedure: TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO, caseId: "OTRO-EXPEDIENTE" });
    expect(pcap.usableForCase).toBe(false);
    expect(pcap.blockers[0]).toContain("CONTR/2026/240267");
  });

  it("cierra el manifiesto físico del caso protegido pero mantiene aceptación humana", () => {
    const result = assessProtectedEditableAssetManifest("CONTR/2026/240267");
    expect(result.ready).toBe(true);
    expect(result.assets).toHaveLength(3);
    expect(result.blockers).toEqual([]);
    expect(result.humanAcceptanceRequired).toBe(true);
  });

  it("no confunde una fuente PDF general o un patrón estructural con un modelo editable universal", () => {
    const service = assessUniversalPhysicalModelReadiness({ contractType: "SERVICE", procedure: TipoProcedimiento.ABIERTO });
    const works = assessUniversalPhysicalModelReadiness({ contractType: "WORKS", procedure: TipoProcedimiento.ABIERTO });
    expect(service.ready).toBe(false);
    expect(works.ready).toBe(false);
    expect(service.blockers.some(item => item.includes("PCAP"))).toBe(true);
    expect(works.blockers.some(item => item.includes("PCAP"))).toBe(true);
  });

  it("la matriz multicaso muestra el caso protegido listo sin afirmar cobertura física universal", () => {
    const matrix = buildUniversalPhysicalCoverageMatrix();
    const protectedCase = matrix.find(row => row.id === "CONTR/2026/240267");
    expect(protectedCase?.physicalPackageReady).toBe(true);
    expect(matrix.filter(row => row.scope === "UNIVERSAL_FAMILY").some(row => !row.physicalPackageReady)).toBe(true);
    expect(canClaimUniversalPhysicalDocumentCoverage()).toBe(false);
  });
});
