import {readOdtZip,writeOdtZip,type OdtZipEntry} from "../lb23/OdtPackageCodec";

const SIGNATURE_ENTRY=/^(?:META-INF\/)?(?:document|macro|xades)?signatures?\.xml$/i;
const HARD_MARKERS=[/C[ÓO]DIGO SEGURO DE VERIFICACI[ÓO]N/i,/ws050\.juntadeandalucia\.es\/verificarFirma/i] as const;

function plain(value:string){return value.replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/&nbsp;/g," ").replace(/\s+/g," ").trim();}
function isVerificationLine(line:string){const text=plain(line);return /VERIFICACI[ÓO]N/i.test(text)&&(/[A-Za-z0-9]{12,}/.test(text)||/P[ÁA]G(?:INA)?\.?\s*[:.]?\s*\d+/i.test(text)||/verificarFirma/i.test(text));}
function isSignedIdentityLine(line:string){const text=plain(line);return /^FIRMADO POR\b/i.test(text)||(/\b\d{2}\/\d{2}\/\d{4}(?:\s+\d{2}:\d{2}:\d{2})?\b/.test(text)&&/P[ÁA]G(?:INA)?\.?\s*[:.]?\s*\d+/i.test(text));}
function isVerificationIntro(line:string){const text=plain(line);return /Puede verificar la integridad de este documento/i.test(text)||(/direcci[óo]n/i.test(text)&&/verificarFirma/i.test(text));}
function isAuthenticCopyLine(line:string){return /Es copia aut[ée]ntica de documento electr[óo]nico/i.test(plain(line));}
function paragraphLines(xml:string){const lines:string[]=[];for(const match of xml.matchAll(/<text:p\b[^>]*>([\s\S]*?)<\/text:p>/g)){for(const part of (match[1]??"").split("<text:line-break/>"))lines.push(part);}return lines;}

function sanitizeParagraphBody(body:string){
 const parts=body.split("<text:line-break/>");
 const drop=new Set<number>();
 for(let i=0;i<parts.length;i+=1){
  const line=parts[i]??"";
  if(isAuthenticCopyLine(line)||isVerificationIntro(line)||isVerificationLine(line)||isSignedIdentityLine(line))drop.add(i);
  if(isVerificationLine(line)||/verificarFirma/i.test(plain(line))){
   for(let j=Math.max(0,i-2);j<i;j+=1)if(isSignedIdentityLine(parts[j]??"")||isVerificationIntro(parts[j]??""))drop.add(j);
  }
 }
 return parts.filter((_,i)=>!drop.has(i)).join("<text:line-break/>");
}

function sanitizeContentXml(xml:string){
 return xml.replace(/(<text:p\b[^>]*>)([\s\S]*?)(<\/text:p>)/g,(_all:string,open:string,body:string,close:string)=>open+sanitizeParagraphBody(body)+close);
}

/** Elimina únicamente huellas de firma/verificación heredadas del documento fuente. No elimina menciones jurídicas ordinarias a "firma". */
export function sanitizeOdtSignatureResidue(sourceBytes:Uint8Array):Uint8Array{
 const entries=readOdtZip(sourceBytes).filter(entry=>!SIGNATURE_ENTRY.test(entry.name));
 const transformed:OdtZipEntry[]=entries.map(entry=>{
  if(entry.name!=="content.xml")return entry;
  const xml=Buffer.from(entry.bytes).toString("utf8");
  return{...entry,bytes:Buffer.from(sanitizeContentXml(xml),"utf8")};
 });
 const bytes=writeOdtZip(transformed);assertNoOdtSignatureResidue(bytes,"ODT saneado");return bytes;
}

export function findOdtSignatureResidue(bytes:Uint8Array):string[]{
 const findings:string[]=[];
 const entries=readOdtZip(bytes);
 for(const entry of entries)if(SIGNATURE_ENTRY.test(entry.name))findings.push(`entrada criptográfica ${entry.name}`);
 const content=entries.find(entry=>entry.name==="content.xml");
 if(content){
  const xml=Buffer.from(content.bytes).toString("utf8");
  for(const marker of HARD_MARKERS)if(marker.test(xml))findings.push(`marca visible ${marker.source}`);
  for(const line of paragraphLines(xml)){
   if(isSignedIdentityLine(line))findings.push("bloque visible FIRMADO POR/identidad firmante");
   if(isAuthenticCopyLine(line))findings.push("marca visible de copia auténtica");
   if(isVerificationIntro(line)||isVerificationLine(line))findings.push("bloque visible de verificación");
  }
 }
 return [...new Set(findings)];
}

export function assertNoOdtSignatureResidue(bytes:Uint8Array,label:string){const findings=findOdtSignatureResidue(bytes);if(findings.length)throw new Error(`${label}: conserva huellas de firma/verificación (${findings.join(" · ")}).`);}
