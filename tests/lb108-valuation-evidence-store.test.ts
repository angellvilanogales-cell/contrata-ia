import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { storeValuationDocument } from "../src/application/intake/lb108/LB108ValuationEvidenceStore";

describe("LB108 · documentos justificativos de valoración", () => {
  const previous = process.env.CONTRATA_IA_EVIDENCE_DIR;
  afterEach(() => { if (previous === undefined) delete process.env.CONTRATA_IA_EVIDENCE_DIR; else process.env.CONTRATA_IA_EVIDENCE_DIR = previous; });
  it("persiste el binario y devuelve identidad verificable", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "contrata-lb108-doc-")); process.env.CONTRATA_IA_EVIDENCE_DIR = root;
    try {
      const result = storeValuationDocument("EXP/1", "estudio de mercado.pdf", "application/pdf", Buffer.from("documento acreditativo"));
      expect(result.sha256).toMatch(/^[a-f0-9]{64}$/); expect(result.fileName).toBe("estudio de mercado.pdf");
      expect(fs.readdirSync(path.join(root, "EXP_1"))).toHaveLength(1);
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
  });
});
