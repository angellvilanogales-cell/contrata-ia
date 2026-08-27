import { createHash } from "node:crypto";
import type { UniversalEditableTemplateBinaryStore } from "../lb23/UniversalOdtProductionRenderer";
import { readOdtZip } from "../lb23/OdtPackageCodec";
import type { UniversalEvidenceRecord } from "../lb52/UniversalEvidenceWorkspace";
import { zipStoredFiles } from "../lb95/StoredZipPackage";
import { renderServiceGeneralEditableTemplate, type ServiceTemplateValue } from "./ServiceGeneralEditableTemplateRenderer";

export interface ServiceUserDocumentPackage {
  ready: boolean;
  fileName: string | null;
  mediaType: "application/zip";
  bytes: Uint8Array | null;
  sha256: string | null;
  blockers: readonly string[];
  manifest: null | {
    caseId: string;
    profile: "SERVICE_GENERAL_LB96";
    generatedAt: string;
    documents: readonly { kind: "PCAP" | "MEMORIA" | "PPT"; fileName: string; sha256: string; provenance: string; officialModel: false }[];
    crossDocumentAuditReady: boolean;
    explicitHumanReviewMarkers: readonly string[];
    humanAcceptanceRequired: true;
  };
}

const HUMAN = "REQUIERE DECISIÓN HUMANA EXPRESA EN LA REVISIÓN FINAL.";
function hash(bytes: Uint8Array): string { return createHash("sha256").update(bytes).digest("hex"); }
function value(record: UniversalEvidenceRecord, path: string): unknown { return record.fields[path]?.value; }
function text(record: UniversalEvidenceRecord, path: string): string { const v=value(record,path); if (v===null||v===undefined) return ""; if (Array.isArray(v)) return v.map(String).join("; "); return String(v); }
function euro(v: unknown): string { return typeof v === "number" && Number.isSafeInteger(v) ? `${new Intl.NumberFormat("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v/100)} €` : ""; }
function yesNo(v: unknown): string { return v===true?"Sí":v===false?"No":""; }
function join(...parts: string[]): string { return parts.filter(Boolean).join(" · "); }
function xmlText(bytes: Uint8Array): string { const e=readOdtZip(bytes).find(x=>x.name==="content.xml"); return e?Buffer.from(e.bytes).toString("utf8").replace(/<[^>]+>/g," ").replace(/\s+/g," "):""; }

function common(record: UniversalEvidenceRecord) {
  const object=text(record,"object"); const cpv=text(record,"cpvMain");
  const pbl=euro(value(record,"baseTenderBudgetCents")); const vat=euro(value(record,"economic.initialVatAmountCents")); const total=euro(value(record,"economic.initialPblVatIncludedCents")); const ve=euro(value(record,"economic.legalEstimatedValueCents"));
  const duration=join(`${text(record,"durationMonths")} meses`, text(record,"extensionMonths") ? `prórroga: ${text(record,"extensionMonths")} meses` : "");
  const lots=value(record,"lots.divisionIntoLots")===true?join("División en lotes: sí",text(record,"lots.lots")):join("División en lotes: no",text(record,"lots.noDivisionJustification"));
  const award=text(record,"criteria.awardCriteria"); const econSolv=text(record,"criteria.economicSolvency"); const techSolv=text(record,"criteria.technicalSolvency");
  const sub=value(record,"service.subrogationRequired")===true?join("Existe obligación de subrogación",text(record,"service.subrogationInformation")):"No se ha declarado obligación de subrogación.";
  const mod=join(text(record,"execution.plannedModificationRegime"),text(record,"economic.priceRevisionRegime"));
  return { object,cpv,pbl,vat,total,ve,duration,lots,award,econSolv,techSolv,sub,mod };
}

