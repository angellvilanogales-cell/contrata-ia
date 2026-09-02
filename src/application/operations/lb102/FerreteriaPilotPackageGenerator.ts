import { createHash } from "node:crypto";
import type { UniversalEditableTemplateBinaryStore } from "../../intake/lb23/UniversalOdtProductionRenderer";
import { readOdtZip } from "../../intake/lb23/OdtPackageCodec";
import { renderFerreteriaProtectedMemory, renderFerreteriaProtectedPpt } from "../../intake/lb59/FerreteriaSourceBackedProtectedRenderers";
import { zipStoredFiles } from "../../intake/lb95/StoredZipPackage";
import { assertAtomicDocumentPackage } from "../../intake/lb102/AtomicDocumentPackageGate";
import { renderFerreteriaPilotPcap } from "./FerreteriaPilotPcapRenderer";
import { LB102_SUPPLY_FERRETERIA } from "./RealSupplyPilotSnapshots";

export interface FerreteriaPilotPackageResult {ready:boolean;fileName:string|null;bytes:Uint8Array|null;sha256:string|null;blockers:readonly string[];}
function sha256(bytes:Uint8Array):string{return createHash("sha256").update(bytes).digest("hex");}
function textOf(bytes:Uint8Array):string{const content=readOdtZip(bytes).find(item=>item.name==="content.xml");if(!content)return"";return Buffer.from(content.bytes).toString("utf8").replace(/<text:tab[^>]*\/>/g," ").replace(/<text:line-break[^>]*\/>/g,"\n").replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/\s+/g," ").trim();}

/** Regresión derivada de las observaciones reales de Intervención Delegada del expediente Ferretería. */
export function ferreteriaInterventionConsistencyAudit(pcapText:string,memoryText:string,pptText:string):string[]{
 const blockers:string[]=[];
 const lawyerField=/AJ-SAE\s*2026\/16/i.test(pcapText)&&/anexos?.{0,80}informad/i.test(pcapText);
 if(!lawyerField&&!/informe\s+del\s+letrado/i.test(pcapText))blockers.push("INTERVENCION: PCAP no acredita consignación del informe del letrado.");
 if(/incorporaci[oó]n\s+al\s+contrato\s+de\s+otros?\s+art[ií]culos?.{0,180}no\s+contemplad/i.test(memoryText))blockers.push("INTERVENCION: Memoria mantiene incorporación de artículos no contemplados en el listado.");
 if(!/cuatro\s+o\s+m[aá]s\s+licitadores/i.test(pcapText))blockers.push("INTERVENCION: PCAP no acredita regla de ofertas anormalmente bajas para cuatro o más licitadores.");
 if(!/25\s+unidades\s+porcentuales\s+respecto\s+al\s+presupuesto\s+base\s+de\s+licitaci[oó]n/i.test(pcapText))blockers.push("INTERVENCION: PCAP no explicita que la baja superior al 25% se refiere al presupuesto base de licitación.");
 const pcapDefect=/material\s+defectuoso.{0,260}tres\s*\(3\)\s+d[ií]as\s+h[aá]biles/i.test(pcapText);
 const pptDefect=/material\s+defectuoso.{0,260}tres\s*\(3\)\s+d[ií]as\s+h[aá]biles/i.test(pptText);
 const pptDefectStillFive=/material\s+defectuoso.{0,220}cinco\s*\(5\).{0,80}d[ií]as\s+h[aá]biles/i.test(pptText);
 if(pptDefectStillFive)blockers.push("INTERVENCION: PPT mantiene 5 días hábiles en la cláusula de sustitución de material defectuoso.");
 if(!pcapDefect||!pptDefect)blockers.push("INTERVENCION: PCAP y PPT no acreditan conjuntamente 3 días hábiles para material defectuoso.");
 if(/adjudicaci[oó]n\s+del\s+(?:contrato\s+)?acuerdo\s+marco/i.test(pptText))blockers.push("INTERVENCION: PPT conserva referencia improcedente a adjudicación del acuerdo marco.");
 if(/plazo\s+de\s+garant[ií]a\s+de\s+tres\s*\(3\)\s+a[nñ]os\s+para\s+(?:cada\s+uno\s+de\s+)?(?:los\s+)?suministros/i.test(pptText))blockers.push("INTERVENCION: PPT mantiene garantía genérica de tres años para todos los suministros.");
 if(!/fungible/i.test(pcapText)||!/fungible/i.test(pptText))blockers.push("INTERVENCION: PCAP y PPT no acreditan conjuntamente la excepción de productos fungibles en la garantía.");
 return blockers;
}

