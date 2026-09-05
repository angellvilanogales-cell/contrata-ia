import {readOdtZip,writeOdtZip,type OdtZipEntry} from "../lb23/OdtPackageCodec";
import {harmonizePandaOdtLayout} from "./PandaFerreteriaLayoutHarmonizer";

export type PandaEvidenceDocumentKind="MEMORIA"|"PPT";

function decodeXml(value:string){return value.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'");}
function plain(value:string){return decodeXml(value.replace(/<[^>]+>/g," ")).replace(/\s+/g," ").trim();}
function esc(value:string){return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");}
function isPageArtifact(line:string){return /^P[ÁA]GINA\s*:?\s*\d+/i.test(line)||/^\d+\s*\/\s*\d+$/.test(line)||/^Archivo:/i.test(line)||/^Secci[óo]n de Inform[áa]tica y Sistemas\s+\d+\s*\/\s*\d+/i.test(line)||/C[ÓO]DIGO SEGURO DE VERIFICACI[ÓO]N/i.test(line)||/verificarFirma/i.test(line)||/^VERIFICACI[ÓO]N\b/i.test(line)||/^FIRMADO POR\b/i.test(line)||/^Es copia aut[ée]ntica de documento electr[óo]nico/i.test(line)||/^Puede verificar la integridad de este documento/i.test(line);}
function isHeading(line:string){const compact=line.replace(/\s+/g," ").trim();if(/^\d+(?:\.\d+)*\.?\s+[A-ZÁÉÍÓÚÑ]/.test(compact))return true;if(/^(?:ANEXO|ÍNDICE)\b/i.test(compact))return true;const letters=compact.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g,"");return compact.length<=150&&letters.length>=5&&letters===letters.toLocaleUpperCase("es");}
function isMeta(line:string){return /^(?:C[óo]digo|CPV|EXPTE\.?|Expediente|Localidad|T[íi]tulo|Objeto|Importe|Valor estimado|Presupuesto|Plazo|Duraci[óo]n|Tramitaci[óo]n)\b/i.test(line);}
function isBullet(line:string){return /^[•·▪◦-]\s*/.test(line);}
function endsParagraph(line:string){return /[.!?;:]$/.test(line)||isHeading(line)||isMeta(line)||isBullet(line);}

export function extractPandaSourceLines(bytes:Uint8Array):string[]{
 const content=readOdtZip(bytes).find(entry=>entry.name==="content.xml");if(!content)throw new Error("ODT Panda sin content.xml.");
 const xml=Buffer.from(content.bytes).toString("utf8");const lines:string[]=[];
 for(const match of xml.matchAll(/<text:p\b[^>]*>([\s\S]*?)<\/text:p>/g)){
  for(const part of (match[1]??"").split(/<text:line-break\s*\/>/g)){const value=plain(part);if(value&&!isPageArtifact(value))lines.push(value);}
 }
 return lines;
}

export function reflowPandaSourceLines(input:readonly string[]):string[]{
 const out:string[]=[];let pending="";
 const flush=()=>{const value=pending.replace(/\s+/g," ").trim();if(value)out.push(value);pending="";};
 for(const raw of input){const line=raw.replace(/\s+/g," ").trim();if(!line)continue;
  if(isHeading(line)||isMeta(line)||isBullet(line)){flush();out.push(line);continue;}
  pending=pending?`${pending} ${line}`:line;if(endsParagraph(line))flush();
 }
 flush();return out;
}

function styleFor(line:string,index:number){if(index===0)return"CI_Title";if(isHeading(line))return/^\d+\.\d+/.test(line)?"CI_Heading2":"CI_Heading1";if(isBullet(line))return"CI_Bullet";if(isMeta(line))return"CI_Meta";return"CI_Body";}

export function pandaInstitutionalParagraphFragment(lines:readonly string[]):string{
 return lines.map((line,index)=>`<text:p text:style-name="${styleFor(line,index)}">${esc(line)}</text:p>`).join("");
}

const AUTO_STYLES=`
<style:style style:name="CI_Title" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-bottom="0.55cm"/><style:text-properties style:font-name="Source Sans Pro" fo:font-family="Source Sans Pro" fo:font-size="14pt" fo:font-weight="bold"/></style:style>
<style:style style:name="CI_Heading1" style:family="paragraph"><style:paragraph-properties fo:margin-top="0.42cm" fo:margin-bottom="0.18cm" fo:keep-with-next="always"/><style:text-properties style:font-name="Source Sans Pro" fo:font-family="Source Sans Pro" fo:font-size="12pt" fo:font-weight="bold"/></style:style>
<style:style style:name="CI_Heading2" style:family="paragraph"><style:paragraph-properties fo:margin-top="0.30cm" fo:margin-bottom="0.12cm" fo:keep-with-next="always"/><style:text-properties style:font-name="Source Sans Pro" fo:font-family="Source Sans Pro" fo:font-size="11pt" fo:font-weight="bold"/></style:style>
<style:style style:name="CI_Meta" style:family="paragraph"><style:paragraph-properties fo:margin-bottom="0.10cm"/><style:text-properties style:font-name="Source Sans Pro" fo:font-family="Source Sans Pro" fo:font-size="10.5pt" fo:font-weight="bold"/></style:style>
<style:style style:name="CI_Body" style:family="paragraph"><style:paragraph-properties fo:text-align="justify" fo:line-height="115%" fo:margin-bottom="0.16cm"/><style:text-properties style:font-name="Source Sans Pro" fo:font-family="Source Sans Pro" fo:font-size="10.5pt"/></style:style>
<style:style style:name="CI_Bullet" style:family="paragraph"><style:paragraph-properties fo:text-align="justify" fo:line-height="115%" fo:margin-left="0.60cm" fo:text-indent="-0.30cm" fo:margin-bottom="0.12cm"/><style:text-properties style:font-name="Source Sans Pro" fo:font-family="Source Sans Pro" fo:font-size="10.5pt"/></style:style>`;

function injectStyles(xml:string){if(xml.includes('style:name="CI_Body"'))return xml;const close="</office:automatic-styles>";if(!xml.includes(close))throw new Error("ODT Panda sin office:automatic-styles.");return xml.replace(close,`${AUTO_STYLES}${close}`);}
function replaceOfficeText(xml:string,fragment:string){const open=xml.match(/<office:text\b[^>]*>/);if(!open||open.index===undefined)throw new Error("ODT Panda sin office:text.");const start=open.index+open[0].length,end=xml.lastIndexOf("</office:text>");if(end<start)throw new Error("ODT Panda con office:text inválido.");return xml.slice(0,start)+fragment+xml.slice(end);}

export function institutionalizePandaEvidenceOdt(sourceBytes:Uint8Array,kind:PandaEvidenceDocumentKind):Uint8Array{
 const harmonized=harmonizePandaOdtLayout(sourceBytes);const lines=reflowPandaSourceLines(extractPandaSourceLines(harmonized));
 const minimum=kind==="MEMORIA"?28:70;if(lines.length<minimum)throw new Error(`Panda ${kind} V11: estructura documental insuficiente tras reflujo (${lines.length} párrafos; mínimo ${minimum}).`);
 const entries=readOdtZip(harmonized);const transformed:OdtZipEntry[]=entries.map(entry=>{if(entry.name!=="content.xml")return entry;let xml=Buffer.from(entry.bytes).toString("utf8");xml=injectStyles(xml);xml=replaceOfficeText(xml,pandaInstitutionalParagraphFragment(lines));return{...entry,bytes:Buffer.from(xml,"utf8")};});
 const out=writeOdtZip(transformed);assertPandaInstitutionalEvidenceQuality(out,kind);return out;
}

export function assertPandaInstitutionalEvidenceQuality(bytes:Uint8Array,kind:PandaEvidenceDocumentKind){const content=readOdtZip(bytes).find(entry=>entry.name==="content.xml");if(!content)throw new Error(`Panda ${kind} V11: falta content.xml.`);const xml=Buffer.from(content.bytes).toString("utf8");const paras=(xml.match(/<text:p\b/g)??[]).length,headings=(xml.match(/style-name="CI_Heading[12]"/g)??[]).length,body=(xml.match(/style-name="CI_Body"/g)??[]).length;const minParas=kind==="MEMORIA"?28:70,minHeadings=kind==="MEMORIA"?7:10;if(paras<minParas||headings<minHeadings||body<10)throw new Error(`Panda ${kind} V11: formato institucional insuficiente (párrafos ${paras}, epígrafes ${headings}, cuerpo ${body}).`);if(!xml.includes("Source Sans Pro")||!xml.includes("10.5pt")||!xml.includes("fo:text-align=\"justify\""))throw new Error(`Panda ${kind} V11: no se materializó la política tipográfica institucional.`);}
