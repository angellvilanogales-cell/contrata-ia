import {describe,expect,it} from "vitest";
import {readOdtZip,writeOdtZip,type OdtZipEntry} from "../src/application/intake/lb23/OdtPackageCodec";
import {auditCanonicalOdtVisualProfile,assertCanonicalOdtVisualProfile} from "../src/application/intake/lb105/CanonicalOdtVisualAudit";
import {CANONICAL_MEMORY_PPT_VISUAL_PROFILE as P} from "../src/domain/documentModel/CanonicalDocumentVisualProfile";

function entry(name:string,value:string|Uint8Array,method:0|8=8):OdtZipEntry{return{name,bytes:typeof value==="string"?Buffer.from(value):value,method,modTime:0,modDate:0,externalAttributes:0};}
function style(name:string,font:string,size:number,weight:string,color:string,align:string){return `<style:style style:name="${name}" style:family="paragraph"><style:paragraph-properties fo:text-align="${align}" fo:line-height="115%" fo:margin-bottom="0.18cm"/><style:text-properties style:font-name="${font}" fo:font-size="${size}pt" fo:font-weight="${weight}" fo:color="${color}"/></style:style>`;}
function fixture(options:{logo?:boolean;justifyBody?:boolean}={}){const logo=options.logo!==false;const stylesList=Object.values(P.styles).map(s=>style(s.styleName,s.fontFamily,s.fontSizePt,s.fontWeight,s.color,s.styleName===P.styles.body.styleName&&options.justifyBody===false?"left":s.alignment)).join("");const styles=`<office:document-styles xmlns:office="urn:o" xmlns:style="urn:s" xmlns:fo="urn:f" xmlns:text="urn:t" xmlns:draw="urn:d" xmlns:xlink="urn:x"><office:styles>${stylesList}</office:styles><office:automatic-styles><style:page-layout style:name="pm"><style:page-layout-properties fo:page-width="21cm" fo:page-height="29.7cm" fo:margin-top="1.8cm" fo:margin-right="2cm" fo:margin-bottom="1.8cm" fo:margin-left="2cm"/></style:page-layout></office:automatic-styles><office:master-styles><style:master-page style:name="M"><style:footer><text:p><text:page-number/></text:p></style:footer></style:master-page></office:master-styles></office:document-styles>`;const content=`<office:document-content xmlns:office="urn:o" xmlns:text="urn:t" xmlns:draw="urn:d" xmlns:xlink="urn:x"><office:body><office:text>${logo?'<text:p><draw:frame><draw:image xlink:href="Pictures/logo.png"/></draw:frame></text:p>':''}</office:text></office:body></office:document-content>`;return writeOdtZip([entry("mimetype","application/vnd.oasis.opendocument.text",0),entry("content.xml",content),entry("styles.xml",styles),...(logo?[entry("Pictures/logo.png",new Uint8Array([1,2,3]))]:[])]);}

describe("LB105 perfil visual físico de Memoria y PPT",()=>{
  it("acepta tipografía, jerarquía, justificación, página, logo y pie conformes",()=>{const result=auditCanonicalOdtVisualProfile(fixture());expect(result.ready).toBe(true);expect(()=>assertCanonicalOdtVisualProfile(fixture())).not.toThrow();});
  it("rechaza imagen referenciada que no existe en el paquete",()=>{
    const entries = readOdtZip(fixture()).map(e => e.name === "Pictures/logo.png" ? {...e, name:"Pictures/otra.png"} : e);
    expect(auditCanonicalOdtVisualProfile(writeOdtZip(entries)).ready).toBe(false);
  });
  it("rechaza interlineado incorrecto",()=>{
    const entries = readOdtZip(fixture()).map(e => e.name === "styles.xml" ? {...e, bytes:Buffer.from(Buffer.from(e.bytes).toString("utf8").replaceAll('fo:line-height="115%"','fo:line-height="100%"'))} : e);
    expect(auditCanonicalOdtVisualProfile(writeOdtZip(entries)).blockers).toContain("Cuerpo: interlineado distinto de 115%.");
  });
  it("no acepta numeración fuera del pie",()=>{
    const entries = readOdtZip(fixture()).map(e => e.name === "styles.xml" ? {...e, bytes:Buffer.from(Buffer.from(e.bytes).toString("utf8").replace('<style:footer>','<style:header>').replace('</style:footer>','</style:header>'))} : e);
    expect(auditCanonicalOdtVisualProfile(writeOdtZip(entries)).ready).toBe(false);
  });
  it("rechaza cuerpo no justificado",()=>{const result=auditCanonicalOdtVisualProfile(fixture({justifyBody:false}));expect(result.ready).toBe(false);expect(result.blockers.join(" ")).toContain("alineación distinta de justify");});
  it("rechaza ausencia de logotipo embebido",()=>{const result=auditCanonicalOdtVisualProfile(fixture({logo:false}));expect(result.ready).toBe(false);expect(result.blockers).toContain("Falta un logotipo institucional embebido y referenciado.");});
});