function crossAudit(pcap:Uint8Array,memory:Uint8Array,ppt:Uint8Array):string[]{
 const blockers:string[]=[];const pcapText=textOf(pcap),memoryText=textOf(memory),pptText=textOf(ppt),all=[pcapText,memoryText,pptText];
 for(const required of ["CONTR/2026/240267","44316400-2"]){for(const [index,value] of all.entries())if(!value.includes(required))blockers.push(`${["PCAP","MEMORIA","PPT"][index]}: falta identidad común ${required}.`);}
 for(const required of ["10.552,44","12.768,45"]){if(!pcapText.includes(required))blockers.push(`PCAP: falta magnitud económica fuente ${required}.`);if(!memoryText.includes(required))blockers.push(`MEMORIA: falta magnitud económica fuente ${required}.`);}
 if(/no\s+exhaustivo\s+ni\s+limitativo/i.test(memoryText)||/no\s+exhaustivo\s+ni\s+limitativo/i.test(pptText))blockers.push("MEMORIA/PPT: persiste una formulación incompatible con el catálogo cerrado y con la prohibición de incorporar artículos nuevos.");
 if(!pptText.includes("ABRAZADERAS MANGUERA")||!pptText.includes("TALADRO PERCUTOR 2 BATERIAS 18V"))blockers.push("PPT: no se acredita materialización física del catálogo protegido de 98 referencias.");
 if(!pptText.includes("24 meses"))blockers.push("PPT: falta duración inicial protegida de 24 meses.");
 return[...blockers,...ferreteriaInterventionConsistencyAudit(pcapText,memoryText,pptText)];
}

/** Paquete Ferretería indivisible: una revisión jurídica/fiscal modifica el snapshot y obliga a regenerar el conjunto completo. */
export async function generateFerreteriaPilotPackage(templateStore:UniversalEditableTemplateBinaryStore):Promise<FerreteriaPilotPackageResult>{
 try{
  const pcap=await renderFerreteriaPilotPcap({record:LB102_SUPPLY_FERRETERIA,templateStore});if(!pcap.ready||!pcap.document)return{ready:false,fileName:null,bytes:null,sha256:null,blockers:pcap.blockers};
  let memory;let ppt;try{memory=await renderFerreteriaProtectedMemory(templateStore);ppt=await renderFerreteriaProtectedPpt(templateStore);}catch(error){return{ready:false,fileName:null,bytes:null,sha256:null,blockers:[`MISSING_SOURCE: ${error instanceof Error?error.message:String(error)}`]};}
  const crossBlockers=[...(!memory.auditReady?memory.auditBlockers.map(item=>`MEMORIA: ${item}`):[]),...(!ppt.auditReady?ppt.auditBlockers.map(item=>`PPT: ${item}`):[]),...crossAudit(pcap.document.bytes,memory.bytes,ppt.bytes)];
  const documents=[{kind:"PCAP" as const,fileName:pcap.document.fileName,bytes:pcap.document.bytes,sha256:pcap.document.sha256,provenance:"OFFICIAL_MODEL+FERRETERIA_LB60_SOURCE_BACKED_FINALIZATION"},{kind:"MEMORIA" as const,fileName:memory.fileName,bytes:memory.bytes,sha256:memory.renderedSha256,provenance:"FERRETERIA_SOURCE_V12+LB59_PROTECTED_RENDER"},{kind:"PPT" as const,fileName:ppt.fileName,bytes:ppt.bytes,sha256:ppt.renderedSha256,provenance:"FERRETERIA_SOURCE_V6+LB59_PROTECTED_RENDER"}];
  let atomic;try{atomic=assertAtomicDocumentPackage({caseId:"CONTR/2026/240267",packageVersion:"FERRETERIA_SUPPLY_ASA_DA33_LB102_INTERVENCION_V1",canonicalSnapshot:LB102_SUPPLY_FERRETERIA,documents,crossDocumentBlockers:crossBlockers});}catch(error){return{ready:false,fileName:null,bytes:null,sha256:null,blockers:[error instanceof Error?error.message:String(error)]};}
  const manifest={schemaVersion:2,caseId:"CONTR/2026/240267",profile:"FERRETERIA_SUPPLY_ASA_DA33_LB102_INTERVENCION_V1",...atomic,documents:documents.map(({kind,fileName,sha256:hash,provenance})=>({kind,fileName,sha256:hash,provenance,snapshotHash:atomic.snapshotHash,generationId:atomic.generationId,auditReady:true,blockers:[]})),interventionRegressionApplied:true,crossDocumentAuditReady:true,blockers:[] as string[],humanAcceptanceRequired:true,productionReady:false};
  const bytes=zipStoredFiles([...documents.map(item=>({name:item.fileName,bytes:item.bytes})),{name:"manifest.json",bytes:Buffer.from(JSON.stringify(manifest,null,2),"utf8")}]);return{ready:true,fileName:"Contrata-IA_CONTR-2026-240267_PCAP-Memoria-PPT.zip",bytes,sha256:sha256(bytes),blockers:[]};
 }catch(error){return{ready:false,fileName:null,bytes:null,sha256:null,blockers:[error instanceof Error?error.message:String(error)]};}
}
