import {describe,expect,it} from "vitest";
import {readOdtZip,writeOdtZip,type OdtZipEntry} from "../src/application/intake/lb23/OdtPackageCodec";
import {harmonizePandaOdtLayout,PANDA_FERRETERIA_LAYOUT_POLICY} from "../src/application/intake/lb102/PandaFerreteriaLayoutHarmonizer";

function entry(name:string,text:string,method:0|8=8):OdtZipEntry{return{name,bytes:Buffer.from(text,"utf8"),method,modTime:0,modDate:0,externalAttributes:0};}
const content='<?xml version="1.0"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"><office:automatic-styles><style:style style:name="P1" style:family="paragraph"><style:text-properties fo:font-family="Liberation Sans" fo:font-size="7.6pt"/></style:style></office:automatic-styles><office:body><office:text><text:p xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" text:style-name="P1">CONTR 2025 466864 · Panda Security · 48760000-3</text:p></office:text></office:body></office:document-content>';
const styles='<?xml version="1.0"?><office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"><office:font-face-decls><style:font-face style:name="Liberation Sans" svg:font-family="Liberation Sans" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0"/></office:font-face-decls><office:styles><style:default-style style:family="paragraph"><style:paragraph-properties fo:line-height="100%"/><style:text-properties fo:font-family="Liberation Sans" fo:font-size="7.6pt" style:font-size-asian="7.6pt" style:font-size-complex="7.6pt"/></style:default-style></office:styles><office:automatic-styles><style:page-layout style:name="pm1"><style:page-layout-properties fo:margin-top="1.2cm" fo:margin-bottom="1.2cm" fo:margin-left="1.3cm" fo:margin-right="1.3cm"/></style:page-layout></office:automatic-styles></office:document-styles>';
const source=writeOdtZip([entry("mimetype","application/vnd.oasis.opendocument.text",0),entry("content.xml",content),entry("styles.xml",styles)]);

describe("LB102 Panda/Ferretería layout harmonizer",()=>{
 it("armoniza tipografía, cuerpo, interlineado y márgenes sin alterar el texto documental",()=>{
  const output=harmonizePandaOdtLayout(source);const entries=readOdtZip(output);const outContent=Buffer.from(entries.find(x=>x.name==="content.xml")!.bytes).toString("utf8");const outStyles=Buffer.from(entries.find(x=>x.name==="styles.xml")!.bytes).toString("utf8");
  expect(outContent.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()).toBe(content.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim());
  expect(outContent).toContain(PANDA_FERRETERIA_LAYOUT_POLICY.font);expect(outContent).toContain(PANDA_FERRETERIA_LAYOUT_POLICY.fontSize);
  expect(outStyles).toContain(PANDA_FERRETERIA_LAYOUT_POLICY.font);expect(outStyles).toContain(`fo:font-size="${PANDA_FERRETERIA_LAYOUT_POLICY.fontSize}"`);expect(outStyles).toContain(`fo:line-height="${PANDA_FERRETERIA_LAYOUT_POLICY.lineHeight}"`);
  expect((outStyles.match(/fo:margin-(?:top|bottom|left|right)="2cm"/g)??[]).length).toBe(4);
  expect(outStyles).not.toContain("Liberation Sans");expect(outStyles).not.toContain("7.6pt");
 });
 it("es determinista",()=>{expect(Buffer.from(harmonizePandaOdtLayout(source)).equals(Buffer.from(harmonizePandaOdtLayout(source)))).toBe(true);});
});
