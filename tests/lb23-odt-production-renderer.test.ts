import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { UniversalEditableTemplateAsset } from "../src/application/intake/lb18/UniversalEditableTemplateRendering";
import { OdtZipEntry, readOdtZip, writeOdtZip } from "../src/application/intake/lb23/OdtPackageCodec";
import {
  computeOdtStyleFingerprint,
  createInMemoryEditableTemplateBinaryStore,
  UniversalOdtProductionRenderer,
} from "../src/application/intake/lb23/UniversalOdtProductionRenderer";
import { evaluateUniversalProductionRendererClosure } from "../src/application/intake/lb23/UniversalProductionRendererClosure";
import { JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY } from "../src/application/intake/lb23/JuntaOfficialEditableTemplateDiscovery";

function hash(bytes: Uint8Array): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function fixtureEntries(): OdtZipEntry[] {
  const entry = (name: string, text: string, method: 0 | 8 = 8): OdtZipEntry => ({
    name,
    bytes: Buffer.from(text, "utf8"),
    method,
    modTime: 0,
    modDate: 0,
    externalAttributes: 0,
  });
  return [
    entry("mimetype", "application/vnd.oasis.opendocument.text", 0),
    entry("content.xml", `<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="urn:o" xmlns:text="urn:t"><office:automatic-styles><style:style xmlns:style="urn:s" style:name="P1"/></office:automatic-styles><office:body><office:text><text:p>Objeto: [[OBJECT]]</text:p><text:p>Criterios: [[CRITERIA]]</text:p></office:text></office:body></office:document-content>`),
    entry("styles.xml", `<?xml version="1.0"?><office:document-styles xmlns:office="urn:o"><office:styles/></office:document-styles>`),
    entry("settings.xml", `<?xml version="1.0"?><office:document-settings xmlns:office="urn:o"/>`),
    entry("META-INF/manifest.xml", `<?xml version="1.0"?><manifest:manifest xmlns:manifest="urn:m"/>`),
  ];
}

function fixtureAsset(bytes: Uint8Array): UniversalEditableTemplateAsset {
  const entries = readOdtZip(bytes);
  return {
    templateId: "test-odt-official",
    sourceId: "test-source",
    documentKind: "PCAP",
    format: "ODT",
    mediaType: "application/vnd.oasis.opendocument.text",
    contentHash: hash(bytes),
    styleFingerprint: computeOdtStyleFingerprint(entries),
    slotIds: ["object", "criteria"],
    editable: true,
  };
}

