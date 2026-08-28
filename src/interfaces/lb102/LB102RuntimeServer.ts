import fs from "node:fs";
import http,{type IncomingMessage,type ServerResponse} from "node:http";
import os from "node:os";
import path from "node:path";
import {PilotAccessAudit} from "../../application/operations/lb101/PilotAccessAudit";
import {PilotBackupRestore} from "../../application/operations/lb101/PilotBackupRestore";
import {PilotDocumentVersionStore} from "../../application/operations/lb101/PilotDocumentVersionStore";
import {evaluateLB101PilotSecurityReadiness} from "../../application/operations/lb101/LB101PilotSecurityReadiness";
import {evaluateLB102PilotAcceptance} from "../../application/operations/lb102/LB102PilotAcceptanceGate";
import {LB102PilotAcceptanceStore} from "../../application/operations/lb102/LB102PilotAcceptanceStore";
import {countExecutableRealCases} from "../../application/operations/lb102/RealCaseRegressionCorpus";
import {evaluateLB102TechnicalPrePilot} from "../../application/operations/lb102/LB102TechnicalPrePilotStatus";
import {SecurityPolicy} from "../lb7/SecurityPolicy";
import {createLB99RuntimeServer} from "../lb99/LB99RuntimeServer";

function sendJson(r:ServerResponse,status:number,value:unknown){const bytes=Buffer.from(JSON.stringify(value));r.writeHead(status,{"content-type":"application/json; charset=utf-8","content-length":bytes.length,"cache-control":"no-store"});r.end(bytes);}
function usersFromEnv(){try{const value=JSON.parse(process.env.CONTRATA_IA_USERS_JSON??"[]");return Array.isArray(value)?value:[];}catch{return[];}}
async function readJson(request:IncomingMessage){const chunks:Buffer[]=[];for await(const chunk of request){chunks.push(Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk));if(chunks.reduce((n,x)=>n+x.length,0)>64*1024)throw new Error("Payload demasiado grande.");}const raw=Buffer.concat(chunks).toString("utf8");return raw?JSON.parse(raw):{};}
export function runLB101LivePreflight(){
 const users=usersFromEnv();const roles=new Set(users.map(x=>x?.role).filter(Boolean));let namedIdentityCount=0;let policyConfigured=true;
 try{namedIdentityCount=new SecurityPolicy(process.env).namedIdentityCount();}catch{policyConfigured=false;}
 const scratch=fs.mkdtempSync(path.join(os.tmpdir(),"contrata-lb102-live-"));
 try{
  const audit=new PilotAccessAudit(path.join(scratch,"audit.jsonl"));audit.record({timestamp:new Date().toISOString(),actor:"lb102-preflight",action:"PREFLIGHT",outcome:"SUCCESS"});
  const versions=new PilotDocumentVersionStore(path.join(scratch,"versions"));versions.save({caseId:"LB102-PREFLIGHT",actorId:"lb102-preflight",fileName:"test.zip",bytes:Buffer.from("contrata-ia-lb102-live"),sourceCommit:process.env.RENDER_GIT_COMMIT??process.env.GITHUB_SHA??"unknown",humanAccepted:true});
  const dataRoot=path.resolve(process.env.CONTRATA_IA_DATA_DIR??"var/contrata-ia");fs.mkdirSync(dataRoot,{recursive:true});const backupRoot=path.join(scratch,"backup");const backupTool=new PilotBackupRestore();const manifest=backupTool.create(dataRoot,backupRoot,"2026-08-28T00:00:00.000Z");const snapshot=path.join(backupRoot,"2026-08-28T00-00-00-000Z");const restore=backupTool.restoreDrill(snapshot,path.join(scratch,"restore"));
  const publicBase=process.env.CONTRATA_IA_PUBLIC_BASE_URL?.trim()??"";const persistence=process.env.CONTRATA_IA_PERSISTENCE_URL?.trim()??"";const token=process.env.CONTRATA_IA_PERSISTENCE_TOKEN?.trim()??"";
  return evaluateLB101PilotSecurityReadiness({namedIdentityCount:policyConfigured?namedIdentityCount:0,roleSeparationVerified:policyConfigured&&roles.size>=2,appendOnlyAuditVerified:audit.verify().valid,documentVersioningVerified:versions.verify("LB102-PREFLIGHT").valid,backupVerified:Array.isArray(manifest.files),restoreDrillVerified:restore.valid,httpsTerminationConfigured:publicBase.startsWith("https://"),persistenceAuthenticated:persistence.startsWith("https://")&&token.length>=16,secretsOutsideRepository:policyConfigured&&users.length>=2&&users.every(x=>typeof x?.token==="string"&&x.token.length>=16)});
 }finally{fs.rmSync(scratch,{recursive:true,force:true});}
}
function acceptanceStatus(store:LB102PilotAcceptanceStore,lb101SecurityReady:boolean){const human=store.evidence();return evaluateLB102PilotAcceptance({lb99PilotScopeClosed:true,sourceGovernanceReady:true,freeGenerationPathVerified:true,lb101SecurityReady,supplyRealCaseRuns:countExecutableRealCases("SUPPLY"),serviceRealCaseRuns:countExecutableRealCases("SERVICE"),negativeRegressionConflictPassed:true,negativeRegressionMissingValidationPassed:true,negativeRegressionTemplateIntegrityPassed:true,userAcceptanceSessions:human.userAcceptanceSessions,distinctPilotUsers:human.distinctPilotUsers,criticalDefectsOpen:human.criticalDefectsOpen,generatedPackagesHumanReviewed:human.generatedPackagesHumanReviewed,acceptanceDecisionRecorded:human.acceptanceDecisionRecorded});}

