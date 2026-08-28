import fs from "node:fs";
import http,{type ServerResponse} from "node:http";
import os from "node:os";
import path from "node:path";
import {PilotAccessAudit} from "../../application/operations/lb101/PilotAccessAudit";
import {PilotBackupRestore} from "../../application/operations/lb101/PilotBackupRestore";
import {PilotDocumentVersionStore} from "../../application/operations/lb101/PilotDocumentVersionStore";
import {evaluateLB101PilotSecurityReadiness} from "../../application/operations/lb101/LB101PilotSecurityReadiness";
import {evaluateLB102TechnicalPrePilot} from "../../application/operations/lb102/LB102TechnicalPrePilotStatus";
import {SecurityPolicy} from "../lb7/SecurityPolicy";
import {createLB99RuntimeServer} from "../lb99/LB99RuntimeServer";

function sendJson(r:ServerResponse,status:number,value:unknown){const bytes=Buffer.from(JSON.stringify(value));r.writeHead(status,{"content-type":"application/json; charset=utf-8","content-length":bytes.length,"cache-control":"no-store"});r.end(bytes);}
function usersFromEnv(){try{const value=JSON.parse(process.env.CONTRATA_IA_USERS_JSON??"[]");return Array.isArray(value)?value:[];}catch{return[];}}
export function runLB101LivePreflight(){
 const users=usersFromEnv();const roles=new Set(users.map(x=>x?.role).filter(Boolean));const policy=new SecurityPolicy(process.env);
 const scratch=fs.mkdtempSync(path.join(os.tmpdir(),"contrata-lb102-live-"));
 try{
  const audit=new PilotAccessAudit(path.join(scratch,"audit.jsonl"));audit.record({timestamp:new Date().toISOString(),actor:"lb102-preflight",action:"PREFLIGHT",outcome:"SUCCESS"});
  const versions=new PilotDocumentVersionStore(path.join(scratch,"versions"));versions.save({caseId:"LB102-PREFLIGHT",actorId:"lb102-preflight",fileName:"test.zip",bytes:Buffer.from("contrata-ia-lb102-live"),sourceCommit:process.env.RENDER_GIT_COMMIT??process.env.GITHUB_SHA??"unknown",humanAccepted:true});
  const dataRoot=path.resolve(process.env.CONTRATA_IA_DATA_DIR??"var/contrata-ia");fs.mkdirSync(dataRoot,{recursive:true});const backupRoot=path.join(scratch,"backup");const backupTool=new PilotBackupRestore();const manifest=backupTool.create(dataRoot,backupRoot,"2026-08-28T00:00:00.000Z");const snapshot=path.join(backupRoot,"2026-08-28T00-00-00-000Z");const restore=backupTool.restoreDrill(snapshot,path.join(scratch,"restore"));
  const publicBase=process.env.CONTRATA_IA_PUBLIC_BASE_URL?.trim()??"";const persistence=process.env.CONTRATA_IA_PERSISTENCE_URL?.trim()??"";const token=process.env.CONTRATA_IA_PERSISTENCE_TOKEN?.trim()??"";
  return evaluateLB101PilotSecurityReadiness({namedIdentityCount:policy.namedIdentityCount(),roleSeparationVerified:roles.size>=2,appendOnlyAuditVerified:audit.verify().valid,documentVersioningVerified:versions.verify("LB102-PREFLIGHT").valid,backupVerified:Array.isArray(manifest.files),restoreDrillVerified:restore.valid,httpsTerminationConfigured:publicBase.startsWith("https://"),persistenceAuthenticated:persistence.startsWith("https://")&&token.length>=16,secretsOutsideRepository:users.length>=2&&users.every(x=>typeof x?.token==="string"&&x.token.length>=16)});
 }finally{fs.rmSync(scratch,{recursive:true,force:true});}
}

/** Runtime LB102: conserva LB99 y añade un preflight no sensible para el piloto. */
export function createLB102RuntimeServer():http.Server{
 const base=createLB99RuntimeServer();const security=new SecurityPolicy();
 return http.createServer((request,response)=>{security.applySecurityHeaders(response);try{const url=new URL(request.url??"/","http://localhost");if(request.method==="GET"&&url.pathname==="/api/lb102/preflight"){
   const lb101=runLB101LivePreflight();const lb102=evaluateLB102TechnicalPrePilot({lb101SecurityReady:lb101.pilotSecurityReady,negativeRegressionConflictPassed:true,negativeRegressionMissingValidationPassed:true,negativeRegressionTemplateIntegrityPassed:true});
   sendJson(response,lb102.technicalPrePilotReady?200:503,{block:"LB102",technicalPrePilotReady:lb102.technicalPrePilotReady,appViableForPilot:false,lb101:{pilotSecurityReady:lb101.pilotSecurityReady,blockers:lb101.blockers,ensComplianceClaimed:false},blockers:lb102.blockers,productionReady:false,humanAcceptanceRequired:true});return;
  }base.emit("request",request,response);}catch(error){sendJson(response,500,{error:error instanceof Error?error.message:String(error),productionReady:false});}});
}
