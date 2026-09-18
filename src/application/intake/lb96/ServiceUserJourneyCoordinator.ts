import type { UniversalEvidenceRecord } from "../lb52/UniversalEvidenceWorkspace";

export type ServiceJourneyStageId = "IDENTIFICATION" | "ECONOMICS" | "PROCEDURE" | "TECHNICAL" | "EXECUTION" | "FINAL_REVIEW" | "DOCUMENTS";
export type ServiceJourneyStageStatus = "COMPLETE" | "IN_PROGRESS" | "BLOCKED";
export interface ServiceJourneyStage { id: ServiceJourneyStageId; label: string; status: ServiceJourneyStageStatus; applicablePaths: readonly string[]; completedPaths: readonly string[]; blockers: readonly string[]; }
export interface ServiceUserJourney { caseId: string; family: "SERVICE"; stages: readonly ServiceJourneyStage[]; currentStage: ServiceJourneyStageId; progressPercent: number; blockers: readonly string[]; readyForFinalReview: boolean; readyForDocuments: boolean; humanValidationRequired: true; }

const LABELS: Record<ServiceJourneyStageId,string> = {
  IDENTIFICATION: "Necesidad, objeto, medios propios y lotes", ECONOMICS: "Economía y duración", PROCEDURE: "Procedimiento, solvencia y adjudicación", TECHNICAL: "Prescripciones, personal y medios", EXECUTION: "Ejecución, subrogación y control", FINAL_REVIEW: "Revisión final", DOCUMENTS: "Documentos",
};
function field(record: UniversalEvidenceRecord,path:string){return record.fields[path];}
function usable(record: UniversalEvidenceRecord,path:string){const f=field(record,path);return Boolean(f)&&!["PENDING","SOURCE_CONFLICT","SYSTEM_PROPOSAL"].includes(f!.status)&&(f!.status==="NOT_APPLICABLE"||f!.value!==undefined);}
function validated(record: UniversalEvidenceRecord,path:string){const f=field(record,path);return Boolean(f)&&(f!.status==="NOT_APPLICABLE"||(f!.status==="HUMAN_VALIDATED"&&f!.humanValidated===true));}

function paths(record: UniversalEvidenceRecord) {
  const identification=["contractType","need","service.insufficiencyOfOwnMeansJustification","object","cpvMain","administrative.contractingAuthority","lots.divisionIntoLots"];
  if(field(record,"lots.divisionIntoLots")?.value===false) identification.push("lots.noDivisionJustification");
  if(field(record,"lots.divisionIntoLots")?.value===true) identification.push("lots.lots");
  const economics=["baseTenderBudgetCents","economic.initialVatAmountCents","economic.initialPblVatIncludedCents","economic.legalEstimatedValueCents","economic.priceDeterminationRegime","economic.estimatedValueCalculationMethod","economic.fundingSource","economic.priceRevisionRegime","durationMonths","extensionMonths"];
  const procedure=["procedure","criteria.awardCriteria","criteria.economicSolvency","criteria.technicalSolvency"];
  const awardCriteria=field(record,"criteria.awardCriteria")?.value;
  if(Array.isArray(awardCriteria)&&awardCriteria.length===1) procedure.push("criteria.singleCriterionMotivation");
  const technical=["service.variant","technical.technicalRequirements","technical.executionLocations","service.personnelRequirements"];
  const variant=String(field(record,"service.variant")?.value??"");
  if(variant==="CLEANING") technical.push("service.materialsOrEquipmentRegime");
  if(variant==="MAINTENANCE") technical.push("service.technicalManagementSystem");
  const execution=["execution.specialExecutionConditions","execution.receiptAndAcceptanceRegime","execution.plannedModificationRegime","service.subrogationRequired","service.performanceControlRegime"];
  if(field(record,"service.subrogationRequired")?.value===true) execution.push("service.subrogationInformation");
  return {IDENTIFICATION:identification,ECONOMICS:economics,PROCEDURE:procedure,TECHNICAL:technical,EXECUTION:execution};
}
function stage(record:UniversalEvidenceRecord,id:Exclude<ServiceJourneyStageId,"FINAL_REVIEW"|"DOCUMENTS">,p:string[]):ServiceJourneyStage{
  const completed=p.filter(x=>usable(record,x)); const blockers=p.filter(x=>field(record,x)?.status==="SOURCE_CONFLICT").map(x=>`${x}: conflicto de fuentes pendiente de decisión humana.`);
  return {id,label:LABELS[id],status:blockers.length?"BLOCKED":completed.length===p.length?"COMPLETE":"IN_PROGRESS",applicablePaths:p,completedPaths:completed,blockers};
}

export function evaluateServiceUserJourney(record: UniversalEvidenceRecord, physicalPackageReady=false): ServiceUserJourney {
  const family=field(record,"contractType")?.value; const global:string[]=[];
  if(family&&family!=="SERVICE") global.push(`El expediente está clasificado como ${String(family)} y no puede tramitarse en el vertical Service.`);
  const p=paths(record); const business=(Object.keys(p) as Array<keyof typeof p>).map(id=>stage(record,id,p[id]));
  const all=business.flatMap(s=>s.applicablePaths); const complete=business.every(s=>s.status==="COMPLETE"); const blocked=business.some(s=>s.status==="BLOCKED"); const allValidated=all.length>0&&all.every(x=>validated(record,x));
  const readyForFinalReview=family==="SERVICE"&&complete&&!blocked;
  const reviewBlockers=[...global]; if(!complete)reviewBlockers.push("Quedan datos aplicables pendientes de completar."); if(blocked)reviewBlockers.push("Existen conflictos de fuente pendientes."); if(readyForFinalReview&&!allValidated)reviewBlockers.push("Todos los datos aplicables deben quedar validados humanamente antes de generar documentos.");
  const final:ServiceJourneyStage={id:"FINAL_REVIEW",label:LABELS.FINAL_REVIEW,status:reviewBlockers.some(x=>x.includes("conflicto")||x.includes("clasificado"))?"BLOCKED":allValidated&&readyForFinalReview?"COMPLETE":"IN_PROGRESS",applicablePaths:all,completedPaths:all.filter(x=>validated(record,x)),blockers:reviewBlockers};
  const docBlockers:string[]=[]; if(final.status!=="COMPLETE")docBlockers.push("La revisión final no está completada."); if(!physicalPackageReady)docBlockers.push("El paquete físico Service no está todavía acreditado.");
  const documents:ServiceJourneyStage={id:"DOCUMENTS",label:LABELS.DOCUMENTS,status:docBlockers.length?"IN_PROGRESS":"COMPLETE",applicablePaths:[],completedPaths:[],blockers:docBlockers};
  const stages=[...business,final,documents]; const currentStage=stages.find(s=>s.status!=="COMPLETE")?.id??"DOCUMENTS"; const usableCount=all.filter(x=>usable(record,x)).length; const progress=all.length?Math.round(usableCount/all.length*80+(final.status==="COMPLETE"?10:0)+(documents.status==="COMPLETE"?10:0)):0;
  return {caseId:record.caseId,family:"SERVICE",stages,currentStage,progressPercent:Math.min(100,progress),blockers:[...new Set([...global,...stages.flatMap(s=>s.blockers)])],readyForFinalReview,readyForDocuments:documents.status==="COMPLETE",humanValidationRequired:true};
}
