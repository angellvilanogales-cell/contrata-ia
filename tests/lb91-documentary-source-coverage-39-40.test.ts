import { describe, expect, it } from "vitest";
import { DocumentType } from "../src/domain/documentModel/DocumentType";
import {
  evaluateDocumentaryPackageSourceReadiness,
  evaluateDocumentarySourceCoverage,
} from "../src/engines/DocumentarySourceCoverageEngine";

describe("LB91.39-40 - cobertura documental basada en fuentes", () => {
  it("reconoce el PCAP supply ASA como general editable físicamente listo", () => {
    const result = evaluateDocumentarySourceCoverage("SUPPLY", DocumentType.PCAP);
    expect(result.status).toBe("GENERAL_EDITABLE");
    expect(result.physicalUniversalGenerationReady).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it("reconoce Memoria y PPT supply como generales editables tras la promoción LB94", () => {
    expect(evaluateDocumentarySourceCoverage("SUPPLY", DocumentType.MEMORY).status).toBe("GENERAL_EDITABLE");
    expect(evaluateDocumentarySourceCoverage("SUPPLY", DocumentType.PPT).status).toBe("GENERAL_EDITABLE");
    expect(evaluateDocumentarySourceCoverage("SUPPLY", DocumentType.MEMORY).physicalUniversalGenerationReady).toBe(true);
    expect(evaluateDocumentarySourceCoverage("SUPPLY", DocumentType.PPT).physicalUniversalGenerationReady).toBe(true);
  });

  it("clasifica los PPT de servicios como contraste multifuente estructural", () => {
    const result = evaluateDocumentarySourceCoverage("SERVICE", DocumentType.PPT);
    expect(result.status).toBe("MULTI_SOURCE_STRUCTURAL");
    expect(result.evidence.length).toBeGreaterThanOrEqual(3);
    expect(result.physicalUniversalGenerationReady).toBe(false);
  });

  it("declara listo el paquete físico universal supply cuando existen los tres modelos generales acreditados", () => {
    const result = evaluateDocumentaryPackageSourceReadiness("SUPPLY");
    expect(result.physicalUniversalPackageReady).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.documents.every(item => item.physicalUniversalGenerationReady)).toBe(true);
  });

  it("mantiene servicios bloqueado físicamente aunque tenga varias fuentes PCAP/PPT reales", () => {
    const result = evaluateDocumentaryPackageSourceReadiness("SERVICE");
    expect(result.physicalUniversalPackageReady).toBe(false);
    const pcap = result.documents.find(item => item.documentType === DocumentType.PCAP);
    expect(pcap?.status).toBe("MULTI_SOURCE_STRUCTURAL");
    expect(pcap?.physicalUniversalGenerationReady).toBe(false);
  });
});
