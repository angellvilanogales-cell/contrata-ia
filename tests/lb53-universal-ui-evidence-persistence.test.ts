import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { declareUniversalUiEvidence, validateUniversalUiEvidence } from "../src/application/intake/lb53/UniversalUiEvidenceDraft";
import { AdaptiveCaseStore } from "../src/infrastructure/operations/lb7/AdaptiveCaseStore";

describe("LB53 - persistencia de evidencia universal", () => {
  it("persiste una declaración universal y la recupera tras recrear el store", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "contrata-ia-universal-evidence-"));
    const first = new AdaptiveCaseStore(root);
    const created = first.create();
    const field = declareUniversalUiEvidence({ fieldPath: "economic.needsBasedContractDa33", value: true, sourceId: "pcap:v7" }, "operator");
    first.saveUniversalEvidence(created.caseId, field);

    const second = new AdaptiveCaseStore(root);
    const restored = second.get(created.caseId);
    expect(restored.universalEvidence?.["economic.needsBasedContractDa33"]?.status).toBe("SOURCE_DECLARED");
    expect(restored.universalEvidence?.["economic.needsBasedContractDa33"]?.value).toBe(true);
  });

  it("persiste la validación humana explícita sin perder la fuente declarada", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "contrata-ia-universal-evidence-"));
    const store = new AdaptiveCaseStore(root);
    const created = store.create();
    const declared = declareUniversalUiEvidence({ fieldPath: "durationMonths", value: 24, sourceId: "memoria:v14" }, "operator");
    store.saveUniversalEvidence(created.caseId, declared);
    const validated = validateUniversalUiEvidence(declared, "reviewer");
    store.saveUniversalEvidence(created.caseId, validated);

    const restored = new AdaptiveCaseStore(root).get(created.caseId).universalEvidence?.["durationMonths"];
    expect(restored?.status).toBe("HUMAN_VALIDATED");
    expect(restored?.humanValidated).toBe(true);
    expect(restored?.sources[0]?.sourceId).toBe("memoria:v14");
  });

  it("mantiene compatibilidad con expedientes persistidos antes de universalEvidence", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "contrata-ia-universal-evidence-"));
    const store = new AdaptiveCaseStore(root);
    const created = store.create();
    const file = path.join(root, `${created.caseId}.json`);
    const legacy = JSON.parse(fs.readFileSync(file, "utf8"));
    delete legacy.universalEvidence;
    fs.writeFileSync(file, JSON.stringify(legacy));
    expect(new AdaptiveCaseStore(root).get(created.caseId).universalEvidence).toEqual({});
  });
});
