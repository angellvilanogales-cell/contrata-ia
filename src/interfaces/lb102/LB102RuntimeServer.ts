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
import {generateLB102PilotPackage,LB102_PILOT_PACKAGE_CATALOG,pilotPackageDescriptor,type LB102PilotPackageId} from "../../application/operations/lb102/LB102PilotPackageCatalog";
import {evaluateLB102PreHumanMachineSimulation,LB102_SOURCE_FIDELITY_POLICY} from "../../application/operations/lb102/LB102PreHumanMachineSimulation";
import {countExecutableRealCases} from "../../application/operations/lb102/RealCaseRegressionCorpus";
import {evaluateLB102TechnicalPrePilot} from "../../application/operations/lb102/LB102TechnicalPrePilotStatus";
import {lb102ProtectedSourceStatus,parseLB102ProtectedSourceGroup,parseLB102ProtectedSourceKind,persistLB102ProtectedSource,type LB102ProtectedSourceGroup} from "../../application/intake/lb102/LB102ProtectedSourceIngress";
import {SecurityPolicy} from "../lb7/SecurityPolicy";
import {createLB99RuntimeServer} from "../lb99/LB99RuntimeServer";
import {LB102_PILOT_ACCEPTANCE_UI} from "./LB102PilotAcceptanceUi";

function sendJson(r:ServerResponse,status:number,value:unknown){const bytes=Buffer.from(JSON.stringify(value));r.writeHead(status,{"content-type":"application/json; charset=utf-8","content-length":bytes.length,"cache-control":"no-store"});r.end(bytes);}
function sendHtml(r:ServerResponse,html:string){const bytes=Buffer.from(html);r.writeHead(200,{"content-type":"text/html; charset=utf-8","content-length":bytes.length,"cache-control":"no-store"});r.end(bytes);}
function sendZip(r:ServerResponse,bytes:Uint8Array,fileName:string,sha:string){const body=Buffer.from(bytes);r.writeHead(200,{"content-type":"application/zip","content-length":body.length,"content-disposition":`attachment; filename="${fileName.replace(/[^A-Za-z0-9._-]/g,"_")}"`,"x-contrata-ia-package-sha256":sha,"cache-control":"no-store"});r.end(body);}
function usersFromEnv(){try{const value=JSON.parse(process.env.CONTRATA_IA_USERS_JSON??"[]");return Array.isArray(value)?value:[];}catch{return[];}}
async function readJson(request:IncomingMessage){const chunks:Buffer[]=[];let total=0;for await(const chunk of request){const b=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);total+=b.length;if(total>64*1024)throw new Error("Payload demasiado grande.");chunks.push(b);}const raw=Buffer.concat(chunks).toString("utf8");return raw?JSON.parse(raw):{};}
async function readBinary(request:IncomingMessage,maxBytes=2_000_000){const chunks:Buffer[]=[];let total=0;for await(const chunk of request){const b=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);total+=b.length;if(total>maxBytes)throw new Error("Archivo demasiado grande.");chunks.push(b);}if(total<100)throw new Error("Archivo ODT vacío o inválido.");return Buffer.concat(chunks);}

