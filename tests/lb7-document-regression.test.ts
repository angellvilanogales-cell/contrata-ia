import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type PatternRegistry = {
  corpus: Array<{ id: string; memory: string; pcap: string; ppt: string; status: string }>;
  authorityOrder: string[];
  memoryPattern: { recurrentBlocks: string[]; observedVariants: string[] };
  pcapPattern: { strategy: string; selectionDimensions: string[]; recurrentStructure: string[] };
  pptPattern: { recurrentBlocks: string[]; neverInvent: string[] };
  crossDocumentInvariants: string[];
  visibleDocumentPolicy: { forbidden: string[]; allowed: string[] };
};

function registry(): PatternRegistry {
  const file = path.resolve("knowledge/lb7/document-patterns.json");
  return JSON.parse(fs.readFileSync(file, "utf8")) as PatternRegistry;
}

describe("LB-7 golden document regression", () => {
  it("contains ten comparable Memoria-PCAP-PPT triples", () => {
    const value = registry();
    expect(value.corpus).toHaveLength(10);
    expect(new Set(value.corpus.map(item => item.id)).size).toBe(10);
    for (const item of value.corpus) {
      expect(item.memory.length).toBeGreaterThan(5);
      expect(item.pcap.length).toBeGreaterThan(5);
      expect(item.ppt.length).toBeGreaterThan(5);
      expect(["DEEP_READ", "IDENTIFIED"]).toContain(item.status);
    }
  });

  it("keeps current law and current Junta model above historical examples", () => {
    const value = registry();
    expect(value.authorityOrder[0]).toBe("CURRENT_LAW");
    expect(value.authorityOrder[1]).toBe("CURRENT_JUNTA_RECOMMENDED_MODEL");
    expect(value.authorityOrder.indexOf("HISTORICAL_REAL_EXPEDIENT")).toBeGreaterThan(value.authorityOrder.indexOf("CURRENT_JUNTA_RECOMMENDED_MODEL"));
  });

  it("models need and insufficiency as composable memory variants", () => {
    const value = registry();
    expect(value.memoryPattern.recurrentBlocks).toContain("NEED_AND_IDONEITY");
    expect(value.memoryPattern.recurrentBlocks).toContain("INSUFFICIENCY_FOR_SERVICES");
    expect(value.memoryPattern.observedVariants).toContain("NEED_AND_INSUFFICIENCY_INTEGRATED");
    expect(value.memoryPattern.observedVariants).toContain("INSUFFICIENCY_STANDALONE");
  });

  it("binds PCAP generation to the official recommended model dimensions", () => {
    const value = registry();
    expect(value.pcapPattern.strategy).toBe("BIND_TO_OFFICIAL_RECOMMENDED_MODEL");
    expect(value.pcapPattern.selectionDimensions).toEqual(expect.arrayContaining(["CONTRACT_TYPE", "PROCEDURE", "FUNDING", "MODEL_VERSION"]));
  });

  it("forbids invention of high-risk technical PPT facts", () => {
    const value = registry();
    expect(value.pptPattern.neverInvent).toEqual(expect.arrayContaining(["SURFACES", "TASK_FREQUENCIES", "SERVICE_HOURS", "PERSONNEL_COUNTS", "SUBROGATION_WORKER_DATA"]));
  });

  it("defines cross-document invariants for one expediente source of truth", () => {
    const value = registry();
    expect(value.crossDocumentInvariants).toEqual(expect.arrayContaining(["OBJECT", "CPV", "LOTS", "BUDGET_BASE", "ESTIMATED_VALUE", "DURATION_AND_EXTENSIONS", "PROCEDURE", "SUBROGATION_STATUS"]));
  });

  it("keeps internal source metadata out of visible administrative documents", () => {
    const value = registry();
    expect(value.visibleDocumentPolicy.forbidden).toContain("INTERNAL_SOURCE_IDS");
    expect(value.visibleDocumentPolicy.forbidden).toContain("TECHNICAL_VALIDATION_STATES");
    expect(value.visibleDocumentPolicy.allowed).toContain("LEGAL_NORM_AND_ARTICLE_WHEN_RELEVANT");
  });
});