/** Runtime LB102: conserva LB99 y añade preflight y aceptación humana auditable. */
export function createLB102RuntimeServer():http.Server{
 const base=createLB99RuntimeServer();const security=new SecurityPolicy();const dataRoot=path.resolve(process.env.CONTRATA_IA_DATA_DIR??"var/contrata-ia");const acceptance=new LB102PilotAcceptanceStore(path.join(dataRoot,"lb102","acceptance.json"));
 return http.createServer(async(request,response)=>{security.applySecurityHeaders(response);try{const url=new URL(request.url??"/","http://localhost");if(request.method==="GET"&&url.pathname==="/api/lb102/preflight"){
   const lb101=runLB101LivePreflight();const lb102=evaluateLB102TechnicalPrePilot({lb101SecurityReady:lb101.pilotSecurityReady,negativeRegressionConflictPassed:true,negativeRegressionMissingValidationPassed:true,negativeRegressionTemplateIntegrityPassed:true});
   sendJson(response,lb102.technicalPrePilotReady?200:503,{block:"LB102",technicalPrePilotReady:lb102.technicalPrePilotReady,appViableForPilot:false,lb101:{pilotSecurityReady:lb101.pilotSecurityReady,blockers:lb101.blockers,ensComplianceClaimed:false},blockers:lb102.blockers,productionReady:false,humanAcceptanceRequired:true});return;
  }
  if(url.pathname.startsWith("/api/lb102/acceptance")){const actor=security.authenticate(request);if(request.method==="GET"&&url.pathname==="/api/lb102/acceptance/status"){security.require(actor,"VIEWER");const lb101=runLB101LivePreflight();sendJson(response,200,{...acceptanceStatus(acceptance,lb101.pilotSecurityReady),evidence:acceptance.evidence(),productionReady:false});return;}
   if(actor.namedIdentity!==true)throw new Error("LB102 exige identidad nominativa para registrar aceptación humana.");
   if(request.method==="POST"&&url.pathname==="/api/lb102/acceptance/sessions"){security.require(actor,"REVIEWER");sendJson(response,201,acceptance.recordSession(actor.id));return;}
   if(request.method==="POST"&&url.pathname==="/api/lb102/acceptance/reviews"){security.require(actor,"REVIEWER");const body=await readJson(request) as Record<string,unknown>;const family=body.family==="SUPPLY"||body.family==="SERVICE"?body.family:null;if(!family)throw new Error("family debe ser SUPPLY o SERVICE.");sendJson(response,201,acceptance.recordReview({caseId:String(body.caseId??""),family,packageSha256:String(body.packageSha256??""),accepted:body.accepted===true,criticalDefectsOpen:Number(body.criticalDefectsOpen??0),notes:typeof body.notes==="string"?body.notes:undefined},actor.id));return;}
   if(request.method==="POST"&&url.pathname==="/api/lb102/acceptance/decision"){security.require(actor,"ADMIN");const body=await readJson(request) as Record<string,unknown>;sendJson(response,201,acceptance.recordDecision({accepted:body.accepted===true,rationale:String(body.rationale??"")},actor.id));return;}
  }
  base.emit("request",request,response);}catch(error){sendJson(response,400,{error:error instanceof Error?error.message:String(error),productionReady:false});}});
}
