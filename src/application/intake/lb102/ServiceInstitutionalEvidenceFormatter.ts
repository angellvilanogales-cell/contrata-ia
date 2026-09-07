import {readOdtZip,writeOdtZip,type OdtZipEntry} from "../lb23/OdtPackageCodec";
import {extractPandaSourceLines,reflowPandaSourceLines} from "./PandaInstitutionalEvidenceFormatter";

function esc(value:string){return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");}
function isHeading(line:string){const compact=line.replace(/\s+/g," ").trim();if(/^\d+(?:\.\d+)*\.?\s+[A-ZÁÉÍÓÚÑ]/.test(compact))return true;if(/^(?:ANEXO|ÍNDICE)\b/i.test(compact))return true;const letters=compact.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g,"");return compact.length<=150&&letters.length>=5&&letters===letters.toLocaleUpperCase("es");}
function isMeta(line:string){return /^(?:C[óo]digo|CPV|EXPTE\.?|Expediente|Objeto|Importe|Valor estimado|Presupuesto|Plazo|Duraci[óo]n|Procedimiento|Tramitaci[óo]n)\b/i.test(line);}
function styleFor(line:string,index:number){if(index===0)return"CI_Service_Title";if(isHeading(line))return/^\d+\.\d+/.test(line)?"CI_Service_Heading2":"CI_Service_Heading1";if(isMeta(line))return"CI_Service_Meta";return"CI_Service_Body";}

const AUTO_STYLES=`
<style:style style:name="CI_Service_Title" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-bottom="0.55cm"/><style:text-properties fo:font-size="14pt" fo:font-weight="bold"/></style:style>
<style:style style:name="CI_Service_Heading1" style:family="paragraph"><style:paragraph-properties fo:margin-top="0.40cm" fo:margin-bottom="0.16cm" fo:keep-with-next="always"/><style:text-properties fo:font-size="12pt" fo:font-weight="bold"/></style:style>
<style:style style:name="CI_Service_Heading2" style:family="paragraph"><style:paragraph-properties fo:margin-top="0.28cm" fo:margin-bottom="0.12cm" fo:keep-with-next="always"/><style:text-properties fo:font-size="11pt" fo:font-weight="bold"/></style:style>
<style:style style:name="CI_Service_Meta" style:family="paragraph"><style:paragraph-properties fo:margin-bottom="0.10cm"/><style:text-properties fo:font-size="10.5pt" fo:font-weight="bold"/></style:style>
<style:style style:name="CI_Service_Body" style:family="paragraph"><style:paragraph-properties fo:text-align="justify" fo:line-height="115%" fo:margin-bottom="0.16cm"/><style:text-properties fo:font-size="10.5pt"/></style:style>`;

function injectStyles(xml:string){if(xml.includes('style:name="CI_Service_Body"'))return xml;const close="</office:automatic-styles>";if(xml.includes(close))return xml.replace(close,`${AUTO_STYLES}${close}`);const body=xml.search(/<office:body\b/);if(body<0)throw new Error("Service Memoria sin office:body para crear automatic-styles.");return `${xml.slice(0,body)}<office:automatic-styles>${AUTO_STYLES}</office:automatic-styles>${xml.slice(body)}`;}
function replaceOfficeText(xml:string,fragment:string){const open=xml.match(/<office:text\b[^>]*>/);if(!open||open.index===undefined)throw new Error("Service Memoria sin office:text.");const start=open.index+open[0].length,end=xml.lastIndexOf("</office:text>");if(end<start)throw new Error("Service Memoria con office:text inválido.");return xml.slice(0,start)+fragment+xml.slice(end);}
export function serviceInstitutionalParagraphFragment(lines:readonly string[]){return lines.map((line,index)=>`<text:p text:style-name="${styleFor(line,index)}">${esc(line)}</text:p>`).join("");}

/**
 * Las memorias Service V8 fueron reconstruidas página a página y en ciertos
 * activos cada página quedó concentrada en un único text:p con saltos internos.
 * Esta transformación vuelve a materializar los párrafos reales detectados en
 * la fuente, sin inventar contenido ni rebajar el mínimo de calidad LB102.
 */
export function institutionalizeServiceMemoryOdt(sourceBytes:Uint8Array,label:string):Uint8Array{
 const lines=reflowPandaSourceLines(extractPandaSourceLines(sourceBytes));
 if(lines.length<20)throw new Error(`${label}: la fuente no permite reconstruir 20 párrafos materiales (${lines.length}).`);
 const entries=readOdtZip(sourceBytes);const transformed:OdtZipEntry[]=entries.map(entry=>{
  if(entry.name!=="content.xml")return entry;
  let xml=Buffer.from(entry.bytes).toString("utf8");xml=injectStyles(xml);xml=replaceOfficeText(xml,serviceInstitutionalParagraphFragment(lines));return{...entry,bytes:Buffer.from(xml,"utf8")};
 });
 return writeOdtZip(transformed);
}
