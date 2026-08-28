import {createHash} from "node:crypto";
import type {UniversalEditableTemplateBinaryStore} from "../lb23/UniversalOdtProductionRenderer";
import {readOdtZip} from "../lb23/OdtPackageCodec";
import type {UniversalEvidenceRecord} from "../lb52/UniversalEvidenceWorkspace";
import {generateSupplyGeneralEvidenceDocuments} from "../lb94/SupplyGeneralEvidenceDocumentGenerator";
import {zipStoredFiles} from "../lb95/StoredZipPackage";
import {renderSupplyAsoDerivedPcap,type SupplyAsoPcapSlot} from "./SupplyAsoDerivedPcapRenderer";

function sha(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
function field(record:UniversalEvidenceRecord,path:string){const f=record.fields[path];if(!f)throw new Error(`Falta evidencia ${path}.`);if(f.status==="SOURCE_CONFLICT"||f.status==="PENDING")throw new Error(`${path} está ${f.status}.`);if(f.status!=="NOT_APPLICABLE"&&(!f.humanValidated||f.status!=="HUMAN_VALIDATED"))throw new Error(`${path} requiere validación humana.`);return f.status==="NOT_APPLICABLE"?null:f.value;}
function text(record:UniversalEvidenceRecord,path:string){const v=field(record,path);if(typeof v!=="string"||!v.trim())throw new Error(`${path} debe contener texto validado.`);return v.trim();}
function num(record:UniversalEvidenceRecord,path:string){const v=field(record,path);if(typeof v!=="number"||!Number.isSafeInteger(v))throw new Error(`${path} debe contener entero monetario/temporal validado.`);return v;}
function bool(record:UniversalEvidenceRecord,path:string){const v=field(record,path);if(typeof v!=="boolean")throw new Error(`${path} debe contener booleano validado.`);return v;}
function controlled(v:unknown){if(Array.isArray(v))return v.map(x=>typeof x==="object"?JSON.stringify(x):String(x)).join("; ");if(v&&typeof v==="object")return JSON.stringify(v);return String(v??"");}
function eur(c:number){return new Intl.NumberFormat("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2}).format(c/100)+" €";}
function odtText(bytes:Uint8Array){const e=readOdtZip(bytes).find(x=>x.name==="content.xml");return e?Buffer.from(e.bytes).toString("utf8").replace(/<[^>]+>/g," ").replace(/\s+/g," "):"";}

function pcapValues(record:UniversalEvidenceRecord):Readonly<Record<SupplyAsoPcapSlot,string>>{
 if(text(record,"contractType")!=="SUPPLY")throw new Error("El perfil ASO solo admite SUPPLY.");
 if(text(record,"procedure")!=="ABIERTO_SIMPLIFICADO_ORDINARIO")throw new Error("El perfil ASO no admite otro procedimiento.");
 if(text(record,"economic.fundingSource")!=="AUTOFINANCED")throw new Error("Este perfil ASO solo está acreditado para financiación autofinanciada.");
 const divided=bool(record,"lots.divisionIntoLots");const lots=divided?controlled(field(record,"lots.lots")):`No. ${text(record,"lots.noDivisionJustification")}`;
 const pbl=num(record,"baseTenderBudgetCents"),vat=num(record,"economic.initialVatAmountCents"),total=num(record,"economic.initialPblVatIncludedCents"),ve=num(record,"economic.legalEstimatedValueCents");
 const duration=num(record,"durationMonths"),extensions=num(record,"extensionMonths");
 return{
  caseId:record.caseId,title:text(record,"object"),object:text(record,"object"),cpvMain:text(record,"cpvMain"),lotsSummary:lots,
  economicSummary:`PBL sin IVA: ${eur(pbl)} · IVA: ${eur(vat)} · PBL con IVA: ${eur(total)} · VE: ${eur(ve)} · ${text(record,"economic.estimatedValueCalculationMethod")}`,
  durationSummary:`${duration} meses · prórroga máxima ${extensions} meses · ${text(record,"execution.extensionStructure")}`,
  solvencySummary:`Económica: ${text(record,"criteria.economicSolvency")} · Técnica/profesional: ${text(record,"criteria.technicalSolvency")}`,
  procedureSummary:`ABIERTO_SIMPLIFICADO_ORDINARIO · autofinanciado`,awardCriteriaSummary:controlled(field(record,"criteria.awardCriteria")),
  specialExecutionConditions:controlled(field(record,"execution.specialExecutionConditions")),deliveryLocation:controlled(field(record,"technical.executionLocations")),
  da33Summary:bool(record,"technical.hasSuccessiveOrders")?"Sí, únicamente si la evidencia validada acredita el supuesto.":"No",
  priceSummary:text(record,"economic.priceDeterminationRegime")
 };
}

export async function generateSupplyAsoUserDocumentPackage(input:{record:UniversalEvidenceRecord;templateStore:UniversalEditableTemplateBinaryStore}){
 try{
  const pcap=await renderSupplyAsoDerivedPcap({templateStore:input.templateStore,values:pcapValues(input.record),caseId:input.record.caseId});
  const general=await generateSupplyGeneralEvidenceDocuments(input);if(!general.ready)throw new Error(general.blockers.join(" | "));
  const memory=general.documents.find(x=>x.kind==="MEMORY"),ppt=general.documents.find(x=>x.kind==="PPT");if(!memory||!ppt)throw new Error("No se han producido Memoria y PPT Supply generales.");
  const texts=[odtText(pcap.bytes),odtText(memory.bytes),odtText(ppt.bytes)];for(const required of [text(input.record,"object"),text(input.record,"cpvMain"),eur(num(input.record,"baseTenderBudgetCents")),eur(num(input.record,"economic.legalEstimatedValueCents"))])if(!texts.some(t=>t.includes(required)))throw new Error(`Auditoría cruzada ASO: no se materializa ${required}.`);
  const safe=input.record.caseId.replaceAll("/","-");const docs=[{kind:"PCAP" as const,fileName:pcap.fileName,bytes:pcap.bytes,sha256:pcap.sha256,provenance:"CONTRATA_IA_DERIVED_PROCEDURE_TEMPLATE",officialModel:false as const},{kind:"MEMORIA" as const,fileName:`Memoria_${safe}.odt`,bytes:memory.bytes,sha256:sha(memory.bytes),provenance:"CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",officialModel:false as const},{kind:"PPT" as const,fileName:`PPT_${safe}.odt`,bytes:ppt.bytes,sha256:sha(ppt.bytes),provenance:"CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",officialModel:false as const}];
  const manifest={caseId:input.record.caseId,profile:"SUPPLY_ASO_AUTOFINANCED_LB102" as const,sourceAuthority:"JDA_RECOMMENDED_SUPPLY_ASO_AUTOFINANCED_2025_12_PLUS_REG_SUPPLY_002",documents:docs.map(({kind,fileName,sha256,provenance,officialModel})=>({kind,fileName,sha256,provenance,officialModel})),crossDocumentAuditReady:true,humanAcceptanceRequired:true as const,productionReady:false as const};
  const bytes=zipStoredFiles([...docs.map(d=>({name:d.fileName,bytes:d.bytes})),{name:"manifest.json",bytes:Buffer.from(JSON.stringify(manifest,null,2),"utf8")}]);return{ready:true,fileName:`Contrata-IA_${safe}_Supply_ASO.zip`,bytes,sha256:sha(bytes),manifest,blockers:[] as string[]};
 }catch(error){return{ready:false,fileName:null,bytes:null,sha256:null,manifest:null,blockers:[error instanceof Error?error.message:String(error)]};}
}