export function runLB101LivePreflight(){
 const users=usersFromEnv();const roles=new Set(users.map(x=>x?.role).filter(Boolean));let namedIdentityCount=0;let policyConfigured=true;
 try{namedIdentityCount=new SecurityPolicy(process.env).namedIdentityCount();}catch{policyConfigured=false;}
 const scratch=fs.mkdtempSync(path.join(os.tmpdir(),"contrata-lb102-live-"));
 try{
  const audit=new PilotAccessAudit(path.join(scratch,"audit.jsonl"));audit.record({timestamp:new Date().toISOString(),actor:"lb102-preflight",action:"PREFLIGHT",outcome:"SUCCESS"});
  const versions=new PilotDocumentVersionStore(path.join(scratch,"versions"));versions.save({caseId:"LB102-PREFLIGHT",actorId:"lb102-preflight",fileName:"test.zip",bytes:Buffer.from("contrata-ia-lb102-live"),sourceCommit:process.env.RENDER_GIT_COMMIT??process.env.GITHUB_SHA??"unknown",humanAccepted:true});
  const dataRoot=path.resolve(process.env.CONTRATA_IA_DATA_DIR??"var/contrata-ia");fs.mkdirSync(dataRoot,{recursive:true});const backupRoot=path.join(scratch,"backup");const backupTool=new PilotBackupRestore();const manifest=backupTool.create(dataRoot,backupRoot,"2026-08-28T00:00:00.000Z");const snapshot=path.join(backupRoot,"2026-08-28T00-00-00-000Z");const restore=backupTool.restoreDrill(snapshot,path.join(scratch,"restore"));
  const publicBase=process.env.CONTRATA_IA_PUBLIC_BASE_URL?.trim()??"";const renderExternalUrl=process.env.RENDER_EXTERNAL_URL?.trim()??"";const persistence=process.env.CONTRATA_IA_PERSISTENCE_URL?.trim()??"";const token=process.env.CONTRATA_IA_PERSISTENCE_TOKEN?.trim()??"";
  const httpsTerminationConfigured=publicBase.startsWith("https://")||renderExternalUrl.startsWith("https://");
  return evaluateLB101PilotSecurityReadiness({namedIdentityCount:policyConfigured?namedIdentityCount:0,roleSeparationVerified:policyConfigured&&roles.size>=2,appendOnlyAuditVerified:audit.verify().valid,documentVersioningVerified:versions.verify("LB102-PREFLIGHT").valid,backupVerified:Array.isArray(manifest.files),restoreDrillVerified:restore.valid,httpsTerminationConfigured,persistenceAuthenticated:persistence.startsWith("https://")&&token.length>=16,secretsOutsideRepository:policyConfigured&&users.length>=2&&users.every(x=>typeof x?.token==="string"&&x.token.length>=16)});
 }finally{fs.rmSync(scratch,{recursive:true,force:true});}
}
function acceptanceStatus(store:LB102PilotAcceptanceStore,lb101SecurityReady:boolean){const human=store.evidence();return evaluateLB102PilotAcceptance({lb99PilotScopeClosed:true,sourceGovernanceReady:true,freeGenerationPathVerified:true,lb101SecurityReady,supplyRealCaseRuns:countExecutableRealCases("SUPPLY"),serviceRealCaseRuns:countExecutableRealCases("SERVICE"),negativeRegressionConflictPassed:true,negativeRegressionMissingValidationPassed:true,negativeRegressionTemplateIntegrityPassed:true,userAcceptanceSessions:human.userAcceptanceSessions,distinctPilotUsers:human.distinctPilotUsers,criticalDefectsOpen:human.criticalDefectsOpen,generatedPackagesHumanReviewed:human.generatedPackagesHumanReviewed,acceptanceDecisionRecorded:human.acceptanceDecisionRecorded});}

export async function runLB102GenerationSelfTest(){const packages=[];for(const descriptor of LB102_PILOT_PACKAGE_CATALOG){const generated=await generateLB102PilotPackage(descriptor.id);packages.push({id:descriptor.id,caseId:descriptor.caseId,family:descriptor.family,profile:descriptor.profile,ready:generated.ready,sha256:generated.sha256,blockers:generated.blockers});}return{block:"LB102-GENERATION",ready:packages.every(item=>item.ready),packages,productionReady:false,humanAcceptanceRequired:true};}

export async function runLB102PreHumanMachineSimulation(){
 const generation=await runLB102GenerationSelfTest();
 let ferreteriaReady=false;let ferreteriaBlocker="";
 try{const status=await lb102ProtectedSourceStatus("ferreteria");ferreteriaReady=status.ready;if(!status.ready)ferreteriaBlocker="Faltan Memoria V12 y/o PPT V6 exactos persistidos con SHA, longitud y huella de estilo validados.";}catch(error){ferreteriaBlocker=error instanceof Error?error.message:String(error);}
 const evidence=generation.packages.map(item=>{
  const policy=LB102_SOURCE_FIDELITY_POLICY[item.id as LB102PilotPackageId];
  const exactFerreteria=item.id!=="supply-ferreteria"||ferreteriaReady;
  return{id:item.id as LB102PilotPackageId,generationReady:item.ready,sha256:item.sha256,sourceFidelityLevel:policy.level,sourceFidelityAccredited:policy.accredited&&exactFerreteria,blockers:[...item.blockers,...(item.id==="supply-ferreteria"&&!ferreteriaReady&&ferreteriaBlocker?[ferreteriaBlocker]:[]),...(!policy.accredited?[policy.reason]:[])]};
 });
 return evaluateLB102PreHumanMachineSimulation(evidence);
}
async function requireLB102PreHumanMachineSimulation(){const simulation=await runLB102PreHumanMachineSimulation();if(!simulation.passed)throw new Error(`SIMULACIÓN TÉCNICA PREVIA NO SUPERADA: ${simulation.blockers.join(" | ")}`);return simulation;}

async function protectedSourceStatuses(groups:readonly LB102ProtectedSourceGroup[]){const statuses=[];for(const group of groups){try{statuses.push(await lb102ProtectedSourceStatus(group));}catch(error){statuses.push({group,ready:false,assets:[],blockers:[error instanceof Error?error.message:String(error)]});}}return statuses;}

