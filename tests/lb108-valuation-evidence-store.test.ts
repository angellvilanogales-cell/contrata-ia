import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { vi } from "vitest";
import { storeValuationDocument } from "../src/application/intake/lb108/LB108ValuationEvidenceStore";

describe("LB108 · documentos justificativos de valoración", () => {
  const previous = process.env.CONTRATA_IA_EVIDENCE_DIR;
  afterEach(() => { if (previous === undefined) delete process.env.CONTRATA_IA_EVIDENCE_DIR; else process.env.CONTRATA_IA_EVIDENCE_DIR = previous; });
  it("persiste el binario y devuelve identidad verificable", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "contrata-lb108-doc-")); process.env.CONTRATA_IA_EVIDENCE_DIR = root;
    try {
      const result = await storeValuationDocument("EXP/1", "estudio de mercado.pdf", "application/pdf", Buffer.from("documento acreditativo"));
      expect(result.sha256).toMatch(/^[a-f0-9]{64}$/); expect(result.fileName).toBe("estudio de mercado.pdf");
      expect(result.storage).toBe("LOCAL_DEVELOPMENT");
      expect(fs.readdirSync(path.join(root, "EXP_1"))).toHaveLength(1);
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
  });
  it("usa transporte fragmentado remoto y exige confirmación de SHA", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ sessionId: "session-1" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockImplementationOnce(async (_url: string, init: RequestInit) => {
        const body = Buffer.from("documento remoto");
        return new Response(JSON.stringify({ sha256: await import("node:crypto").then(({ createHash }) => createHash("sha256").update(body).digest("hex")), byteLength: body.length }), { status: 200 });
      });
    vi.stubGlobal("fetch", fetchMock);
    try {
      const result = await storeValuationDocument("EXP-2", "informe.pdf", "application/pdf", Buffer.from("documento remoto"), { CONTRATA_IA_PERSISTENCE_URL: "https://persist.example.test", CONTRATA_IA_PERSISTENCE_TOKEN: "secret" } as NodeJS.ProcessEnv);
      expect(result.storage).toBe("DURABLE_REMOTE");
      expect(fetchMock.mock.calls.map(call => String(call[0]))).toEqual(expect.arrayContaining([expect.stringContaining("/template-ingest/start"), expect.stringContaining("/chunks/0"), expect.stringContaining("/finalize")]));
    } finally { vi.unstubAllGlobals(); }
  });
});
