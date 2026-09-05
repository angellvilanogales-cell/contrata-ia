import {readOdtZip} from "../lb23/OdtPackageCodec";
import {assertNoOdtSignatureResidue} from "./OdtSignatureResidueSanitizer";

export type LB102DocumentKind="PCAP"|"MEMORIA"|"PPT";

function decodeXml(value:string){return value.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'");}
export function lb102OdtText(bytes:Uint8Array){const content=readOdtZip(bytes).find(entry=>entry.name==="content.xml");if(!content)throw new Error("ODT sin content.xml.");return decodeXml(Buffer.from(content.bytes).toString("utf8").replace(/<[^>]+>/g," ")).replace(/\s+/g," ").trim();}
export function normalizeLb102Text(value:string){return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("es").replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim();}

export function assertLb102ExactMaterialization(text:string,label:string,values:readonly string[]){const normalized=normalizeLb102Text(text);for(const value of values){const needle=normalizeLb102Text(value);if(needle&&!normalized.includes(needle))throw new Error(`${label}: no se materializó el dato objetivo obligatorio ${value}.`);}}

/**
 * Cada grupo representa conceptos equivalentes; al menos un término de cada grupo
 * debe aparecer. Se usa solo para texto libre (objeto, título, justificaciones),
 * nunca para importes, CPV, expediente, plazos u otros datos objetivos.
 */
export function assertLb102SemanticConcepts(text:string,label:string,groups:readonly (readonly string[])[]){const normalized=normalizeLb102Text(text);for(const group of groups){const ok=group.some(term=>normalized.includes(normalizeLb102Text(term)));if(!ok)throw new Error(`${label}: no se acredita el concepto material ${group.join(" / ")}.`);}}

export function assertLb102NoCriticalPlaceholders(text:string,label:string){const patterns:[RegExp,string][]=[
 [/\{\{[^}]+\}\}/i,"placeholder técnico"],
 [/DATOS VARIABLES DEL EXPEDIENTE/i,"marcador de datos variables"],
 [/Objeto del contrato\s*:\s*_{3,}/i,"objeto vacío"],
 [/Importe total\s*\(IVA excluido\)\s*:\s*_{3,}/i,"importe vacío"],
 [/Valor estimado(?: del contrato)?\s*:\s*_{3,}/i,"valor estimado vacío"],
 [/Divisi[oó]n en lotes\s*:\s*S[ií]\s*\/\s*No/i,"opción de lotes sin resolver"],
 [/Tramitaci[oó]n(?: del gasto)?\s*:\s*Ordinaria\s*\/\s*Anticipada/i,"opción de tramitación sin resolver"],
 [/\bREQUIERE DECISI[ÓO]N HUMANA\b/i,"decisión humana incrustada"],
 ];for(const [pattern,reason] of patterns)if(pattern.test(text))throw new Error(`${label}: persiste ${reason}.`);
}

export function assertLb102AdministrativeStructure(bytes:Uint8Array,kind:LB102DocumentKind,label:string){const entries=readOdtZip(bytes);const content=entries.find(entry=>entry.name==="content.xml");if(!content)throw new Error(`${label}: falta content.xml.`);const xml=Buffer.from(content.bytes).toString("utf8");const paragraphs=(xml.match(/<text:p\b/g)??[]).length;const tables=(xml.match(/<table:table\b/g)??[]).length;const namedStyles=(xml.match(/text:style-name=/g)??[]).length;const min=kind==="PCAP"?80:kind==="MEMORIA"?20:35;if(paragraphs<min)throw new Error(`${label}: estructura documental demasiado pobre (${paragraphs} párrafos; mínimo ${min}).`);if(namedStyles<Math.max(10,Math.floor(min/3)))throw new Error(`${label}: riqueza de estilos insuficiente (${namedStyles}).`);if(kind==="PCAP"&&tables===0)throw new Error(`${label}: el PCAP no conserva estructura tabular administrativa.`);}

export function assertLb102GeneratedDocumentQuality(input:{bytes:Uint8Array;kind:LB102DocumentKind;label:string;exactValues?:readonly string[];semanticConceptGroups?:readonly (readonly string[])[]}){assertNoOdtSignatureResidue(input.bytes,input.label);const text=lb102OdtText(input.bytes);assertLb102NoCriticalPlaceholders(text,input.label);if(input.exactValues?.length)assertLb102ExactMaterialization(text,input.label,input.exactValues);if(input.semanticConceptGroups?.length)assertLb102SemanticConcepts(text,input.label,input.semanticConceptGroups);assertLb102AdministrativeStructure(input.bytes,input.kind,input.label);return{text};}
