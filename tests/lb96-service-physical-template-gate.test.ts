import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { readOdtZip, writeOdtZip, type OdtZipEntry } from "../src/application/intake/lb23/OdtPackageCodec";
import { computeOdtStyleFingerprint } from "../src/application/intake/lb23/UniversalOdtProductionRenderer";
import { evaluateServiceGeneralTemplateBytes } from "../src/application/intake/lb96/ServiceGeneralTemplatePhysicalGate";
import type { ServiceGeneralTemplateManifestRecord } from "../src/application/intake/lb96/ServiceGeneralTemplateManifest";
import { LB96_SERVICE_GENERAL_RUNTIME_ASSETS } from "../src/application/intake/lb96/ServicePersistedTemplateAssetStore";

function zipEntry(name: string, value: string, method: 0 | 8 = 8): OdtZipEntry {
  return { name, bytes: Buffer.from(value, "utf8"), method, modTime: 0, modDate: 0, externalAttributes: 0 };
}

function odt(slotNames: readonly string[]): Uint8Array {
  const placeholders = slotNames.map(slot => `<text:p>{{${slot}}}</text:p>`).join("");
  return writeOdtZip([
    zipEntry("mimetype", "application/vnd.oasis.opendocument.text", 0),
    zipEntry("content.xml", `<office:document-content><office:automatic-styles><style:style style:name="P1"/></office:automatic-styles><office:body><office:text>${placeholders}</office:text></office:body></office:document-content>`),
    zipEntry("styles.xml", `<office:document-styles><office:styles><style:style style:name="Standard"/></office:styles></office:document-styles>`),
    zipEntry("META-INF/manifest.xml", `<manifest:manifest><manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/></manifest:manifest>`),
  ]);
}

function sha(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function record(bytes: Uint8Array, slots: readonly string[]): ServiceGeneralTemplateManifestRecord {
  return {
    templateId: "test:service:memory",
    kind: "MEMORY",
    fileName: "test.odt",
    mediaType: "application/vnd.oasis.opendocument.text",
    expectedSha256: sha(bytes),
    expectedStyleFingerprint: computeOdtStyleFingerprint(readOdtZip(bytes)),
    provenance: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",
    officialModel: false,
    sourceAuthority: "SERVICE_REAL_CORPUS_PLUS_ADMIN_STYLE_DONOR",
    humanValidationRequired: true,
    slots,
  };
}

describe("LB96 gate físico de plantillas Service", () => {
  it("acepta únicamente un ODT cuya identidad, estilo y slots coinciden exactamente", () => {
    const slots = ["caseId", "object"] as const;
    const bytes = odt(slots);
    const result = evaluateServiceGeneralTemplateBytes(record(bytes, slots), bytes);
    expect(result.ready).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.discoveredSlots).toEqual(["caseId", "object"]);
    expect(result.officialModel).toBe(false);
    expect(result.humanValidationRequired).toBe(true);
  });

  it("bloquea cualquier mutación binaria aunque conserve forma ODT", () => {
    const slots = ["caseId", "object"] as const;
    const expected = odt(slots);
    const mutated = odt(["caseId", "object", "extra"]);
    const result = evaluateServiceGeneralTemplateBytes(record(expected, slots), mutated);
    expect(result.ready).toBe(false);
    expect(result.blockers.join(" ")).toContain("SHA-256");
    expect(result.blockers.join(" ")).toContain("slots");
  });

  it("mantiene Memoria y PPT Service separados del inventario Supply", () => {
    expect(LB96_SERVICE_GENERAL_RUNTIME_ASSETS).toHaveLength(2);
    expect(LB96_SERVICE_GENERAL_RUNTIME_ASSETS.map(item => item.kind).sort()).toEqual(["MEMORIA", "PPT"]);
    expect(LB96_SERVICE_GENERAL_RUNTIME_ASSETS.every(item => item.templateId.includes(":service:"))).toBe(true);
    expect(LB96_SERVICE_GENERAL_RUNTIME_ASSETS.every(item => item.provenanceRole === "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE")).toBe(true);
  });
});
