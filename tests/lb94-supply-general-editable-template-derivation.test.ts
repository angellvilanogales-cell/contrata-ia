import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { writeOdtZip, readOdtZip, type OdtZipEntry } from "../src/application/intake/lb23/OdtPackageCodec";
import { computeOdtStyleFingerprint } from "../src/application/intake/lb23/UniversalOdtProductionRenderer";
import {
  deriveSupplyGeneralEditableTemplate,
  supplyGeneralTemplatePlaceholders,
  SUPPLY_GENERAL_STRUCTURAL_CORPUS,
} from "../src/application/intake/lb94/SupplyGeneralEditableTemplateDerivation";
import type { VerifiedEditableAsset } from "../src/infrastructure/operations/lb52/VerifiedEditableAssetStore";

function entry(name: string, value: string, compression: "STORE" | "DEFLATE" = "DEFLATE"): OdtZipEntry {
  return { name, bytes: Buffer.from(value, "utf8"), compression };
}

function fixtureAsset(): { asset: VerifiedEditableAsset; style: string } {
  const entries: OdtZipEntry[] = [
    entry("mimetype", "application/vnd.oasis.opendocument.text", "STORE"),
    entry("META-INF/manifest.xml", "<?xml version=\"1.0\"?><manifest:manifest xmlns:manifest=\"urn:oasis:names:tc:opendocument:xmlns:manifest:1.0\"/>", "DEFLATE"),
    entry("styles.xml", "<?xml version=\"1.0\"?><office:document-styles xmlns:office=\"urn:oasis:names:tc:opendocument:xmlns:office:1.0\"><office:styles/></office:document-styles>"),
    entry("settings.xml", "<?xml version=\"1.0\"?><office:document-settings xmlns:office=\"urn:oasis:names:tc:opendocument:xmlns:office:1.0\"/>", "DEFLATE"),
    entry("meta.xml", "<?xml version=\"1.0\"?><office:document-meta xmlns:office=\"urn:oasis:names:tc:opendocument:xmlns:office:1.0\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\"><office:meta><dc:title>CONTR/2026/240267 FERRETERÍA</dc:title></office:meta></office:document-meta>"),
    entry("content.xml", "<?xml version=\"1.0\"?><office:document-content xmlns:office=\"urn:oasis:names:tc:opendocument:xmlns:office:1.0\" xmlns:text=\"urn:oasis:names:tc:opendocument:xmlns:text:1.0\"><office:automatic-styles/><office:body><office:text><text:p>CONTR/2026/240267</text:p><text:p>44316400-2</text:p><text:p>FERRETERÍA</text:p><text:p>ABRAZADERAS MANGUERA</text:p></office:text></office:body></office:document-content>"),
  ];
  const bytes = writeOdtZip(entries);
  const sha = createHash("sha256").update(bytes).digest("hex");
  const style = computeOdtStyleFingerprint(readOdtZip(bytes));
  return {
    style,
    asset: {
      descriptor: {
        assetId: "ferreteria:memory:v12:letrado:odt",
        fileName: "fixture.odt",
        expectedSha256: sha,
        mediaType: "application/vnd.oasis.opendocument.text",
        role: "REAL_CASE_EDITABLE",
      },
      bytes,
      actualSha256: sha,
    },
  };
}

describe("LB94 — derivación física general Supply", () => {
  it("elimina marcadores del expediente donante y conserva la huella de estilos", () => {
    const { asset, style } = fixtureAsset();
    const result = deriveSupplyGeneralEditableTemplate({ kind: "MEMORY", source: asset, expectedSourceStyleFingerprint: style });
    expect(result.ready).toBe(true);
    expect(result.contaminationHits).toEqual([]);
    expect(result.derivedStyleFingerprint).toBe(style);
    expect(result.derivedSha256).not.toBe(result.sourceSha256);
    const xml = Buffer.from(readOdtZip(result.bytes).find(item => item.name === "content.xml")!.bytes).toString("utf8");
    expect(xml).not.toContain("CONTR/2026/240267");
    expect(xml).not.toContain("44316400-2");
    expect(xml).not.toContain("FERRETERÍA");
    expect(xml).toContain("{{object}}");
  });

  it("crea esqueletos distintos para Memoria y PPT con slots explícitos", () => {
    expect(supplyGeneralTemplatePlaceholders("MEMORY")).toContain("economicSummary");
    expect(supplyGeneralTemplatePlaceholders("MEMORY")).toContain("awardCriteriaSummary");
    expect(supplyGeneralTemplatePlaceholders("PPT")).toContain("technicalRequirements");
    expect(supplyGeneralTemplatePlaceholders("PPT")).toContain("receiptAndAcceptanceRegime");
  });

  it("acredita generalización mediante corpus multicaso, no por un único expediente", () => {
    expect(SUPPLY_GENERAL_STRUCTURAL_CORPUS.length).toBeGreaterThanOrEqual(7);
    expect(new Set(SUPPLY_GENERAL_STRUCTURAL_CORPUS).size).toBe(SUPPLY_GENERAL_STRUCTURAL_CORPUS.length);
  });

  it("bloquea un donante que no sea activo real editable verificado", () => {
    const { asset, style } = fixtureAsset();
    const bad: VerifiedEditableAsset = { ...asset, descriptor: { ...asset.descriptor, role: "DERIVED_ACCEPTED_CANDIDATE" } };
    const result = deriveSupplyGeneralEditableTemplate({ kind: "PPT", source: bad, expectedSourceStyleFingerprint: style });
    expect(result.ready).toBe(false);
    expect(result.blockers.some(item => item.includes("activo real editable"))).toBe(true);
  });
});
