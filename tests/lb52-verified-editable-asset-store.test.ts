import { createHash } from "node:crypto";
import { mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FERRETERIA_V1_EDITABLE_ASSET_MANIFEST, VerifiedEditableAssetStore, evaluateFerreteriaV1RuntimeAssetReadiness } from "../src/infrastructure/operations/lb52/VerifiedEditableAssetStore";

function hash(bytes: Buffer) {
  return createHash("sha256").update(bytes).digest("hex");
}

describe("LB52 - activos editables verificados", () => {
  it("carga un activo solo cuando el SHA-256 coincide", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "contrata-ia-assets-"));
    const bytes = Buffer.from("odt-test-bytes");
    writeFileSync(path.join(root, "modelo.odt"), bytes);
    const store = new VerifiedEditableAssetStore(root);
    const result = store.load({
      assetId: "test:model",
      fileName: "modelo.odt",
      expectedSha256: hash(bytes),
      mediaType: "application/vnd.oasis.opendocument.text",
      role: "OFFICIAL_MODEL",
    });
    expect(result.actualSha256).toBe(hash(bytes));
  });

  it("rechaza silenciosamente imposible: un fichero con nombre correcto pero bytes distintos", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "contrata-ia-assets-"));
    writeFileSync(path.join(root, "modelo.odt"), Buffer.from("alterado"));
    const store = new VerifiedEditableAssetStore(root);
    expect(() => store.load({
      assetId: "test:model",
      fileName: "modelo.odt",
      expectedSha256: hash(Buffer.from("original")),
      mediaType: "application/vnd.oasis.opendocument.text",
      role: "OFFICIAL_MODEL",
    })).toThrow(/Hash SHA-256 inválido/);
  });

  it("bloquea un activo productivo cuyo hash fuente aún no ha sido validado", () => {
    const store = new VerifiedEditableAssetStore("/tmp");
    expect(() => store.load({
      assetId: "pending",
      fileName: "pending.odt",
      expectedSha256: null,
      mediaType: "application/vnd.oasis.opendocument.text",
      role: "REAL_CASE_EDITABLE",
    })).toThrow(/no tiene SHA-256 fuente validado/);
  });

  it("mantiene explícito que el PPT V6 sigue pendiente de identidad binaria runtime", () => {
    const ppt = FERRETERIA_V1_EDITABLE_ASSET_MANIFEST.find(asset => asset.assetId === "ferreteria:ppt:v6:odt")!;
    expect(ppt.expectedSha256).toBeNull();
    const readiness = evaluateFerreteriaV1RuntimeAssetReadiness();
    expect(readiness.readyForProductionRuntime).toBe(false);
    expect(readiness.pendingIdentityDescriptors).toContain("ferreteria:ppt:v6:odt");
  });
});
