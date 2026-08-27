import type { UniversalEvidenceRecord } from "../lb52/UniversalEvidenceWorkspace";
import { evaluateWorksPreparationGate } from "./WorksPreparationGate";

export type WorksJourneyStageId = "IDENTIFICATION" | "PREPARATION" | "ECONOMICS" | "PROCEDURE" | "TECHNICAL" | "EXECUTION" | "FINAL_REVIEW" | "DOCUMENTS";
export interface WorksJourneyStage { id: WorksJourneyStageId; label: string; status: "COMPLETE" | "IN_PROGRESS" | "BLOCKED"; blockers: readonly string[]; }
export interface WorksUserJourney { caseId: string; family: "WORKS"; stages: readonly WorksJourneyStage[]; currentStage: WorksJourneyStageId; blockers: readonly string[]; readyForDocuments: boolean; preparationReady: boolean; humanValidationRequired: true; }

function f(record: UniversalEvidenceRecord, path: string) { return record.fields[path]; }
function v(record: UniversalEvidenceRecord, path: string) { return f(record, path)?.value; }
function done(record: UniversalEvidenceRecord, paths: readonly string[]) { return paths.every(path => { const x=f(record,path); return Boolean(x) && !["PENDING","SOURCE_CONFLICT","SYSTEM_PROPOSAL"].includes(x!.status) && (x!.status === "NOT_APPLICABLE" || x!.value !== undefined); }); }
function conflicts(record: UniversalEvidenceRecord, paths: readonly string[]) { return paths.filter(path => f(record,path)?.status === "SOURCE_CONFLICT").map(path => `${path}: conflicto de fuentes pendiente de decisión humana.`); }

export function evaluateWorksUserJourney(record: UniversalEvidenceRecord, physicalPackageReady = false): WorksUserJourney {
  const identification=["contractType","need","object","cpvMain","administrative.contractingAuthority","lots.divisionIntoLots"];
  const preparationPaths=["works.projectExists","works.projectApproval","works.affectsStabilitySafetyOrWatertightness","works.supervisionReportAvailable","works.replanteoCompleted","works.terrainAvailabilityAccredited","works.projectAndWorksJointAward"];
  const economics=["baseTenderBudgetCents","economic.initialVatAmountCents","economic.initialPblVatIncludedCents","economic.legalEstimatedValueCents","durationMonths"];
  const procedure=["procedure","criteria.awardCriteria","criteria.economicSolvency","criteria.technicalSolvency"];
  const technical=["works.projectScope","works.materialsAndQualityControl"];
  const execution=["works.executionDirection","works.healthAndSafetyCoordination","works.certificationRegime","works.receptionAndGuaranteeRegime","execution.specialExecutionConditions","execution.plannedModificationRegime"];
  const family=v(record,"contractType");
  const preparation=evaluateWorksPreparationGate({
    projectExists:v(record,"works.projectExists") === true,
    projectApproved:v(record,"works.projectApproval") === true,
    baseTenderBudgetExVatCents:typeof v(record,"baseTenderBudgetCents") === "number" ? v(record,"baseTenderBudgetCents") as number : null,
    affectsStabilitySafetyOrWatertightness:typeof v(record,"works.affectsStabilitySafetyOrWatertightness") === "boolean" ? v(record,"works.affectsStabilitySafetyOrWatertightness") as boolean : null,
    supervisionReportAvailable:v(record,"works.supervisionReportAvailable") === true,
    replanteoCompleted:v(record,"works.replanteoCompleted") === true,
    terrainAvailabilityAccredited:typeof v(record,"works.terrainAvailabilityAccredited") === "boolean" ? v(record,"works.terrainAvailabilityAccredited") as boolean : null,
    jointProjectAndWorks:v(record,"works.projectAndWorksJointAward") === true,
  });
  const defs: Array<[WorksJourneyStageId,string,readonly string[],readonly string[]]> = [
    ["IDENTIFICATION","Necesidad, objeto y lotes",identification,[]],
    ["PREPARATION","Proyecto, supervisión y replanteo",preparationPaths,preparation.blockers],
    ["ECONOMICS","Economía y plazo",economics,[]],
    ["PROCEDURE","Procedimiento, solvencia y adjudicación",procedure,[]],
    ["TECHNICAL","Proyecto y prescripciones técnicas",technical,[]],
    ["EXECUTION","Dirección, certificaciones y recepción",execution,[]],
  ];
  const stages: WorksJourneyStage[] = defs.map(([id,label,paths,extra]) => { const c=[...conflicts(record,paths),...extra]; return { id,label,status:c.length?"BLOCKED":done(record,paths)?"COMPLETE":"IN_PROGRESS",blockers:c }; });
  const businessComplete=stages.every(s=>s.status==="COMPLETE");
  const familyBlock=family && family!=="WORKS" ? [`El expediente está clasificado como ${String(family)} y no puede tramitarse como Obras.`] : [];
  const finalBlockers=[...familyBlock]; if(!businessComplete) finalBlockers.push("Quedan etapas Works pendientes o bloqueadas.");
  stages.push({id:"FINAL_REVIEW",label:"Revisión final",status:finalBlockers.length?"IN_PROGRESS":"COMPLETE",blockers:finalBlockers});
  const documentBlockers:string[]=[]; if(finalBlockers.length) documentBlockers.push("La revisión final no está completada."); if(!physicalPackageReady) documentBlockers.push("El paquete físico Works no está acreditado para este expediente.");
  stages.push({id:"DOCUMENTS",label:"Documentos",status:documentBlockers.length?"IN_PROGRESS":"COMPLETE",blockers:documentBlockers});
  const blockers=[...new Set([...familyBlock,...stages.flatMap(s=>s.blockers)])];
  return {caseId:record.caseId,family:"WORKS",stages,currentStage:stages.find(s=>s.status!=="COMPLETE")?.id??"DOCUMENTS",blockers,readyForDocuments:documentBlockers.length===0,preparationReady:preparation.readyForTenderPreparation,humanValidationRequired:true};
}
