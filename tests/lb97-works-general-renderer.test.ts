import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { readOdtZip, writeOdtZip, type OdtZipEntry } from "../src/application/intake/lb23/OdtPackageCodec";
import { computeOdtStyleFingerprint } from "../src/application/intake/lb23/UniversalOdtProductionRenderer";
import { renderWorksGeneralTemplate } from "../src/application/intake/lb97/WorksGeneralEditableTemplateRenderer";
import type { WorksGeneralTemplateManifestRecord } from "../src/application/intake/lb97/WorksGeneralTemplateManifest";

function e(name:string,value:string,method:0|8=8):OdtZipEntry{return{name,bytes:Buffer.from(value),method,modTime:0,modDate:0,externalAttributes:0};}
function fixture(){return writeOdtZip([e("mimetype","application/vnd.oasis.opendocument.text",0),e("content.xml",'<office:document-content><office:automatic-styles><style:style style:name="P1"/></office:automatic-styles><office:body><office:text><text:p>{{caseId}}</text:p><text:p>{{projectSummary}}</text:p></office:text></office:body></office:document-content>'),e("styles.xml",'<office:document-styles><office:styles><style:style style:name="Standard"/></office:styles></office:document-styles>'),e("settings.xml",'<office:document-settings/>'),e("META-INF/manifest.xml",'<manifest:manifest/>')]);}
function manifest(bytes:Uint8Array):WorksGeneralTemplateManifestRecord{return{templateId:"test:works",kind:"PCAP",fileName:"test.odt",mediaType:"application/vnd.oasis.opendocument.text",expectedSha256:createHash("sha256").update(bytes).digest("hex"),expectedStyleFingerprint:computeOdtStyleFingerprint(readOdtZip(bytes)),provenance:"CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",officialModel:false,sourceAuthority:"JDA_RECOMMENDED_WORKS_MODELS_2025_12_PLUS_LCSP_231_244",humanValidationRequired:true,slots:["caseId","projectSummary"]};}
describe("LB97 renderer Works",()=>{
  it("materializa todos los slots sin alterar estilos",()=>{const bytes=fixture();const m=manifest(bytes);const result=renderWorksGeneralTemplate({manifest:m,templateBytes:bytes,values:{caseId:"REG-WORKS-001",projectSummary:"Proyecto aprobado y replanteado"}});const content=Buffer.from(readOdtZip(result.bytes).find(x=>x.name==="content.xml")!.bytes).toString("utf8");expect(content).toContain("REG-WORKS-001");expect(content).not.toContain("{{");expect(result.styleFingerprint).toBe(m.expectedStyleFingerprint);expect(result.humanValidationRequired).toBe(true);});
  it("rechaza la generación si falta una decisión/valor documental",()=>{const bytes=fixture();expect(()=>renderWorksGeneralTemplate({manifest:manifest(bytes),templateBytes:bytes,values:{caseId:"REG-WORKS-001"}})).toThrow(/projectSummary/);});
});
