import fs from "node:fs";
import path from "node:path";

export type PilotDocumentKind="PCAP"|"MEMORY"|"PPT";
export type PilotAcceptanceEvent=
 | {type:"CASE_RUN";timestamp:string;actorId:string;caseId:string;family:"SUPPLY"|"SERVICE";sourceAuthority:string;packageSha256:string;packageComplete:boolean;documents:readonly PilotDocumentKind[];humanReviewed:boolean;result:"PASS"|"FAIL";notes?:string}
 | {type:"USER_SESSION";timestamp:string;actorId:string;sessionId:string;result:"PASS"|"FAIL";criticalDefectsRaised:number;notes?:string}
 | {type:"NEGATIVE_REGRESSION";timestamp:string;actorId:string;check:"SOURCE_CONFLICT"|"MISSING_HUMAN_VALIDATION"|"TEMPLATE_INTEGRITY";result:"PASS"|"FAIL";notes?:string}
 | {type:"DEFECT";timestamp:string;actorId:string;defectId:string;severity:"CRITICAL"|"HIGH"|"MEDIUM"|"LOW";state:"OPEN"|"CLOSED";notes?:string}
 | {type:"ACCEPTANCE_DECISION";timestamp:string;actorId:string;decision:"ACCEPT_FOR_PILOT"|"REJECT";notes?:string};

type CaseRun=Extract<PilotAcceptanceEvent,{type:"CASE_RUN"}>;
type UserSession=Extract<PilotAcceptanceEvent,{type:"USER_SESSION"}>;
type NegativeRegression=Extract<PilotAcceptanceEvent,{type:"NEGATIVE_REGRESSION"}>;
type Defect=Extract<PilotAcceptanceEvent,{type:"DEFECT"}>;
type AcceptanceDecision=Extract<PilotAcceptanceEvent,{type:"ACCEPTANCE_DECISION"}>;
const REQUIRED:readonly PilotDocumentKind[]=["PCAP","MEMORY","PPT"];
function completeCaseRun(x:CaseRun):boolean{return x.packageComplete&&REQUIRED.every(k=>x.documents.includes(k))&&Boolean(x.packageSha256);}

/** Registro append-only de evidencias LB102. No permite editar el pasado: las correcciones son nuevos eventos. */
export class PilotAcceptanceRegistry{
  public constructor(private readonly filePath:string){fs.mkdirSync(path.dirname(filePath),{recursive:true});}
  public append(event:PilotAcceptanceEvent):void{if(!event.actorId.trim())throw new Error("Toda evidencia de piloto exige actor nominativo.");fs.appendFileSync(this.filePath,`${JSON.stringify(event)}\n`,{encoding:"utf8",mode:0o600});}
  public readAll():readonly PilotAcceptanceEvent[]{if(!fs.existsSync(this.filePath))return[];return fs.readFileSync(this.filePath,"utf8").split("\n").filter(Boolean).map(x=>JSON.parse(x) as PilotAcceptanceEvent);}
  public summarize(){
    const events=this.readAll();
    const caseRuns=events.filter((e):e is CaseRun=>e.type==="CASE_RUN"&&e.result==="PASS"&&completeCaseRun(e));
    const sessions=events.filter((e):e is UserSession=>e.type==="USER_SESSION"&&e.result==="PASS");
    const regressions=events.filter((e):e is NegativeRegression=>e.type==="NEGATIVE_REGRESSION");
    const latestDefect=new Map<string,Defect>();for(const e of events)if(e.type==="DEFECT")latestDefect.set(e.defectId,e);
    const lastDecision=[...events].reverse().find((e):e is AcceptanceDecision=>e.type==="ACCEPTANCE_DECISION");
    return{ supplyRealCaseRuns:caseRuns.filter(x=>x.family==="SUPPLY").length, serviceRealCaseRuns:caseRuns.filter(x=>x.family==="SERVICE").length, generatedPackagesHumanReviewed:caseRuns.filter(x=>x.humanReviewed).length, userAcceptanceSessions:sessions.length, distinctPilotUsers:new Set(sessions.map(x=>x.actorId)).size, negativeRegressionConflictPassed:regressions.some(x=>x.check==="SOURCE_CONFLICT"&&x.result==="PASS"), negativeRegressionMissingValidationPassed:regressions.some(x=>x.check==="MISSING_HUMAN_VALIDATION"&&x.result==="PASS"), negativeRegressionTemplateIntegrityPassed:regressions.some(x=>x.check==="TEMPLATE_INTEGRITY"&&x.result==="PASS"), criticalDefectsOpen:[...latestDefect.values()].filter(x=>x.severity==="CRITICAL"&&x.state==="OPEN").length, acceptanceDecisionRecorded:lastDecision?.decision==="ACCEPT_FOR_PILOT"};
  }
}
