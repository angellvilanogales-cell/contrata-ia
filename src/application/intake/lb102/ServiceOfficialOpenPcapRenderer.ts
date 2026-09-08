import {createHash} from "node:crypto";
import type {UniversalEditableTemplateBinaryStore} from "../lb23/UniversalOdtProductionRenderer";
import {computeOdtStyleFingerprint} from "../lb23/UniversalOdtProductionRenderer";
import {readOdtZip,writeOdtZip} from "../lb23/OdtPackageCodec";
import {assertLb102GeneratedDocumentQuality} from "./LB102UniversalDocumentQualityGate";
import {SERVICE_OFFICIAL_OPEN_PCAP_TEMPLATE_ID} from "./LB102PersistedPilotTemplateStores";

function sha(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
function decodeXml(value:string){return value.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'");}
function plain(xml:string){return decodeXml(xml.replace(/<[^>]+>/g," ")).replace(/\s+/g," ").trim();}
function paragraphs(xml:string){const out:{start:number;end:number;text:string;style:string|null}[]=[];for(const match of xml.matchAll(/<text:p\b([^>]*)>[\s\S]*?<\/text:p>/g)){if(match.index===undefined)continue;const attrs=match[1]??"";const sm=/text:style-name="([^"]+)"/.exec(attrs);out.push({start:match.index,end:match.index+match[0].length,text:plain(match[0]),style:sm?.[1]??null});}return out;}

function annexRange(xml:string,label:string){const pars=paragraphs(xml);const starts=pars.filter(item=>/^anexo\s+i(?:\b|$)/i.test(item.text.replace(/\s+/g," ").trim()));const start=starts[starts.length-1];if(!start)throw new Error(`${label}: no se localiza el Anexo I.`);const end=pars.find(item=>item.start>start.start&&/^anexo\s+ii(?:\b|$)/i.test(item.text.replace(/\s+/g," ").trim()));if(!end)throw new Error(`${label}: no se localiza el Anexo II.`);return{start:start.start,end:end.start};}

/**
 * Extrae el Anexo I como XML estructural, no como texto plano. Es deliberado:
 * los PCAP Service reales contienen tablas administrativas que deben conservarse
 * al trasladar los datos del expediente al cuerpo normativo del modelo oficial.
 */
function sourceAnnexXml(sourceBytes:Uint8Array){const content=readOdtZip(sourceBytes).find(entry=>entry.name==="content.xml");if(!content)throw new Error("PCAP Service de evidencia: falta content.xml.");const xml=Buffer.from(content.bytes).toString("utf8");const range=annexRange(xml,"PCAP Service de evidencia");const fragment=xml.slice(range.start,range.end);const paras=(fragment.match(/<text:p\b/g)??[]).length;const tables=(fragment.match(/<table:table\b/g)??[]).length;if(paras<20)throw new Error(`PCAP Service de evidencia: Anexo I insuficiente (${paras} párrafos).`);if(tables===0)throw new Error("PCAP Service de evidencia: el Anexo I no conserva ninguna tabla administrativa.");return fragment;}

export interface ServiceOfficialOpenPcapRenderResult{bytes:Uint8Array;sha256:string;officialModel:true;}
/**
 * Conserva el cuerpo normativo del modelo oficial Junta de Servicios abierto
 * autofinanciado y sustituye únicamente su Anexo I por el Anexo I estructural
 * del PCAP real del expediente, previamente saneado y validado como evidencia.
 */
export async function renderServiceOfficialOpenPcap(input:{templateStore:UniversalEditableTemplateBinaryStore;sourcePcapBytes:Uint8Array;label:string;exactValues:readonly string[];semanticConceptGroups:readonly (readonly string[])[]}):Promise<ServiceOfficialOpenPcapRenderResult>{
 const official=await input.templateStore.get(SERVICE_OFFICIAL_OPEN_PCAP_TEMPLATE_ID);if(!official)throw new Error(`${input.label}: falta modelo oficial Junta de Servicios abierto autofinanciado.`);
 let entries=readOdtZip(official.bytes);const before=computeOdtStyleFingerprint(entries);const content=entries.find(entry=>entry.name==="content.xml");if(!content)throw new Error(`${input.label}: modelo oficial sin content.xml.`);
 let xml=Buffer.from(content.bytes).toString("utf8");const range=annexRange(xml,"PCAP oficial Service");const sourceFragment=sourceAnnexXml(input.sourcePcapBytes);xml=xml.slice(0,range.start)+sourceFragment+xml.slice(range.end);
 entries=entries.map(entry=>entry.name==="content.xml"?{...entry,bytes:Buffer.from(xml,"utf8")}:entry);const after=computeOdtStyleFingerprint(entries);if(after!==before)throw new Error(`${input.label}: el render alteró la huella de estilo del modelo oficial.`);
 const bytes=writeOdtZip(entries);assertLb102GeneratedDocumentQuality({bytes,kind:"PCAP",label:input.label,exactValues:input.exactValues,semanticConceptGroups:input.semanticConceptGroups});return{bytes,sha256:sha(bytes),officialModel:true};
}
