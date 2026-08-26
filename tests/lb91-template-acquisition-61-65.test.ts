import { describe, expect, it } from "vitest";
import { DocumentType } from "../src/domain/documentModel/DocumentType";
import { getAcquisitionTargetsFor, getUniversalTemplateAcquisitionQueue } from "../src/domain/documentModel/UniversalTemplateAcquisitionPlan";

describe("LB91.61-65 - cola de adquisición documental", () => {
  it("prioriza cerrar Memoria/PPT de suministro antes de ampliar variantes periféricas", () => {
    const queue = getUniversalTemplateAcquisitionQueue();
    expect(queue[0].contractType).toBe("SUPPLY");
    expect(queue[0].documentType).toBe(DocumentType.MEMORY);
    expect(queue[1].documentType).toBe(DocumentType.PPT);
  });

  it("mantiene el PCAP europeo de servicios como pendiente de aislamiento y verificación", () => {
    const item = getAcquisitionTargetsFor("SERVICE").find(x => x.documentType === DocumentType.PCAP);
    expect(item?.needs).toContain("EDITABLE_ORIGINAL");
    expect(item?.needs).toContain("PROVENANCE_VERIFICATION");
    expect(item?.needs).toContain("SHA256");
    expect(item?.needs).toContain("STYLE_FINGERPRINT");
  });

  it("no declara concesiones listas: exige caso independiente y editable", () => {
    const item = getAcquisitionTargetsFor("CONCESSION")[0];
    expect(item.needs).toContain("SECOND_INDEPENDENT_CASE");
    expect(item.needs).toContain("EDITABLE_ORIGINAL");
  });

  it("devuelve prioridades deterministas descendentes", () => {
    const priorities = getUniversalTemplateAcquisitionQueue().map(x => x.priority);
    expect(priorities).toEqual([...priorities].sort((a, b) => b - a));
  });
});
