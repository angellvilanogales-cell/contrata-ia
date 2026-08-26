import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { UniversalEvidenceWorkspace } from "../src/application/intake/lb52/UniversalEvidenceWorkspace";
import { DurableUniversalEvidenceWorkspace } from "../src/application/universal/DurableUniversalEvidenceWorkspace";
import { UniversalCaseMirror, UniversalCaseSnapshot, UniversalDurableCaseStore } from "../src/application/universal/UniversalDurableCaseStore";

class MemoryMirror implements UniversalCaseMirror {
  rows = new Map<string, UniversalCaseSnapshot>();
  async save(snapshot: UniversalCaseSnapshot): Promise<void> { this.rows.set(snapshot.caseId, structuredClone(snapshot)); }
  async load(caseId: string): Promise<UniversalCaseSnapshot | null> { return structuredClone(this.rows.get(caseId) ?? null); }
}

const roots: string[] = [];
afterEach(() => { while (roots.length) fs.rmSync(roots.pop()!, { recursive: true, force: true }); });
function root(): string { const value = fs.mkdtempSync(path.join(os.tmpdir(), "lb92-evidence-")); roots.push(value); return value; }

describe("LB92 DurableUniversalEvidenceWorkspace", () => {
  it("persiste una declaración y la recupera en un workspace nuevo", async () => {
    const mirror = new MemoryMirror();
    const root1 = root();
    const durable1 = new DurableUniversalEvidenceWorkspace(root1, new UniversalEvidenceWorkspace(root1), new UniversalDurableCaseStore(1, mirror));
    const declared = await durable1.declare("REG-SUPPLY-009", "object", "Suministro de prueba", "operator-1");
    expect(declared.persistence.status).toBe("REMOTE_CONFIRMED");

    const root2 = root();
    const durable2 = new DurableUniversalEvidenceWorkspace(root2, new UniversalEvidenceWorkspace(root2), new UniversalDurableCaseStore(1, mirror));
    const restored = await durable2.get("REG-SUPPLY-009");
    expect(restored.persistence.status).toBe("RESTORED_REMOTE");
    expect(restored.record.fields.object?.value).toBe("Suministro de prueba");
    expect(restored.record.fields.object?.humanValidated).toBe(false);
  });

  it("conserva la validación humana a través del snapshot remoto", async () => {
    const mirror = new MemoryMirror();
    const root1 = root();
    const durable1 = new DurableUniversalEvidenceWorkspace(root1, new UniversalEvidenceWorkspace(root1), new UniversalDurableCaseStore(1, mirror));
    await durable1.declare("REG-SERVICE-009", "object", "Servicio de prueba", "operator-1");
    await durable1.validate("REG-SERVICE-009", "object", "reviewer-1");

    const root2 = root();
    const durable2 = new DurableUniversalEvidenceWorkspace(root2, new UniversalEvidenceWorkspace(root2), new UniversalDurableCaseStore(1, mirror));
    const restored = await durable2.get("REG-SERVICE-009");
    expect(restored.record.fields.object?.status).toBe("HUMAN_VALIDATED");
    expect(restored.record.fields.object?.humanValidated).toBe(true);
  });

  it("rechaza snapshots que intentan inyectar campos fuera del manifiesto", async () => {
    const mirror = new MemoryMirror();
    const sourceRoot = root();
    const source = new DurableUniversalEvidenceWorkspace(sourceRoot, new UniversalEvidenceWorkspace(sourceRoot), new UniversalDurableCaseStore(1, mirror));
    await source.declare("REG-SUPPLY-010", "object", "Objeto válido", "operator-1");
    const snapshot = mirror.rows.get("REG-SUPPLY-010")!;
    (snapshot.payload as any).record.fields["technical.inventedField"] = { key: "technical.inventedField", value: true, status: "SOURCE_DECLARED", sources: [], humanValidationRequired: true, humanValidated: false };
    const { sha256Json } = await import("../src/application/universal/UniversalDurableCaseStore");
    snapshot.checksum = await sha256Json(snapshot.payload);
    mirror.rows.set(snapshot.caseId, snapshot);

    const targetRoot = root();
    const target = new DurableUniversalEvidenceWorkspace(targetRoot, new UniversalEvidenceWorkspace(targetRoot), new UniversalDurableCaseStore(1, mirror));
    await expect(target.get("REG-SUPPLY-010")).rejects.toThrow("UNIVERSAL_EVIDENCE_FIELD_NOT_ALLOWED");
  });
});
