import {createHash} from "node:crypto";
import type {UniversalEditableTemplateBinaryStore} from "../lb23/UniversalOdtProductionRenderer";
import {computeOdtStyleFingerprint} from "../lb23/UniversalOdtProductionRenderer";
import {readOdtZip,writeOdtZip} from "../lb23/OdtPackageCodec";
import {extractPandaSourceLines,reflowPandaSourceLines} from "./PandaInstitutionalEvidenceFormatter";
import {assertLb102GeneratedDocumentQuality} from "./LB102UniversalDocumentQualityGate";
import {SERVICE_OFFICIAL_OPEN_PCAP_TEMPLATE_ID} from "./LB102PersistedPilotTemplateStores";

function sha(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
function esc(value:string){return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");}
function decodeXml(value:string){return value.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'");}
function plain(xml:string){return decodeXml(xml.replace(/<[^>]+>/g," ")).replace(/\s+/g," ").trim();}
function compact(xml:string){return plain(xml).replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]/g,"").toLocaleLowerCase("es");}
function paragraphs(xml:string){const out:{start:number;end:number;text:string;compact:string;style:string|null}[]=[];for(const match of xml.matchAll(/<text:p\b([^>]*)>[\s\S]*?<\/text:p>/g)){if(match.index===undefined)continue;const attrs=match[1]??"";const sm=/text:style-name="([^"]+)"/.exec(attrs);out.push({start:match.index,end:match.index+match[0].length,text:plain(match[0]),compact:compact(match[0]),style:sm?.[1]??null});}return out;}

function annexRange(xml:string){const pars=paragraphs(xml);const starts=pars.filter(item=>/^anexoi(?:\b|$)/i.test(item.text.replace(/\s+/g," ").trim()));const start=starts[starts.length-1];if(!start)throw new Error("PCAP oficial Service: no se localiza el Anexo I.");const end=pars.find(item=>item.start>start.start&&/^anexoii(?:\b|$)/i.test(item.text.replace(/\s+/g," ").trim()));if(!end)throw new Error("PCAP oficial Service: no se localiza el Anexo II.");const fallbackStyle=pars.find(item=>item.start>start.start&&item.start<end.start&&item.style)?.style??start.style??"Standard";return{start:start.start,end:end.start,style:fallbackStyle};}
function sourceAnnexLines(sourceBytes:Uint8Array){const lines=extractPandaSourceLines(sourceBytes);const starts=lines.map((line,index)=>({line,index})).filter(item=>/^ANEXO\s+I\b/i.test(item.line));if(!starts.length)throw new Error("PCAP Service de evidencia: no se identifica Anexo I.");const start=starts[starts.length-1]!.index;const end=lines.findIndex((line,index)=>index>start&&/^ANEXO\s+II\b/i.test(line));if(end<0)throw new Error("PCAP Service de evidencia: no se identifica cierre del Anexo I.");const annex=reflowPandaSourceLines(lines.slice(start,end));if(annex.length<20)throw new Error(`PCAP Service de evidencia: Anexo I insuficiente (${annex.length} párrafos).`);return annex;}
function fragment(lines:readonly string[],style:string){return lines.map(line=>`<text:p text:style-name="${esc(style)}">${esc(line)}</text:p>`).join("");}

export interface ServiceOfficialOpenPcapRenderResult{bytes:Uint8Array;sha256:string;officialModel:true;}
/**
 * Conserva el cuerpo normativo del modelo oficial Junta de Servicios abierto
 * autofinanciado y sustituye únicamente su Anexo I por el Anexo I del PCAP real
 * del expediente, previamente saneado y validado como evidencia.
 */
export async function renderServiceOfficialOpenPcap(input:{templateStore:UniversalEditableTemplateBinaryStore;sourcePcapBytes:Uint8Array;label:string;exactValues:readonly string[];semanticConceptGroups:readonly (readonly string[])[]}):Promise<ServiceOfficialOpenPcapRenderResult>{
 const official=await input.templateStore.get(SERVICE_OFFICIAL_OPEN_PCAP_TEMPLATE_ID);if(!official)throw new Error(`${input.label}: falta modelo oficial Junta de Servicios abierto autofinanciado.`);
 let entries=readOdtZip(official.bytes);const before=computeOdtStyleFingerprint(entries);const content=entries.find(entry=>entry.name==="content.xml");if(!content)throw new Error(`${input.label}: modelo oficial sin content.xml.`);
 let xml=Buffer.from(content.bytes).toString("utf8");const range=annexRange(xml);const lines=sourceAnnexLines(input.sourcePcapBytes);xml=xml.slice(0,range.start)+fragment(lines,range.style)+xml.slice(range.end);
 entries=entries.map(entry=>entry.name==="content.xml"?{...entry,bytes:Buffer.from(xml,"utf8")}:entry);const after=computeOdtStyleFingerprint(entries);if(after!==before)throw new Error(`${input.label}: el render alteró la huella de estilo del modelo oficial.`);
 const bytes=writeOdtZip(entries);assertLb102GeneratedDocumentQuality({bytes,kind:"PCAP",label:input.label,exactValues:input.exactValues,semanticConceptGroups:input.semanticConceptGroups});return{bytes,sha256:sha(bytes),officialModel:true};
}
