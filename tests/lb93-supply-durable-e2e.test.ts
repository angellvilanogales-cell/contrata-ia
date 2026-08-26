import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { UniversalEvidenceWorkspace } from "../src/application/intake/lb52/UniversalEvidenceWorkspace";
import { DurableUniversalEvidenceWorkspace } from "../src/application/universal/DurableUniversalEvidenceWorkspace";
import { UniversalDurableCaseStore, type UniversalCaseMirror, type UniversalCaseSnapshot } from "../src/application/universal/UniversalDurableCaseStore";

class MemoryMirror implements UniversalCaseMirror {
  private readonly data = new Map<string, UniversalCaseSnapshot>();
  async save(snapshot: UniversalCaseSnapshot): Promise<void> { this.data.set(snapshot.caseId, structuredClone(snapshot)); }
  async load(caseId: string): Promise<UniversalCaseSnapshot | null> { return structuredClone(this.data.get(caseId) ?? null); }
}

test("LB93: procedimiento, financiación y subfamilia Supply sobreviven a recreación del workspace", async () => {
  const mirror = new MemoryMirror();
  const firstRoot = fs.mkdtempSync(path.join(os.tmpdir(), "lb93-supply-a-"));
  const firstLocal = new UniversalEvidenceWorkspace(firstRoot);
  const first = new DurableUniversalEvidenceWorkspace(firstRoot, firstLocal, new UniversalDurableCaseStore(1, mirror));
  const caseId = "REG-SUPPLY-LB93-DURABLE-001";

  await first.declare(caseId, "contractType", "SUPPLY", "operator");
  await first.declare(caseId, "procedure", "ABIERTO_SIMPLIFICADO_ABREVIADO", "operator");
  await first.declare(caseId, "economic.fundingSource", "AUTOFINANCED", "operator");
  await first.declare(caseId, "technical.supplyVariant", "ORDINARY_GLOBAL_PRICE", "operator");

  const secondRoot = fs.mkdtempSync(path.join(os.tmpdir(), "lb93-supply-b-"));
  const secondLocal = new UniversalEvidenceWorkspace(secondRoot);
  const second = new DurableUniversalEvidenceWorkspace(secondRoot, secondLocal, new UniversalDurableCaseStore(1, mirror));
  const restored = await second.get(caseId);

  assert.equal(restored.record.fields.contractType?.value, "SUPPLY");
  assert.equal(restored.record.fields.procedure?.value, "ABIERTO_SIMPLIFICADO_ABREVIADO");
  assert.equal(restored.record.fields["economic.fundingSource"]?.value, "AUTOFINANCED");
  assert.equal(restored.record.fields["technical.supplyVariant"]?.value, "ORDINARY_GLOBAL_PRICE");
});
