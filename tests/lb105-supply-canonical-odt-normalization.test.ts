import { describe, expect, it } from "vitest";
import { readOdtZip, writeOdtZip, type OdtZipEntry } from "../src/application/intake/lb23/OdtPackageCodec";
import { auditCanonicalOdtStructure } from "../src/application/intake/lb104/CanonicalOdtStructureAudit";
import { auditCanonicalOdtVisualProfile } from "../src/application/intake/lb105/CanonicalOdtVisualAudit";
import { normalizeSupplyGeneralOdtLb105 } from "../src/application/intake/lb105/SupplyCanonicalOdtNormalization";

function entry(name: string, value: string | Uint8Array, method: 0 | 8 = 8): OdtZipEntry {
  return { name, bytes: typeof value === "string" ? Buffer.from(value) : value, method, modTime: 0, modDate: 0, externalAttributes: 0 };
}

function fixture(selfClosingPageLayout = false, selfClosingMasterPage = false): Uint8Array {
  return writeOdtZip([
    entry("mimetype", "application/vnd.oasis.opendocument.text", 0),
    entry("META-INF/manifest.xml", '<manifest:manifest xmlns:manifest="urn:m"/>'),
    entry("Pictures/logo.png", new Uint8Array([1, 2, 3, 4])),
    entry("content.xml", '<office:document-content xmlns:office="urn:o" xmlns:text="urn:t"><office:automatic-styles/><office:body><office:text><text:p>ANTIGUO</text:p></office:text></office:body></office:document-content>'),
    entry("styles.xml", `<office:document-styles xmlns:office="urn:o" xmlns:style="urn:s" xmlns:fo="urn:f" xmlns:text="urn:t" xmlns:draw="urn:d" xmlns:xlink="urn:x"><office:styles/><office:automatic-styles><style:page-layout style:name="pm">${selfClosingPageLayout ? '<style:page-layout-properties fo:page-width="20cm"/>' : '<style:page-layout-properties fo:page-width="20cm" fo:page-height="20cm"><style:footnote-sep/></style:page-layout-properties>'}<style:footer-style/></style:page-layout>${selfClosingMasterPage ? '<style:page-layout style:name="pm2"><style:page-layout-properties fo:page-width="20cm"/></style:page-layout>' : ''}</office:automatic-styles><office:master-styles>${selfClosingMasterPage ? '<style:master-page style:name="Standard" style:page-layout-name="pm"/>' : ''}<style:master-page style:name="M"><style:header><text:p><draw:frame><draw:image xlink:href="Pictures/logo.png"/></draw:frame></text:p></style:header><style:footer><text:p><text:page-number/></text:p></style:footer></style:master-page>${selfClosingMasterPage ? '<style:master-page style:name="MP0" style:page-layout-name="pm2"/>' : ''}</office:master-styles></office:document-styles>`),
  ]);
}

describe("LB105 normalización física Supply", () => {
  for (const kind of ["MEMORY", "PPT"] as const) {
    it(`aplica canon y perfil visual a ${kind}`, () => {
      const bytes = normalizeSupplyGeneralOdtLb105(fixture(), kind);
      expect(auditCanonicalOdtStructure({ bytes, document: kind, family: "SUPPLY" }).ready).toBe(true);
      expect(auditCanonicalOdtVisualProfile(bytes).ready).toBe(true);
    });
  }

  it("es determinista", () => {
    expect(Buffer.from(normalizeSupplyGeneralOdtLb105(fixture(), "MEMORY"))).toEqual(Buffer.from(normalizeSupplyGeneralOdtLb105(fixture(), "MEMORY")));
  });

  it("conserva autocerrado el layout autocerrado del ODT persistido", () => {
    const bytes = normalizeSupplyGeneralOdtLb105(fixture(true), "MEMORY");
    expect(auditCanonicalOdtVisualProfile(bytes).ready).toBe(true);
  });

  it("expande y normaliza páginas maestras autocerradas", () => {
    const bytes = normalizeSupplyGeneralOdtLb105(fixture(false, true), "PPT");
    const styles = Buffer.from(readOdtZip(bytes).find(item => item.name === "styles.xml")!.bytes).toString("utf8");
    expect(styles).not.toContain('<style:master-page style:name="Standard" style:page-layout-name="pm"/>');
    expect(styles.match(/draw:name="CI_LB105_Junta_Andalucia"/g)).toHaveLength(3);
    expect(styles.match(/REVISIÓN HUMANA OBLIGATORIA/g)).toHaveLength(3);
    expect(styles).toContain('style:name="CI_LB105_Title" style:family="paragraph" style:master-page-name="MP0"');
    expect(styles).toContain('style:page-layout-name="pm"');
    expect(styles.match(/fo:min-height="1.5cm"/g)).toHaveLength(2);
    expect(styles.match(/fo:min-height="0.6cm"/g)).toHaveLength(2);
  });
});
