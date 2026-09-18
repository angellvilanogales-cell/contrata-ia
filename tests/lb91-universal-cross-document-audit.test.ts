import { describe, expect, it } from "vitest";
import { auditUniversalCrossDocuments } from "../src/engines/UniversalCrossDocumentAudit";

const common = { contractType: "SUPPLY", cpv: "44316400-2", durationMonths: 24, estimatedValueCents: 2_179_315 };

describe("LB91.12 - auditoría cruzada universal", () => {
  it("acepta tres documentos coherentes con hechos compartidos", () => {
    const result = auditUniversalCrossDocuments([
      { document: "MEMORY", sourceId: "memory", facts: { ...common, need: "Ferretería" } },
      { document: "PCAP", sourceId: "pcap", facts: { ...common, procedure: "ASA" } },
      { document: "PPT", sourceId: "ppt", facts: { ...common, technicalPurpose: "Ferretería" } },
    ]);
    expect(result.ready).toBe(true);
    expect(result.comparedFacts).toContain("estimatedValueCents");
  });

  it("bloquea una contradicción económica sin corregirla", () => {
    const result = auditUniversalCrossDocuments([
      { document: "MEMORY", sourceId: "memory", facts: { ...common } },
      { document: "PCAP", sourceId: "pcap", facts: { ...common, estimatedValueCents: 2_000_000 } },
      { document: "PPT", sourceId: "ppt", facts: { ...common } },
    ]);
    expect(result.ready).toBe(false);
    expect(result.conflicts[0]?.factKey).toBe("estimatedValueCents");
    expect(result.blockers.some(item => item.includes("no se resuelve automáticamente"))).toBe(true);
  });

  it("exige Memoria, PCAP y PPT", () => {
    const result = auditUniversalCrossDocuments([
      { document: "MEMORY", sourceId: "memory", facts: common },
      { document: "PCAP", sourceId: "pcap", facts: common },
    ]);
    expect(result.ready).toBe(false);
    expect(result.missingDocuments).toEqual(["PPT"]);
  });

  it("no declara auditoría efectiva si no hay hechos comparables", () => {
    const result = auditUniversalCrossDocuments([
      { document: "MEMORY", sourceId: "memory", facts: { need: "x" } },
      { document: "PCAP", sourceId: "pcap", facts: { procedure: "y" } },
      { document: "PPT", sourceId: "ppt", facts: { technical: "z" } },
    ]);
    expect(result.ready).toBe(false);
  });
});
