import { describe, expect, it } from "vitest";
import {
  UniversalCaseMirror,
  UniversalCaseSnapshot,
  UniversalDurableCaseStore,
  sha256Json,
} from "../src/application/universal/UniversalDurableCaseStore";

class MemoryMirror implements UniversalCaseMirror {
  public readonly rows = new Map<string, UniversalCaseSnapshot>();
  public failSave = false;
  public failLoad = false;

  async save(snapshot: UniversalCaseSnapshot): Promise<void> {
    if (this.failSave) throw new Error("REMOTE_DOWN");
    this.rows.set(snapshot.caseId, structuredClone(snapshot));
  }

  async load(caseId: string): Promise<UniversalCaseSnapshot | null> {
    if (this.failLoad) throw new Error("REMOTE_DOWN");
    return structuredClone(this.rows.get(caseId) ?? null);
  }
}

describe("LB92 UniversalDurableCaseStore", () => {
  it("guarda y restaura remotamente un expediente aislado", async () => {
    const mirror = new MemoryMirror();
    const store = new UniversalDurableCaseStore(1, mirror);
    const saved = await store.save("REG-SUPPLY-001", { contractType: "SUPPLY", value: 123 });
    expect(saved.status).toBe("REMOTE_CONFIRMED");
    const recovered = await new UniversalDurableCaseStore(1, mirror).restore("REG-SUPPLY-001");
    expect(recovered.status).toBe("RESTORED_REMOTE");
    expect(recovered.snapshot?.payload).toEqual({ contractType: "SUPPLY", value: 123 });
  });

  it("conserva fallback local cuando falla el guardado remoto", async () => {
    const mirror = new MemoryMirror();
    mirror.failSave = true;
    const store = new UniversalDurableCaseStore(1, mirror);
    const saved = await store.save("REG-SERVICE-001", { contractType: "SERVICE" });
    expect(saved.status).toBe("LOCAL_ONLY_REMOTE_FAILED");
    mirror.failLoad = true;
    const recovered = await store.restore("REG-SERVICE-001");
    expect(recovered.status).toBe("RESTORED_LOCAL");
  });

  it("rechaza corrupción de checksum", async () => {
    const mirror = new MemoryMirror();
    mirror.rows.set("REG-WORKS-001", {
      caseId: "REG-WORKS-001",
      schemaVersion: 1,
      payload: { contractType: "WORKS" },
      checksum: "0".repeat(64),
    });
    await expect(new UniversalDurableCaseStore(1, mirror).restore("REG-WORKS-001"))
      .rejects.toThrow("UNIVERSAL_CHECKSUM_MISMATCH");
  });

  it("no migra silenciosamente versiones de esquema", async () => {
    const mirror = new MemoryMirror();
    const payload = { contractType: "CONCESSION" };
    mirror.rows.set("REG-CONCESSION-001", {
      caseId: "REG-CONCESSION-001",
      schemaVersion: 2,
      payload,
      checksum: await sha256Json(payload),
    });
    await expect(new UniversalDurableCaseStore(1, mirror).restore("REG-CONCESSION-001"))
      .rejects.toThrow("UNIVERSAL_SCHEMA_VERSION_MISMATCH");
  });

  it("impide contaminación entre expedientes", async () => {
    const mirror = new MemoryMirror();
    const payload = { contractType: "MIXED" };
    mirror.rows.set("REG-MIXED-002", {
      caseId: "REG-MIXED-001",
      schemaVersion: 1,
      payload,
      checksum: await sha256Json(payload),
    });
    await expect(new UniversalDurableCaseStore(1, mirror).restore("REG-MIXED-002"))
      .rejects.toThrow("UNIVERSAL_CASE_ISOLATION_VIOLATION");
  });
});
