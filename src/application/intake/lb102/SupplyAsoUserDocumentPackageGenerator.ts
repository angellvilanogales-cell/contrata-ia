import {createHash} from "node:crypto";
import type {UniversalEditableTemplateBinaryStore} from "../lb23/UniversalOdtProductionRenderer";
import {readOdtZip} from "../lb23/OdtPackageCodec";
import type {UniversalEvidenceRecord} from "../lb52/UniversalEvidenceWorkspace";
import {zipStoredFiles} from "../lb95/StoredZipPackage";
import {renderSupplyAsoDerivedPcap,type SupplyAsoPcapSlot} from "./SupplyAsoDerivedPcapRenderer";
import {renderSupplyAsoSoftwareTemplate} from "./SupplyAsoSoftwareTemplateRenderer";

function sha(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
function field(record:UniversalEvidenceRecord,path:string){const f=record.fields[path];if(!f)throw new Error(`Falta evidencia ${path}.`);if(f.status==="SOURCE_CONFLICT"||f.status==="PENDING")throw new Error(`${path} está ${f.status}.`);if(f.status!=="NOT_APPLICABLE"&&(!f.humanValidated||f.status!=="HUMAN_VALIDATED"))throw new Error(`${path} requiere validación humana.`);return f.status==="NOT_APPLICABLE"?null:f.value;}
function text(record:UniversalEvidenceRecord,path:string){const v=field(record,path);if(typeof v!=="string"||!v.trim())throw new Error(`${path} debe contener texto validado.`);return v.trim();}
function num(record:UniversalEvidenceRecord,path:string){const v=field(record,path);if(typeof v!=="number"||!Number.isSafeInteger(v))throw new Error(`${path} debe contener entero validado.`);return v;}
function bool(record:UniversalEvidenceRecord,path:string){const v=field(record,path);if(typeof v!=="boolean")throw new Error(`${path} debe contener booleano validado.`);return v;}
function controlled(v:unknown){if(Array.isArray(v))return v.map(x=>typeof x==="object"?JSON.stringify(x):String(x)).join("; ");if(v&&typeof v==="object")return JSON.stringify(v);return String(v??"");}
function eur(c:number){return new Intl.NumberFormat("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2}).format(c/100)+" €";}
function odtText(bytes:Uint8Array){const e=readOdtZip(bytes).find(x=>x.name==="content.xml");return e?Buffer.from(e.bytes).toString("utf8").replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/\s+/g," "):"";}
function common(record:UniversalEvidenceRecord){
 if(text(record,"contractType")!=="SUPPLY")throw new Error("El perfil ASO software solo admite SUPPLY.");
 if(text(record,"procedure")!=="ABIERTO_SIMPLIFICADO_ORDINARIO")throw new Error("El perfil ASO software no admite otro procedimiento.");
 if(text(record,"economic.fundingSource")!=="AUTOFINANCED")throw new Error("El perfil ASO software solo está acreditado para financiación autofinanciada.");
 if(text(record,"technical.supplyVariant")!=="ICT_LICENSE_OR_SOFTWARE")throw new Error("Este perfil físico está limitado a la subfamilia ICT_LICENSE_OR_SOFTWARE.");
 if(bool(record,"technical.hasSuccessiveOrders"))throw new Error("El perfil Panda no admite DA 33.ª/pedidos sucesivos.");
 const divided=bool(record,"lots.divisionIntoLots");const lots=divided?controlled(field(record,"lots.lots")):`No. ${text(record,"lots.noDivisionJustification")}`;
 const pbl=num(record,"baseTenderBudgetCents"),vat=num(record,"economic.initialVatAmountCents"),total=num(record,"economic.initialPblVatIncludedCents"),ve=num(record,"economic.legalEstimatedValueCents"),duration=num(record,"durationMonths"),extensions=num(record,"extensionMonths");
 const economic=`PBL sin IVA: ${eur(pbl)} · IVA: ${eur(vat)} · PBL con IVA: ${eur(total)} · VE: ${eur(ve)} · ${text(record,"economic.estimatedValueCalculationMethod")}`;
 const durationSummary=`${duration} meses · prórroga máxima ${extensions} meses · ${text(record,"execution.extensionStructure")}`;
 const solvency=`Económica: ${text(record,"criteria.economicSolvency")} · Técnica/profesional: ${text(record,"criteria.technicalSolvency")}`;
 return{lots,pbl,ve,economic,durationSummary,solvency};
}
function pcapValues(record:UniversalEvidenceRecord):Readonly<Record<SupplyAsoPcapSlot,string>>{const c=common(record);return{caseId:record.caseId,title:text(record,"object"),object:text(record,"object"),cpvMain:text(record,"cpvMain"),lotsSummary:c.lots,economicSummary:c.economic,durationSummary:c.durationSummary,solvencySummary:c.solvency,procedureSummary:"ABIERTO_SIMPLIFICADO_ORDINARIO · autofinanciado",awardCriteriaSummary:controlled(field(record,"criteria.awardCriteria")),specialExecutionConditions:controlled(field(record,"execution.specialExecutionConditions")),deliveryLocation:controlled(field(record,"technical.executionLocations")),da33Summary:"No",priceSummary:text(record,"economic.priceDeterminationRegime")};}

export async function generateSupplyAsoUserDocumentPackage(input:{record:UniversalEvidenceRecord;templateStore:UniversalEditableTemplateBinaryStore}){
 try{
  const c=common(input.record),object=text(input.record,"object"),cpv=text(input.record,"cpvMain"),award=controlled(field(input.record,"criteria.awardCriteria")),special=controlled(field(input.record,"execution.specialExecutionConditions"));
  const pcap=await renderSupplyAsoDerivedPcap({templateStore:input.templateStore,values:pcapValues(input.record),caseId:input.record.caseId});
  const memory=await renderSupplyAsoSoftwareTemplate({kind:"MEMORY",templateStore:input.templateStore,caseId:input.record.caseId,values:{caseId:input.record.caseId,need:text(input.record,"need"),object,cpvMain:cpv,lotsSummary:c.lots,economicSummary:c.economic,durationSummary:c.durationSummary,procedureSummary:"ABIERTO_SIMPLIFICADO_ORDINARIO · autofinanciado",solvencySummary:c.solvency,awardCriteriaSummary:award,executionSummary:`${special} · Recepción: ${text(input.record,"execution.receiptAndAcceptanceRegime")}`}});
  const ppt=await renderSupplyAsoSoftwareTemplate({kind:"PPT",templateStore:input.templateStore,caseId:input.record.caseId,values:{caseId:input.record.caseId,object,cpvMain:cpv,durationSummary:c.durationSummary,deliveryLocation:controlled(field(input.record,"technical.executionLocations")),technicalRequirements:text(input.record,"technical.technicalRequirements"),licenseRequirements:text(input.record,"technical.licenseRequirements"),supportRequirements:text(input.record,"technical.supportRequirements"),receiptSummary:text(input.record,"execution.receiptAndAcceptanceRegime"),specialExecutionConditions:special}});
  const texts=[odtText(pcap.bytes),odtText(memory.bytes),odtText(ppt.bytes)];
  for(const required of [object,cpv,eur(c.pbl),eur(c.ve)])if(!texts.some(t=>t.includes(required)))throw new Error(`Auditoría cruzada ASO software: no se materializa ${required}.`);
  if(texts.some(t=>/ferreter[ií]a/i.test(t)))throw new Error("Contaminación de subfamilia: el paquete software contiene referencias de ferretería.");
  const safe=input.record.caseId.replaceAll("/","-");const docs=[{kind:"PCAP" as const,fileName:pcap.fileName,bytes:pcap.bytes,sha256:pcap.sha256,provenance:"CONTRATA_IA_DERIVED_PROCEDURE_TEMPLATE",officialModel:false as const},{kind:"MEMORIA" as const,fileName:memory.fileName,bytes:memory.bytes,sha256:memory.sha256,provenance:"CONTRATA_IA_DERIVED_SUBFAMILY_TEMPLATE",officialModel:false as const},{kind:"PPT" as const,fileName:ppt.fileName,bytes:ppt.bytes,sha256:ppt.sha256,provenance:"CONTRATA_IA_DERIVED_SUBFAMILY_TEMPLATE",officialModel:false as const}];
  const manifest={caseId:input.record.caseId,profile:"SUPPLY_ASO_SOFTWARE_AUTOFINANCED_LB102" as const,sourceAuthority:"JDA_RECOMMENDED_SUPPLY_ASO_AUTOFINANCED_2025_12_PLUS_REG_SUPPLY_002",documents:docs.map(({kind,fileName,sha256,provenance,officialModel})=>({kind,fileName,sha256,provenance,officialModel})),crossDocumentAuditReady:true,sourceRegression:"REG-SUPPLY-002",humanAcceptanceRequired:true as const,productionReady:false as const};
  const bytes=zipStoredFiles([...docs.map(d=>({name:d.fileName,bytes:d.bytes})),{name:"manifest.json",bytes:Buffer.from(JSON.stringify(manifest,null,2),"utf8")}]);return{ready:true,fileName:`Contrata-IA_${safe}_Supply_ASO_Software.zip`,bytes,sha256:sha(bytes),manifest,blockers:[] as string[]};
 }catch(error){return{ready:false,fileName:null,bytes:null,sha256:null,manifest:null,blockers:[error instanceof Error?error.message:String(error)]};}
}
