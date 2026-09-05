import {describe,expect,it} from "vitest";
import {writeOdtZip,readOdtZip,type OdtZipEntry} from "../src/application/intake/lb23/OdtPackageCodec";
import {findOdtSignatureResidue,sanitizeOdtSignatureResidue} from "../src/application/intake/lb102/OdtSignatureResidueSanitizer";

function entry(name:string,text:string,method:0|8=8):OdtZipEntry{return{name,bytes:Buffer.from(text,"utf8"),method,modTime:0,modDate:0,externalAttributes:0};}
function odt(content:string,extra:OdtZipEntry[]=[]){return writeOdtZip([
 entry("mimetype","application/vnd.oasis.opendocument.text",0),
 entry("content.xml",`<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"><office:body><office:text>${content}</office:text></office:body></office:document-content>`),
 entry("styles.xml",`<?xml version="1.0" encoding="UTF-8"?><office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"/>`),
 entry("META-INF/manifest.xml",`<?xml version="1.0" encoding="UTF-8"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"/>`),
 ...extra,
]);}
function content(bytes:Uint8Array){const e=readOdtZip(bytes).find(x=>x.name==="content.xml");return e?Buffer.from(e.bytes).toString("utf8"):"";}

describe("LB102 anti-firma sin falsos positivos jurídicos",()=>{
 it("no confunde la expresión jurídica 'documento firmado por una persona representante' con una firma digital",()=>{
  const sentence="Ninguna de las partes podrá modificar el acuerdo sin un documento firmado por una persona representante de la otra parte.";
  const bytes=odt(`<text:p>${sentence}</text:p><text:p>Los sistemas de verificación correspondientes podrán consultarse.</text:p>`);
  expect(findOdtSignatureResidue(bytes)).toEqual([]);
  const cleaned=sanitizeOdtSignatureResidue(bytes);
  expect(content(cleaned)).toContain(sentence);
 });

 it("sigue detectando y eliminando un bloque real de firma/verificación",()=>{
  const bytes=odt(`<text:p>FIRMADO POR CLAUDIA LEDESMA LOPEZ</text:p><text:p>CÓDIGO SEGURO DE VERIFICACIÓN ABCDEF1234567890 PÁGINA 1</text:p><text:p>Contenido material conservado</text:p>`,[
   entry("META-INF/documentsignatures.xml","<signatures/>")
  ]);
  expect(findOdtSignatureResidue(bytes).join(" ")).toMatch(/firma|verificaci|criptográfica/i);
  const cleaned=sanitizeOdtSignatureResidue(bytes);
  expect(findOdtSignatureResidue(cleaned)).toEqual([]);
  expect(content(cleaned)).toContain("Contenido material conservado");
  expect(content(cleaned)).not.toContain("CLAUDIA LEDESMA LOPEZ");
 });
});
