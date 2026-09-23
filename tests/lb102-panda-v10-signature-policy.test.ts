import {describe,expect,it} from "vitest";
import {readOdtZip,writeOdtZip,type OdtZipEntry} from "../src/application/intake/lb23/OdtPackageCodec";
import {assertNoOdtSignatureResidue,findOdtSignatureResidue,sanitizeOdtSignatureResidue} from "../src/application/intake/lb102/OdtSignatureResidueSanitizer";

function entry(name:string,content:string):OdtZipEntry{return{name,bytes:Buffer.from(content,"utf8"),method:name==="mimetype"?0:8,modTime:0,modDate:0,externalAttributes:0};}
function odt(content:string,withCrypto=false){const entries:OdtZipEntry[]=[entry("mimetype","application/vnd.oasis.opendocument.text"),entry("content.xml",content),entry("styles.xml","<office:document-styles/>")];if(withCrypto)entries.push(entry("META-INF/documentsignatures.xml","<signatures/>"));return writeOdtZip(entries);}
function contentText(bytes:Uint8Array){const e=readOdtZip(bytes).find(x=>x.name==="content.xml");return Buffer.from(e?.bytes??[]).toString("utf8");}

describe("LB102 Panda V10 anti-firma",()=>{
 it("elimina bloque visible de firma y verificación sin borrar una mención ordinaria a la firma",()=>{
  const source=odt(`<?xml version="1.0"?><office:document-content><office:body><office:text><text:p>Responsable previsto: María Ejemplo<text:line-break/>(Lugar, fecha y firma)<text:line-break/>MARIA EJEMPLO 25/07/2025 08:23:56 PÁGINA: 1 / 5<text:line-break/>VERIFICACIÓN NJyGw34knSf4qfA7dOgi90g4shuF55 https://ws050.juntadeandalucia.es/verificarFirma/</text:p></office:text></office:body></office:document-content>`);
  expect(findOdtSignatureResidue(source).length).toBeGreaterThan(0);
  const clean=sanitizeOdtSignatureResidue(source),xml=contentText(clean);
  expect(xml).toContain("Responsable previsto: María Ejemplo");expect(xml).toContain("(Lugar, fecha y firma)");expect(xml).not.toContain("NJyGw34knSf4qfA7dOgi90g4shuF55");expect(xml).not.toContain("verificarFirma");assertNoOdtSignatureResidue(clean,"fixture");
 });
 it("elimina entradas criptográficas ODF heredadas",()=>{const source=odt(`<?xml version="1.0"?><office:document-content><office:body><office:text><text:p>Contenido limpio</text:p></office:text></office:body></office:document-content>`,true);expect(findOdtSignatureResidue(source)).toContain("entrada criptográfica META-INF/documentsignatures.xml");const clean=sanitizeOdtSignatureResidue(source);expect(readOdtZip(clean).some(x=>x.name==="META-INF/documentsignatures.xml")).toBe(false);assertNoOdtSignatureResidue(clean,"fixture");});
});