describe("LB23 - renderer ODT de producción", () => {
  it("conserva un paquete ODT válido y el mimetype", () => {
    const original = writeOdtZip(fixtureEntries());
    const decoded = readOdtZip(original);
    expect(decoded[0]?.name).toBe("mimetype");
    expect(Buffer.from(decoded[0]?.bytes ?? []).toString("utf8")).toBe("application/vnd.oasis.opendocument.text");
    expect(decoded.some(entry => entry.name === "content.xml")).toBe(true);
  });

  it("edita únicamente tokens físicos verificados y conserva la huella de estilo", async () => {
    const sourceBytes = writeOdtZip(fixtureEntries());
    const asset = fixtureAsset(sourceBytes);
    const renderer = new UniversalOdtProductionRenderer(
      createInMemoryEditableTemplateBinaryStore([{ templateId: asset.templateId, sourceId: asset.sourceId, bytes: sourceBytes }]),
      {
        bindingsByTemplateId: {
          [asset.templateId]: [
            { slotId: "object", part: "content.xml", xmlToken: "[[OBJECT]]", sourceSection: "1", sourceLabel: "Objeto" },
            { slotId: "criteria", part: "content.xml", xmlToken: "[[CRITERIA]]", sourceSection: "7", sourceLabel: "Criterios" },
          ],
        },
        formattersBySlotId: {
          criteria: value => (value as Array<{ name: string }>).map(item => item.name).join("; "),
        },
      },
    );

    const rendered = await renderer.render({
      asset,
      values: [
        { slotId: "object", value: "Suministro de equipos <TIC>", sourceFieldKey: "object" },
        { slotId: "criteria", value: [{ name: "Precio" }, { name: "Plazo" }], sourceFieldKey: "criteria.awardCriteria" },
      ],
    });

    expect(rendered.renderedStyleFingerprint).toBe(rendered.originalStyleFingerprint);
    expect(rendered.renderedContentHash).not.toBe(rendered.originalContentHash);
    expect(rendered.appliedSlots).toEqual(["object", "criteria"]);
    const content = Buffer.from(readOdtZip(rendered.bytes).find(entry => entry.name === "content.xml")?.bytes ?? []).toString("utf8");
    expect(content).toContain("Suministro de equipos &lt;TIC&gt;");
    expect(content).toContain("Precio; Plazo");
    expect(content).not.toContain("[[OBJECT]]");
  });

  it("rechaza hash de contenido no verificable o distinto", async () => {
    const sourceBytes = writeOdtZip(fixtureEntries());
    const asset = { ...fixtureAsset(sourceBytes), contentHash: "sha256:" + "0".repeat(64) };
    const renderer = new UniversalOdtProductionRenderer(
      createInMemoryEditableTemplateBinaryStore([{ templateId: asset.templateId, sourceId: asset.sourceId, bytes: sourceBytes }]),
      { bindingsByTemplateId: { [asset.templateId]: [
        { slotId: "object", part: "content.xml", xmlToken: "[[OBJECT]]", sourceSection: "1", sourceLabel: "Objeto" },
        { slotId: "criteria", part: "content.xml", xmlToken: "[[CRITERIA]]", sourceSection: "7", sourceLabel: "Criterios" },
      ] } },
    );
    await expect(renderer.render({ asset, values: [] })).rejects.toThrow(/SHA-256/);
  });

  it("no serializa estructuras jurídicas complejas sin formateador explícito", async () => {
    const sourceBytes = writeOdtZip(fixtureEntries());
    const asset = fixtureAsset(sourceBytes);
    const renderer = new UniversalOdtProductionRenderer(
      createInMemoryEditableTemplateBinaryStore([{ templateId: asset.templateId, sourceId: asset.sourceId, bytes: sourceBytes }]),
      { bindingsByTemplateId: { [asset.templateId]: [
        { slotId: "object", part: "content.xml", xmlToken: "[[OBJECT]]", sourceSection: "1", sourceLabel: "Objeto" },
        { slotId: "criteria", part: "content.xml", xmlToken: "[[CRITERIA]]", sourceSection: "7", sourceLabel: "Criterios" },
      ] } },
    );
    await expect(renderer.render({ asset, values: [{ slotId: "criteria", value: [{ name: "Precio" }], sourceFieldKey: "criteria.awardCriteria" }] })).rejects.toThrow(/formateador documental explícito/);
  });

  it("mantiene bloqueada la activación real mientras solo esté localizada la URL oficial", () => {
    const result = evaluateUniversalProductionRendererClosure({
      source: JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY,
      binaryAcquired: false,
      contentHashVerified: false,
      styleFingerprintVerified: false,
      physicalBindingsVerified: false,
      rendererAuditPassed: true,
    });
    expect(result.engineeringReady).toBe(true);
    expect(result.productionReady).toBe(false);
    expect(result.blockers.join(" ")).toMatch(/bytes|validada humanamente|bindings/i);
  });

  it("cierra producción únicamente con original, hashes, bindings y procedencia validados", () => {
    const source = { ...JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY, humanValidated: true, validatedBy: "template-custodian" };
    const result = evaluateUniversalProductionRendererClosure({
      source,
      binaryAcquired: true,
      contentHashVerified: true,
      styleFingerprintVerified: true,
      physicalBindingsVerified: true,
      rendererAuditPassed: true,
    });
    expect(result.productionReady).toBe(true);
    expect(result.blockers).toEqual([]);
  });
});