function memoryValues(record: UniversalEvidenceRecord): ServiceTemplateValue[] { const c=common(record); return [
  {slotId:"needAndOwnMeans",value:join(text(record,"need"),text(record,"service.insufficiencyOfOwnMeansJustification"))||HUMAN}, {slotId:"object",value:c.object||HUMAN}, {slotId:"cpvMain",value:c.cpv||HUMAN}, {slotId:"lotsRegime",value:c.lots||HUMAN},
  {slotId:"economicSummary",value:join(`PBL: ${c.pbl}`,`IVA: ${c.vat}`,`Total: ${c.total}`,`VE: ${c.ve}`,text(record,"economic.priceDeterminationRegime"),text(record,"economic.fundingSource"))}, {slotId:"durationSummary",value:c.duration||HUMAN}, {slotId:"procedureAndSolvencySummary",value:join(text(record,"procedure"),c.econSolv,c.techSolv)||HUMAN}, {slotId:"awardCriteriaSummary",value:c.award||HUMAN}, {slotId:"personnelAndExecutionSummary",value:join(text(record,"service.personnelRequirements"),text(record,"execution.specialExecutionConditions"),text(record,"service.performanceControlRegime"))||HUMAN}, {slotId:"modificationSummary",value:c.mod||HUMAN},
]; }
function pptValues(record: UniversalEvidenceRecord): ServiceTemplateValue[] { const c=common(record); return [
  {slotId:"object",value:c.object||HUMAN}, {slotId:"contractManagement",value:text(record,"administrative.contractingAuthority")||HUMAN}, {slotId:"durationSummary",value:c.duration||HUMAN}, {slotId:"executionLocations",value:text(record,"technical.executionLocations")||HUMAN}, {slotId:"technicalRequirements",value:text(record,"technical.technicalRequirements")||HUMAN}, {slotId:"serviceVariantRequirements",value:join(text(record,"service.variant"),text(record,"service.materialsOrEquipmentRegime"),text(record,"service.technicalManagementSystem"))||HUMAN}, {slotId:"personnelAndMeansRequirements",value:text(record,"service.personnelRequirements")||HUMAN}, {slotId:"serviceControlAndExecutionConditions",value:join(text(record,"service.performanceControlRegime"),text(record,"execution.receiptAndAcceptanceRegime"),text(record,"execution.specialExecutionConditions"))||HUMAN},
]; }
function pcapValues(record: UniversalEvidenceRecord): ServiceTemplateValue[] { const c=common(record); const unresolved=HUMAN; return [
  {slotId:"title",value:c.object||HUMAN},{slotId:"locationSummary",value:text(record,"technical.executionLocations")||HUMAN},{slotId:"cpvSummary",value:c.cpv||HUMAN},{slotId:"objectSummary",value:c.object||HUMAN},{slotId:"lotsSummary",value:c.lots||HUMAN},{slotId:"reservedContractSummary",value:unresolved},{slotId:"needsBasedContractSummary",value:unresolved},{slotId:"specificLegalRegimeSummary",value:unresolved},{slotId:"economicSummary",value:join(`PBL: ${c.pbl}`,`IVA: ${c.vat}`,`Total: ${c.total}`,`VE: ${c.ve}`)},{slotId:"budgetSummary",value:join(`PBL: ${c.pbl}`,`IVA: ${c.vat}`,`Total: ${c.total}`)},{slotId:"estimatedValueSummary",value:join(`VE: ${c.ve}`,text(record,"economic.estimatedValueCalculationMethod"))},{slotId:"priceSummary",value:text(record,"economic.priceDeterminationRegime")||HUMAN},{slotId:"durationSummary",value:c.duration||HUMAN},{slotId:"solvencySummary",value:join(c.econSolv,c.techSolv)||HUMAN},{slotId:"buyerProfileSummary",value:text(record,"administrative.contractingAuthority")||HUMAN},{slotId:"procedureSummary",value:text(record,"procedure")||HUMAN},{slotId:"guaranteesSummary",value:unresolved},{slotId:"awardCriteriaSummary",value:c.award||HUMAN},{slotId:"specialExecutionConditionsSummary",value:text(record,"execution.specialExecutionConditions")||HUMAN},{slotId:"subcontractingSummary",value:unresolved},{slotId:"penaltiesSummary",value:unresolved},{slotId:"paymentSummary",value:unresolved},{slotId:"executionSummary",value:join(text(record,"execution.receiptAndAcceptanceRegime"),text(record,"service.performanceControlRegime"))||HUMAN},{slotId:"suspensionSummary",value:unresolved},{slotId:"modificationSummary",value:c.mod||HUMAN},{slotId:"dataProtectionSummary",value:unresolved},{slotId:"subrogationSummary",value:c.sub},
]; }

export async function generateServiceUserDocumentPackage(input:{record:UniversalEvidenceRecord;templateStore:UniversalEditableTemplateBinaryStore}):Promise<ServiceUserDocumentPackage>{
  const blockers:string[]=[];
  try {
    const memory=await renderServiceGeneralEditableTemplate({kind:"MEMORY",values:memoryValues(input.record),templateStore:input.templateStore,caseId:input.record.caseId});
    const ppt=await renderServiceGeneralEditableTemplate({kind:"PPT",values:pptValues(input.record),templateStore:input.templateStore,caseId:input.record.caseId});
    const pcap=await renderServiceGeneralEditableTemplate({kind:"PCAP",values:pcapValues(input.record),templateStore:input.templateStore,caseId:input.record.caseId});
    const c=common(input.record); const texts=[xmlText(pcap.bytes),xmlText(memory.bytes),xmlText(ppt.bytes)];
    for(const required of [c.object,c.cpv,c.pbl,c.ve].filter(Boolean)) if(!texts.some(t=>t.includes(required))) blockers.push(`Auditoría cruzada Service: no se materializa ${required}.`);
    if(blockers.length) return {ready:false,fileName:null,mediaType:"application/zip",bytes:null,sha256:null,blockers,manifest:null};
    const docs=[{kind:"PCAP" as const,fileName:pcap.fileName,bytes:pcap.bytes,sha256:pcap.renderedSha256},{kind:"MEMORIA" as const,fileName:memory.fileName,bytes:memory.bytes,sha256:memory.renderedSha256},{kind:"PPT" as const,fileName:ppt.fileName,bytes:ppt.bytes,sha256:ppt.renderedSha256}];
    const explicitHumanReviewMarkers=pcapValues(input.record).filter(v=>v.value===HUMAN).map(v=>v.slotId);
    const manifest={caseId:input.record.caseId,profile:"SERVICE_GENERAL_LB96" as const,generatedAt:new Date().toISOString(),documents:docs.map(d=>({kind:d.kind,fileName:d.fileName,sha256:d.sha256,provenance:"CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",officialModel:false as const})),crossDocumentAuditReady:true,explicitHumanReviewMarkers,humanAcceptanceRequired:true as const};
    const zip=zipStoredFiles([...docs.map(d=>({name:d.fileName,bytes:d.bytes})),{name:"manifest.json",bytes:Buffer.from(JSON.stringify(manifest,null,2),"utf8")}]);
    return {ready:true,fileName:`Contrata-IA_${input.record.caseId.replaceAll("/","-")}_Service_PCAP-Memoria-PPT.zip`,mediaType:"application/zip",bytes:zip,sha256:hash(zip),blockers:[],manifest};
  } catch(error){ blockers.push(error instanceof Error?error.message:String(error)); return {ready:false,fileName:null,mediaType:"application/zip",bytes:null,sha256:null,blockers,manifest:null}; }
}
