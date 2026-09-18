import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { UniversalEvidenceWorkspace } from "../src/application/intake/lb52/UniversalEvidenceWorkspace";
import { DurableUniversalEvidenceWorkspace } from "../src/application/universal/DurableUniversalEvidenceWorkspace";
import { UniversalDurableCaseStore, type UniversalCaseMirror, type UniversalCaseSnapshot } from "../src/application/universal/UniversalDurableCaseStore";

class MemoryMirror implements UniversalCaseMirror {
  private readonly data = new Map<string, UniversalCaseSnapshot>();
  async save(snapshot: UniversalCaseSnapshot): Promise<void> { this.data.set(snapshot.caseId, structuredClone(snapshot)); }
  async load(caseId: string): Promise<UniversalCaseSnapshot | null> { return structuredClone(this.data.get(caseId) ?? null); }
}

const roots: string[] = [];
function root(prefix: string): string { const value = fs.mkdtempSync(path.join(os.tmpdir(), prefix)); roots.push(value); return value; }
afterEach(() => { while (roots.length) fs.rmSync(roots.pop()!, { recursive: true, force: true }); });

describe("LB93 durable Supply evidence", () => {
  it("recupera procedimiento, financiación y subfamilia tras recrear el workspace", async () => {
    const mirror = new MemoryMirror();
    const firstRoot = root("lb93-supply-a-");
    const first = new DurableUniversalEvidenceWorkspace(firstRoot, new UniversalEvidenceWorkspace(firstRoot), new UniversalDurableCaseStore(1, mirror));
    const caseId = "REG-SUPPLY-LB93-DURABLE-001";

    await first.declare(caseId, "contractType", "SUPPLY", "operator");
    await first.declare(caseId, "procedure", "ABIERTO_SIMPLIFICADO_ABREVIADO", "operator");
    await first.declare(caseId, "economic.fundingSource", "AUTOFINANCED", "operator");
    await first.declare(caseId, "technical.supplyVariant", "ORDINARY_GLOBAL_PRICE", "operator");

    const secondRoot = root("lb93-supply-b-");
    const second = new DurableUniversalEvidenceWorkspace(secondRoot, new UniversalEvidenceWorkspace(secondRoot), new UniversalDurableCaseStore(1, mirror));
    const restored = await second.get(caseId);

    expect(restored.persistence.status).toBe("RESTORED_REMOTE");
    expect(restored.record.fields.contractType?.value).toBe("SUPPLY");
    expect(restored.record.fields.procedure?.value).toBe("ABIERTO_SIMPLIFICADO_ABREVIADO");
    expect(restored.record.fields["economic.fundingSource"]?.value).toBe("AUTOFINANCED");
    expect(restored.record.fields["technical.supplyVariant"]?.value).toBe("ORDINARY_GLOBAL_PRICE");
  });
});