/** Runtime LB102: conserva LB99 y añade preflight, autodiagnóstico, ingreso binario protegido y aceptación humana auditable. */
export function createLB102RuntimeServer():http.Server{
 const base=createLB99RuntimeServer();const security=new SecurityPolicy();const dataRoot=path.resolve(process.env.CONTRATA_IA_DATA_DIR??"var/contrata-ia");const acceptance=new LB102PilotAcceptanceStore(path.join(dataRoot,"lb102","acceptance.json"));
 return http.createServer(async(request,response)=>{security.applySecurityHeaders(response);try{const url=new URL(request.url??"/","http://localhost");const parts=url.pathname.split("/").filter(Boolean);
  if(request.method==="GET"&&(url.pathname==="/pilot-acceptance"||url.pathname==="/pilot-acceptance/")){sendHtml(response,LB102_PILOT_ACCEPTANCE_UI);return;}
  if(request.method==="GET"&&url.pathname==="/api/lb102/generation-selftest"){const result=await runLB102GenerationSelfTest();sendJson(response,result.ready?200:503,result);return;}
  if(request.method==="GET"&&url.pathname==="/api/lb102/pre-human-machine-simulation"){const result=await runLB102PreHumanMachineSimulation();sendJson(response,result.passed?200:503,result);return;}
  if(request.method==="POST"&&url.pathname==="/api/lb102/session/login"){const body=await readJson(request) as Record<string,unknown>;const token=String(body.token??"");const actor=security.authenticateToken(token);if(actor.namedIdentity!==true)throw new Error("El piloto LB102 exige identidad nominativa.");response.setHeader("set-cookie",security.sessionCookie(token));sendJson(response,200,{actor:{id:actor.id,role:actor.role,displayName:actor.displayName,namedIdentity:true},productionReady:false});return;}
  if(request.method==="POST"&&url.pathname==="/api/lb102/session/logout"){response.setHeader("set-cookie",security.clearSessionCookie());sendJson(response,200,{signedOut:true});return;}
  if(request.method==="GET"&&url.pathname==="/api/lb102/session/me"){const actor=security.authenticate(request);sendJson(response,200,{actor:{id:actor.id,role:actor.role,displayName:actor.displayName,namedIdentity:actor.namedIdentity===true}});return;}
  if(request.method==="GET"&&url.pathname==="/api/lb102/preflight"){const lb101=runLB101LivePreflight();const simulation=await runLB102PreHumanMachineSimulation();const lb102=evaluateLB102TechnicalPrePilot({lb101SecurityReady:lb101.pilotSecurityReady,deployedGenerationReady:simulation.passed,negativeRegressionConflictPassed:true,negativeRegressionMissingValidationPassed:true,negativeRegressionTemplateIntegrityPassed:true});sendJson(response,lb102.technicalPrePilotReady?200:503,{block:"LB102",technicalPrePilotReady:lb102.technicalPrePilotReady,appViableForPilot:false,lb101:{pilotSecurityReady:lb101.pilotSecurityReady,blockers:lb101.blockers,ensComplianceClaimed:false},preHumanMachineSimulation:simulation,blockers:lb102.blockers,productionReady:false,humanAcceptanceRequired:true});return;}

  // Compatibilidad: la ruta histórica de Ferretería usa ahora el mismo ingreso binario universal fail-closed.
  if(parts[0]==="api"&&parts[1]==="lb102"&&parts[2]==="ferreteria-sources"){
   const actor=security.authenticate(request);security.require(actor,"ADMIN");if(actor.namedIdentity!==true)throw new Error("La carga de fuentes exige identidad nominativa ADMIN.");
   if(request.method==="GET"&&parts.length===3){sendJson(response,200,{...(await lb102ProtectedSourceStatus("ferreteria")),productionReady:false});return;}
   if(request.method==="PUT"&&parts.length===4){const kind=parseLB102ProtectedSourceKind(parts[3]??"");if(kind!=="MEMORIA"&&kind!=="PPT")throw new Error("Tipo de fuente Ferretería no soportado.");const bytes=await readBinary(request);const saved=await persistLB102ProtectedSource("ferreteria",kind,bytes);sendJson(response,200,{saved:true,group:"ferreteria",kind,templateId:saved.descriptor.templateId,sha256:saved.sha256,styleFingerprint:saved.styleFingerprint,byteLength:saved.byteLength,productionReady:false});return;}
  }

  // Ingreso protegido común: /api/lb102/source-assets/{ferreteria|panda|service-huelva|service-sevilla}/{pcap|memoria|ppt}
  if(parts[0]==="api"&&parts[1]==="lb102"&&parts[2]==="source-assets"){
   const actor=security.authenticate(request);security.require(actor,"ADMIN");if(actor.namedIdentity!==true)throw new Error("El ingreso de activos físicos exige identidad nominativa ADMIN.");
   if(request.method==="GET"&&parts.length===3){const groups:readonly LB102ProtectedSourceGroup[]=["ferreteria","panda","service-huelva","service-sevilla"];const statuses=await protectedSourceStatuses(groups);sendJson(response,200,{ready:statuses.every(item=>item.ready),groups:statuses,productionReady:false});return;}
   const group=parseLB102ProtectedSourceGroup(parts[3]??"");if(!group)throw new Error("Grupo de fuentes LB102 no permitido por la allowlist.");
   if(request.method==="GET"&&parts.length===4){sendJson(response,200,{...(await lb102ProtectedSourceStatus(group)),productionReady:false});return;}
   if(request.method==="PUT"&&parts.length===5){const kind=parseLB102ProtectedSourceKind(parts[4]??"");if(!kind)throw new Error("Tipo documental no permitido por la allowlist.");const bytes=await readBinary(request);const saved=await persistLB102ProtectedSource(group,kind,bytes);sendJson(response,200,{saved:true,group,kind,templateId:saved.descriptor.templateId,sha256:saved.sha256,styleFingerprint:saved.styleFingerprint,byteLength:saved.byteLength,productionReady:false});return;}
   throw new Error("Operación de ingreso de activos LB102 no soportada.");
  }

  if(parts[0]==="api"&&parts[1]==="lb102"&&parts[2]==="pilot-packages"){
   const actor=security.authenticate(request);security.require(actor,"REVIEWER");if(actor.namedIdentity!==true)throw new Error("Los paquetes del piloto exigen identidad nominativa.");
   if(request.method==="GET"&&parts.length===3){sendJson(response,200,{packages:LB102_PILOT_PACKAGE_CATALOG,productionReady:false});return;}
   const descriptor=parts[3]?pilotPackageDescriptor(parts[3]):null;if(!descriptor)throw new Error("Paquete piloto no encontrado.");
   if(request.method==="GET"&&parts[4]==="download"&&parts.length===5){const pkg=await generateLB102PilotPackage(descriptor.id);if(!pkg.ready||!pkg.bytes||!pkg.fileName||!pkg.sha256){sendJson(response,409,{ready:false,blockers:pkg.blockers,productionReady:false});return;}sendZip(response,pkg.bytes,pkg.fileName,pkg.sha256);return;}
   if(request.method==="POST"&&parts[4]==="review"&&parts.length===5){await requireLB102PreHumanMachineSimulation();const pkg=await generateLB102PilotPackage(descriptor.id);if(!pkg.ready||!pkg.sha256){sendJson(response,409,{ready:false,blockers:pkg.blockers,productionReady:false});return;}const body=await readJson(request) as Record<string,unknown>;const review=acceptance.recordReview({caseId:descriptor.caseId,family:descriptor.family,packageSha256:pkg.sha256,accepted:body.accepted===true,criticalDefectsOpen:Number(body.criticalDefectsOpen??0),notes:typeof body.notes==="string"?body.notes:undefined},actor.id);sendJson(response,201,{review,package:{id:descriptor.id,caseId:descriptor.caseId,family:descriptor.family,sha256:pkg.sha256},productionReady:false});return;}
  }
  if(url.pathname.startsWith("/api/lb102/acceptance")){const actor=security.authenticate(request);if(request.method==="GET"&&url.pathname==="/api/lb102/acceptance/status"){security.require(actor,"VIEWER");const lb101=runLB101LivePreflight();const simulation=await runLB102PreHumanMachineSimulation();sendJson(response,200,{...acceptanceStatus(acceptance,lb101.pilotSecurityReady),preHumanMachineSimulation:simulation,evidence:acceptance.evidence(),productionReady:false});return;}
   if(actor.namedIdentity!==true)throw new Error("LB102 exige identidad nominativa para registrar aceptación humana.");
   if(request.method==="POST"&&url.pathname==="/api/lb102/acceptance/sessions"){security.require(actor,"REVIEWER");await requireLB102PreHumanMachineSimulation();sendJson(response,201,acceptance.recordSession(actor.id));return;}
   if(request.method==="POST"&&url.pathname==="/api/lb102/acceptance/reviews"){sendJson(response,410,{error:"La revisión manual por SHA está deshabilitada. Use /api/lb102/pilot-packages/:id/review para ligar la evidencia al paquete generado por el servidor.",productionReady:false});return;}
   if(request.method==="POST"&&url.pathname==="/api/lb102/acceptance/decision"){security.require(actor,"ADMIN");await requireLB102PreHumanMachineSimulation();const body=await readJson(request) as Record<string,unknown>;sendJson(response,201,acceptance.recordDecision({accepted:body.accepted===true,rationale:String(body.rationale??"")},actor.id));return;}
  }
  base.emit("request",request,response);}catch(error){sendJson(response,400,{error:error instanceof Error?error.message:String(error),productionReady:false});}});
}
