import { createHash } from "node:crypto";
import type { UniversalEditableTemplateBinaryStore } from "../../intake/lb23/UniversalOdtProductionRenderer";
import { readOdtZip } from "../../intake/lb23/OdtPackageCodec";
import { zipStoredFiles } from "../../intake/lb95/StoredZipPackage";
import { assertAtomicDocumentPackage } from "../../intake/lb102/AtomicDocumentPackageGate";
import { LB102_FERRETERIA_SOURCE_ASSETS } from "../../intake/lb102/LB102PersistedPilotTemplateStores";
import { LB102_SUPPLY_FERRETERIA } from "./RealSupplyPilotSnapshots";

export interface FerreteriaPilotPackageResult {ready:boolean;fileName:string|null;bytes:Uint8Array|null;sha256:string|null;blockers:readonly string[];}
function sha256(bytes:Uint8Array):string{return createHash("sha256").update(bytes).digest("hex");}
function textOf(bytes:Uint8Array):string{const content=readOdtZip(bytes).find(item=>item.name==="content.xml");if(!content)return"";return Buffer.from(content.bytes).toString("utf8").replace(/<text:tab[^>]*\/>/g," ").replace(/<text:line-break[^>]*\/>/g,"\n").replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/\s+/g," ").trim();}
function compact(value:string):string{return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/[^A-Z0-9]/g,"");}

/** Regresión derivada de las observaciones reales de Intervención Delegada del expediente Ferretería. */
export function ferreteriaInterventionConsistencyAudit(pcapText:string,memoryText:string,pptText:string):string[]{
 const blockers:string[]=[];
 const lawyerField=/AJ-SAE\s*2026\/16/i.test(pcapText)&&/anexos?.{0,120}informad/i.test(pcapText);
 if(!lawyerField&&!/informe\s+del\s+letrado/i.test(pcapText))blockers.push("INTERVENCION: PCAP no acredita consignación del informe del letrado.");
 if(/incorporaci[oó]n\s+al\s+contrato\s+de\s+otros?\s+art[ií]culos?.{0,240}no\s+contemplad/i.test(memoryText))blockers.push("INTERVENCION: Memoria mantiene incorporación de artículos no contemplados en el listado.");
 if(!/cuatro\s+o\s+m[aá]s\s+licitadores/i.test(pcapText))blockers.push("INTERVENCION: PCAP no acredita regla de ofertas anormalmente bajas para cuatro o más licitadores.");
 const pbl25=/(?:25\s+unidades\s+porcentuales.{0,160}presupuesto\s+base\s+de\s+licitaci[oó]n|presupuesto\s+base\s+de\s+licitaci[oó]n.{0,160}25\s+unidades\s+porcentuales)/i.test(pcapText);
 if(!pbl25)blockers.push("INTERVENCION: PCAP no explicita que la baja superior al 25% se refiere al presupuesto base de licitación.");
 const pcapDefect=/material\s+defectuoso/i.test(pcapText)&&/tres\s*\(3\)\s+d[ií]as\s+h[aá]biles/i.test(pcapText);
 const pptDefect=/material\s+defectuoso/i.test(pptText)&&/tres\s*\(3\)\s+d[ií]as\s+h[aá]biles/i.test(pptText);
 const pptDefectStillFive=/material\s+defectuoso.{0,320}cinco\s*\(5\).{0,120}d[ií]as\s+h[aá]biles/i.test(pptText);
 if(pptDefectStillFive)blockers.push("INTERVENCION: PPT mantiene 5 días hábiles en la cláusula de sustitución de material defectuoso.");
 if(!pcapDefect||!pptDefect)blockers.push("INTERVENCION: PCAP y PPT no acreditan conjuntamente 3 días hábiles para material defectuoso.");
 if(/adjudicaci[oó]n\s+del\s+(?:contrato\s+)?acuerdo\s+marco/i.test(pptText))blockers.push("INTERVENCION: PPT conserva referencia improcedente a adjudicación del acuerdo marco.");
 if(/plazo\s+de\s+garant[ií]a\s+de\s+tres\s*\(3\)\s+a[nñ]os\s+para\s+(?:cada\s+uno\s+de\s+)?(?:los\s+)?suministros/i.test(pptText))blockers.push("INTERVENCION: PPT mantiene garantía genérica de tres años para todos los suministros.");
 if(!/fungible/i.test(pcapText)||!/fungible/i.test(pptText))blockers.push("INTERVENCION: PCAP y PPT no acreditan conjuntamente la excepción de productos fungibles en la garantía.");
 return blockers;
}

