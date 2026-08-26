import { describe, expect, it } from "vitest";
import { DocumentType } from "../src/domain/documentModel/DocumentType";
import { TipoProcedimiento } from "../src/domain/procedimiento/TipoProcedimiento";
import { selectUniversalDocumentSource } from "../src/domain/documentModel/UniversalDocumentSourceSelector";
import { buildDocumentLibraryCoverageReport } from "../src/domain/documentModel/UniversalDocumentLibraryCoverageReport";
import { getIsolationPendingEvidence } from "../src/domain/documentModel/DocumentarySourceEvidenceCatalogue";

describe("LB91.41-45 - biblioteca documental multidimensional", () => {
  it("selecciona el PCAP general editable supply ASA autofinanciado", () => {
    const result = selectUniversalDocumentSource({
      contractType: "SUPPLY",
      documentType: DocumentType.PCAP,
      procedure: TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO,
      financing: "AUTOFINANCED",
      technicalFamily: "GENERAL_ADMINISTRATIVE",
    });
    expect(result.status).toBe("GENERAL_EDITABLE_SELECTED");
    expect(result.blockers).toHaveLength(0);
  });

  it("no promueve la memoria editable de ferretería a memoria universal", () => {
    const result = selectUniversalDocumentSource({
      contractType: "SUPPLY",
      documentType: DocumentType.MEMORY,
      procedure: TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO,
      financing: "AUTOFINANCED",
      technicalFamily: "CATALOGUE_NEEDS_SUPPLY",
    });
    expect(result.status).toBe("CASE_EDITABLE_REFERENCE");
    expect(result.blockers[0]).toMatch(/expediente/);
  });

  it("bloquea el ODT de servicios con fondos europeos hasta aislar el binario original", () => {
    const result = selectUniversalDocumentSource({
      contractType: "SERVICE",
      documentType: DocumentType.PCAP,
      procedure: TipoProcedimiento.ABIERTO_SIMPLIFICADO,
      financing: "EU_FUNDS",
      technicalFamily: "GENERAL_ADMINISTRATIVE",
    });
    expect(result.status).toBe("ISOLATION_REQUIRED");
    expect(getIsolationPendingEvidence().some(item => item.id.includes("SERVICE-ASA-EU-FUNDS"))).toBe(true);
  });

  it("distingue PPT de limpieza de PPT de formación", () => {
    const cleaning = selectUniversalDocumentSource({ contractType: "SERVICE", documentType: DocumentType.PPT, technicalFamily: "CLEANING" });
    const training = selectUniversalDocumentSource({ contractType: "SERVICE", documentType: DocumentType.PPT, technicalFamily: "TRAINING" });
    expect(cleaning.candidates.length).toBeGreaterThanOrEqual(2);
    expect(training.candidates.length).toBeGreaterThanOrEqual(1);
    expect(cleaning.candidates.every(item => item.technicalFamily === "CLEANING")).toBe(true);
    expect(training.candidates.every(item => item.technicalFamily === "TRAINING")).toBe(true);
  });

  it("informe de cobertura solo marca ready el modelo general editable", () => {
    const report = buildDocumentLibraryCoverageReport([
      { contractType: "SUPPLY", documentType: DocumentType.PCAP, procedure: TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO, financing: "AUTOFINANCED", technicalFamily: "GENERAL_ADMINISTRATIVE" },
      { contractType: "SERVICE", documentType: DocumentType.PCAP, procedure: TipoProcedimiento.ABIERTO_SIMPLIFICADO, financing: "EU_FUNDS", technicalFamily: "GENERAL_ADMINISTRATIVE" },
      { contractType: "SERVICE", documentType: DocumentType.PPT, technicalFamily: "CLEANING" },
    ]);
    expect(report.map(item => item.generationReady)).toEqual([true, false, false]);
  });
});
