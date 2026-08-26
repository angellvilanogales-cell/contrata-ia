import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { writeOdtZip, readOdtZip, type OdtZipEntry } from "../src/application/intake/lb23/OdtPackageCodec";
import { computeOdtStyleFingerprint } from "../src/application/intake/lb23/UniversalOdtProductionRenderer";
import { deriveSupplyGeneralEditableTemplate } from "../src/application/intake/lb94/SupplyGeneralEditableTemplateDerivation";
import { renderSupplyGeneralEditableTemplate } from "../src/application/intake/lb94/SupplyGeneralEditableTemplateRenderer";
import type { VerifiedEditableAsset } from "../src/infrastructure/operations/lb52/VerifiedEditableAssetStore";

function entry(name: string, value: string, method: 0 | 8 = 8): OdtZipEntry { return { name, bytes: Buffer.from(value), method, modTime: 0, modDate: 0, externalAttributes: 0 }; }
function donor(): { asset: VerifiedEditableAsset; style: string } {
  const entries = [
    entry("mimetype", "application/vnd.oasis.opendocument.text", 0),
    entry("META-INF/manifest.xml", "<manifest:manifest xmlns:manifest=\"urn:oasis:names:tc:opendocument:xmlns:manifest:1.0\"/>"),
    entry("styles.xml", "<office:document-styles xmlns:office=\"urn:oasis:names:tc:opendocument:xmlns:office:1.0\"><office:styles/></office:document-styles>"),
    entry("content.xml", "<office:document-content xmlns:office=\"urn:oasis:names:tc:opendocument:xmlns:office:1.0\" xmlns:text=\"urn:oasis:names:tc:opendocument:xmlns:text:1.0\"><office:automatic-styles/><office:body><office:text><text:p>CONTR/2026/240267 FERRETERÍA 44316400-2</text:p></office:text></office:body></office:document-content>"),
  ];
  const bytes = writeOdtZip(entries);
  const sha = createHash("sha256").update(bytes).digest("hex");
  return {
    style: computeOdtStyleFingerprint(readOdtZip(bytes)),
    asset: { descriptor: { assetId: "ferreteria:ppt:v6:odt", fileName: "donor.odt", expectedSha256: sha, mediaType: "application/vnd.oasis.opendocument.text", role: "REAL_CASE_EDITABLE" }, bytes, actualSha256: sha },
  };
}

function values() {
  return [
    { slotId: "object", value: "Suministro de equipos administrativos" },
    { slotId: "contractManagement", value: "Unidad gestora competente" },
    { slotId: "durationSummary", value: "Doce meses" },
    { slotId: "executionLocations", value: ["Sevilla", "Cádiz"] },
    { slotId: "technicalRequirements", value: "Requisitos técnicos verificables y vinculados al objeto" },
    { slotId: "supplyVariantRequirements", value: "Suministro ordinario a precio global" },
    { slotId: "receiptAndAcceptanceRegime", value: "Recepción formal y comprobación de conformidad" },
    { slotId: "specialExecutionConditions", value: ["Gestión adecuada de embalajes"] },
  ];
}

describe("LB94 — renderer general editable Supply", () => {
  it("renderiza PPT sin slots pendientes ni datos del expediente donante", () => {
    const source = donor();
    const template = deriveSupplyGeneralEditableTemplate({ kind: "PPT", source: source.asset, expectedSourceStyleFingerprint: source.style });
    const rendered = renderSupplyGeneralEditableTemplate({ template, values: values(), caseId: "REG-SUPPLY-LB94-001" });
    const content = Buffer.from(readOdtZip(rendered.bytes).find(item => item.name === "content.xml")!.bytes).toString("utf8");
    expect(content).toContain("REG-SUPPLY-LB94-001");
    expect(content).toContain("Suministro de equipos administrativos");
    expect(content).not.toContain("CONTR/2026/240267");
    expect(content).not.toContain("FERRETERÍA");
    expect(content).not.toMatch(/\{\{[A-Za-z0-9.]+\}\}/);
    expect(rendered.humanValidationRequired).toBe(true);
    expect(rendered.styleFingerprint).toBe(template.derivedStyleFingerprint);
  });

  it("bloquea render si falta un slot obligatorio", () => {
    const source = donor();
    const template = deriveSupplyGeneralEditableTemplate({ kind: "PPT", source: source.asset, expectedSourceStyleFingerprint: source.style });
    expect(() => renderSupplyGeneralEditableTemplate({ template, values: values().filter(item => item.slotId !== "technicalRequirements"), caseId: "REG-SUPPLY-LB94-002" })).toThrow(/technicalRequirements/);
  });

  it("escapa contenido de usuario y no permite inyección ODF", () => {
    const source = donor();
    const template = deriveSupplyGeneralEditableTemplate({ kind: "PPT", source: source.asset, expectedSourceStyleFingerprint: source.style });
    const unsafe = values().map(item => item.slotId === "object" ? { ...item, value: "Equipo <text:p>inyectado</text:p> & control" } : item);
    const rendered = renderSupplyGeneralEditableTemplate({ template, values: unsafe, caseId: "REG-SUPPLY-LB94-003" });
    const content = Buffer.from(readOdtZip(rendered.bytes).find(item => item.name === "content.xml")!.bytes).toString("utf8");
    expect(content).toContain("Equipo &lt;text:p&gt;inyectado&lt;/text:p&gt; &amp; control");
  });
});
