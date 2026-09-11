import { afterEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { HttpPersistedTemplateAssetStore, type PersistedTemplateAssetDescriptor } from "../src/application/intake/lb94/HttpPersistedTemplateAssetStore";

const bytes = Buffer.from("odt-fixture-binary-content-that-is-long-enough-for-hash-check", "utf8");
const checksum = createHash("sha256").update(bytes).digest("hex");
const descriptor: PersistedTemplateAssetDescriptor = {
  kind: "PPT",
  templateId: "contrata-ia:supply:ppt:test:v1",
  sourceId: "contrata-ia:supply:ppt:test:v1",
  sha256: checksum,
  styleFingerprint: `sha256:${"a".repeat(64)}`,
  provenanceRole: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",
};

function payload(overrides: Record<string, unknown> = {}) {
  return {
    templateId: descriptor.templateId,
    kind: descriptor.kind,
    mediaType: "application/vnd.oasis.opendocument.text",
    sha256: descriptor.sha256,
    styleFingerprint: descriptor.styleFingerprint,
    provenance: { role: descriptor.provenanceRole },
    contentBase64: bytes.toString("base64"),
    byteLength: bytes.length,
    ...overrides,
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("LB94 — store remoto verificado de activos físicos", () => {
  it("recupera un ODT solo cuando identidad, procedencia y hash coinciden", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(payload()), { status: 200 })));
    const store = new HttpPersistedTemplateAssetStore("https://example.test/functions/v1/contrata-ia-persistence", "token", [descriptor]);
    const source = await store.get(descriptor.templateId);
    expect(source?.templateId).toBe(descriptor.templateId);
    expect(source?.sourceId).toBe(descriptor.sourceId);
    expect(Buffer.from(source?.bytes ?? []).equals(bytes)).toBe(true);
  });

  it("rechaza sustitución de bytes aunque el servidor declare el SHA esperado", async () => {
    const tampered = Buffer.from("different-binary-content-that-must-never-be-accepted-by-runtime", "utf8");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(payload({ contentBase64: tampered.toString("base64"), byteLength: tampered.length })), { status: 200 })));
    const store = new HttpPersistedTemplateAssetStore("https://example.test/functions/v1/contrata-ia-persistence", "token", [descriptor]);
    await expect(store.get(descriptor.templateId)).rejects.toThrow(/SHA calculado/);
  });

  it("rechaza promoción de una plantilla derivada si la procedencia remota cambia", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(payload({ provenance: { role: "OFFICIAL_MODEL" } })), { status: 200 })));
    const store = new HttpPersistedTemplateAssetStore("https://example.test/functions/v1/contrata-ia-persistence", "token", [descriptor]);
    await expect(store.get(descriptor.templateId)).rejects.toThrow(/Procedencia remota/);
  });

  it("expone readiness bloqueada cuando falta cualquier activo obligatorio", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: "not_found" }), { status: 404 })));
    const store = new HttpPersistedTemplateAssetStore("https://example.test/functions/v1/contrata-ia-persistence", "token", [descriptor]);
    const result = await store.readiness();
    expect(result.ready).toBe(false);
    expect(result.blockers).toHaveLength(1);
  });
});