function crossAudit(pcap:Uint8Array,memory:Uint8Array,ppt:Uint8Array):string[]{
 const blockers:string[]=[];const pcapText=textOf(pcap),memoryText=textOf(memory),pptText=textOf(ppt),all=[pcapText,memoryText,pptText];
 const caseKey="CONTR2026240267";
 for(const [index,value] of all.entries())if(!compact(value).includes(caseKey))blockers.push(`${["PCAP","MEMORIA","PPT"][index]}: falta identidad común CONTR/2026/240267.`);
 if(!compact(pcapText).includes("443164002"))blockers.push("PCAP: falta CPV 44316400-2 acreditado para el expediente.");
 for(const required of ["10.552,44","12.768,45","25.325,86"]){if(!pcapText.includes(required))blockers.push(`PCAP: falta magnitud económica validada ${required}.`);if(!memoryText.includes(required))blockers.push(`MEMORIA: falta magnitud económica validada ${required}.`);}
 if(/no\s+exhaustivo\s+ni\s+limitativo/i.test(memoryText)||/no\s+exhaustivo\s+ni\s+limitativo/i.test(pptText))blockers.push("MEMORIA/PPT: persiste una formulación incompatible con el catálogo cerrado y con la prohibición de incorporar artículos nuevos.");
 if(!/24\s+meses/i.test(pptText))blockers.push("PPT: falta duración inicial protegida de 24 meses.");
 return[...blockers,...ferreteriaInterventionConsistencyAudit(pcapText,memoryText,pptText)];
}

/** Paquete Ferretería indivisible: los tres ODT proceden de una misma tríada post-Intervención y del mismo snapshot validado. */
export async function generateFerreteriaPilotPackage(templateStore:UniversalEditableTemplateBinaryStore):Promise<FerreteriaPilotPackageResult>{
 try{
  const sources=await Promise.all(LB102_FERRETERIA_SOURCE_ASSETS.map(async descriptor=>{const source=await templateStore.get(descriptor.templateId);if(!source)throw new Error(`MISSING_SOURCE: ${descriptor.templateId}`);const hash=sha256(source.bytes);if(hash!==descriptor.sha256)throw new Error(`SOURCE_IDENTITY: SHA incorrecto en ${descriptor.templateId}`);return{descriptor,source};}));
  const byKind=new Map(sources.map(item=>[item.descriptor.kind,item.source] as const));
  const pcap=byKind.get("PCAP"),memory=byKind.get("MEMORIA"),ppt=byKind.get("PPT");if(!pcap||!memory||!ppt)throw new Error("MISSING_SOURCE: la tríada Ferretería exige PCAP+MEMORIA+PPT.");
  const crossBlockers=crossAudit(pcap.bytes,memory.bytes,ppt.bytes);
  const documents=[
   {kind:"PCAP" as const,fileName:"PCAP_Ferreteria_V8_post_Intervencion.odt",bytes:pcap.bytes,sha256:sha256(pcap.bytes),provenance:"HUMAN_VALIDATED_POST_INTERVENTION_TRIAD"},
   {kind:"MEMORIA" as const,fileName:"Memoria_Ferreteria_V14_post_Intervencion.odt",bytes:memory.bytes,sha256:sha256(memory.bytes),provenance:"HUMAN_VALIDATED_POST_INTERVENTION_TRIAD"},
   {kind:"PPT" as const,fileName:"PPT_Ferreteria_V8_post_Intervencion.odt",bytes:ppt.bytes,sha256:sha256(ppt.bytes),provenance:"HUMAN_VALIDATED_POST_INTERVENTION_TRIAD"},
  ];
  let atomic;try{atomic=assertAtomicDocumentPackage({caseId:"CONTR/2026/240267",packageVersion:"FERRETERIA_SUPPLY_ASA_LB102_POST_INTERVENCION_V2",canonicalSnapshot:LB102_SUPPLY_FERRETERIA,documents,crossDocumentBlockers:crossBlockers});}catch(error){return{ready:false,fileName:null,bytes:null,sha256:null,blockers:[error instanceof Error?error.message:String(error)]};}
  const manifest={schemaVersion:3,caseId:"CONTR/2026/240267",profile:"FERRETERIA_SUPPLY_ASA_LB102_POST_INTERVENCION_V2",...atomic,documents:documents.map(({kind,fileName,sha256:hash,provenance})=>({kind,fileName,sha256:hash,provenance,snapshotHash:atomic.snapshotHash,generationId:atomic.generationId,auditReady:true,blockers:[]})),humanValidatedValues:{annuality2026VatIncludedCents:159606,estimatedValueCents:2532586,validatedAt:"2026-09-02"},interventionRegressionApplied:true,crossDocumentAuditReady:true,blockers:[] as string[],humanAcceptanceRequired:true,productionReady:false};
  const bytes=zipStoredFiles([...documents.map(item=>({name:item.fileName,bytes:item.bytes})),{name:"manifest.json",bytes:Buffer.from(JSON.stringify(manifest,null,2),"utf8")}]);return{ready:true,fileName:"Contrata-IA_CONTR-2026-240267_PCAP-Memoria-PPT_post-Intervencion.zip",bytes,sha256:sha256(bytes),blockers:[]};
 }catch(error){return{ready:false,fileName:null,bytes:null,sha256:null,blockers:[error instanceof Error?error.message:String(error)]};}
}
