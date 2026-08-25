import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { AdaptiveCaseStore } from "../src/infrastructure/operations/lb7/AdaptiveCaseStore";

const roots: string[] = [];
afterEach(() => { while (roots.length) fs.rmSync(roots.pop()!, { recursive: true, force: true }); });

describe("LB-7 adaptive case persistence", () => {
  it("creates, saves and reloads an adaptive case by EXP identifier", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "contrata-ia-adaptive-"));
    roots.push(root);
    const store = new AdaptiveCaseStore(root);
    const created = store.create();
    expect(created.caseId).toMatch(/^EXP-/);

    store.save(created.caseId, {
      needAndPurpose: "Suministro de material de ferretería para reparaciones en edificios del SAE.",
      scopeDetail: "Tornillería, herrajes y consumibles mediante pedidos sucesivos.",
      supplyAcquisitionMode: "SUCCESSIVE_NEEDS",
      initialBudgetExVat: 12000
    }, { items: [{ referencia: "ART-001" }] });

    const restored = new AdaptiveCaseStore(root).get(created.caseId);
    expect(restored.answers.needAndPurpose).toContain("ferretería");
    expect(restored.answers.initialBudgetExVat).toBe(12000);
    expect(restored.supplyCatalogue).toEqual({ items: [{ referencia: "ART-001" }] });
  });
});
