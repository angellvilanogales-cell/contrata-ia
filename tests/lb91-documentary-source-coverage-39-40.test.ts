import { describe, expect, it } from "vitest";
import { DocumentType } from "../src/domain/documentModel/DocumentType";
import {
  evaluateDocumentaryPackageSourceReadiness,
  evaluateDocumentarySourceCoverage,
} from "../src/engines/DocumentarySourceCoverageEngine";

describe("LB91.39-40 - cobertura documental basada en fuentes", () => {
  it("reconoce el PCAP supply ASA como único general editable físicamente listo", () => {
    const result = evaluateDocumentarySourceCoverage("SUPPLY", DocumentType.PCAP);
    expect(result.status).toBe("GENERAL_EDITABLE");
    expect(result.physicalUniversalGenerationReady).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it("mantiene memoria y PPT supply como editables de caso, no universales", () => {
    expect(evaluateDocumentarySourceCoverage("SUPPLY", DocumentType.MEMORY).status).toBe("CASE_EDITABLE");
    expect(evaluateDocumentarySourceCoverage("SUPPLY", DocumentType.PPT).status).toBe("CASE_EDITABLE");
  });

  it("clasifica los PPT de servicios como contraste multifuente estructural", () => {
    const result = evaluateDocumentarySourceCoverage("SERVICE", DocumentType.PPT);
    expect(result.status).toBe("MULTI_SOURCE_STRUCTURAL");
    expect(result.evidence.length).toBeGreaterThanOrEqual(3);
    expect(result.physicalUniversalGenerationReady).toBe(false);
  });

  it("no declara listo el paquete universal supply mientras falten memoria y PPT generales", () => {
    const result = evaluateDocumentaryPackageSourceReadiness("SUPPLY");
    expect(result.physicalUniversalPackageReady).toBe(false);
    expect(result.blockers.some(item => item.startsWith("MEMORY:"))).toBe(true);
    expect(result.blockers.some(item => item.startsWith("PPT:"))).toBe(true);
  });

  it("mantiene servicios bloqueado físicamente aunque tenga varias fuentes PCAP/PPT reales", () => {
    const result = evaluateDocumentaryPackageSourceReadiness("SERVICE");
    expect(result.physicalUniversalPackageReady).toBe(false);
    const pcap = result.documents.find(item => item.documentType === DocumentType.PCAP);
    expect(pcap?.status).toBe("MULTI_SOURCE_STRUCTURAL");
    expect(pcap?.physicalUniversalGenerationReady).toBe(false);
  });
});
