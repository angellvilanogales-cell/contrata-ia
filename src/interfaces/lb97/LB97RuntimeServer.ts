import http, { type ServerResponse } from "node:http";
import path from "node:path";
import { UniversalEvidenceWorkspace } from "../../application/intake/lb52/UniversalEvidenceWorkspace";
import { createHttpPersistedWorksTemplateAssetStoreFromEnv } from "../../application/intake/lb97/WorksPersistedTemplateAssetStore";
import { evaluateWorksPreparationGate } from "../../application/intake/lb97/WorksPreparationGate";
import { evaluateWorksProjectContent } from "../../application/intake/lb97/WorksProjectContentGate";
import { generateWorksUserDocumentPackage } from "../../application/intake/lb97/WorksUserDocumentPackageGenerator";
import { evaluateWorksUserJourney } from "../../application/intake/lb97/WorksUserJourneyCoordinator";
import { evaluateWorksVerticalClosure } from "../../application/intake/lb97/WorksVerticalClosureGate";
import { DurableUniversalEvidenceWorkspace } from "../../application/universal/DurableUniversalEvidenceWorkspace";
import { createUniversalCaseMirrorFromEnv } from "../../application/universal/HttpUniversalCaseMirror";
import { UniversalDurableCaseStore } from "../../application/universal/UniversalDurableCaseStore";
import { createLB96RuntimeServer } from "../lb96/LB96RuntimeServer";
import { SecurityPolicy } from "../lb7/SecurityPolicy";
import { WORKS_USER_JOURNEY_UI } from "./WorksUserJourneyUi";

const DATA_ROOT=path.resolve(process.env.CONTRATA_IA_DATA_DIR??"var/contrata-ia");
const EVIDENCE_ROOT=path.join(DATA_ROOT,"universal-evidence-v1");
const security=new SecurityPolicy();
const localEvidence=new UniversalEvidenceWorkspace(EVIDENCE_ROOT);
const durableEvidence=new DurableUniversalEvidenceWorkspace(EVIDENCE_ROOT,localEvidence,new UniversalDurableCaseStore(1,createUniversalCaseMirrorFromEnv()??undefined));
function sendJson(response:ServerResponse,status:number,value:unknown){const body=Buffer.from(JSON.stringify(value));response.writeHead(status,{"content-type":"application/json; charset=utf-8","content-length":body.length,"cache-control":"no-store"});response.end(body);}
function sendHtml(response:ServerResponse,html:string){const body=Buffer.from(html);response.writeHead(200,{"content-type":"text/html; charset=utf-8","content-length":body.length,"cache-control":"no-store"});response.end(body);}
function sendBinary(response:ServerResponse,data:Uint8Array,fileName:string,mediaType:string){const body=Buffer.from(data);response.writeHead(200,{"content-type":mediaType,"content-length":body.length,"content-disposition":`attachment; filename="${fileName}"`,"cache-control":"no-store"});response.end(body);}
function statusFor(error:Error){if(/autenticación|credencial|sesión segura/i.test(error.message))return 401;if(/permiso insuficiente/i.test(error.message))return 403;if(/no encontrad/i.test(error.message))return 404;return 400;}
function value(record:any,path:string){return record.fields?.[path]?.value;}
function preparation(record:any){return evaluateWorksPreparationGate({projectExists:value(record,"works.projectExists")===true,projectApproved:value(record,"works.projectApproval")===true,baseTenderBudgetExVatCents:typeof value(record,"baseTenderBudgetCents")==="number"?value(record,"baseTenderBudgetCents"):null,affectsStabilitySafetyOrWatertightness:typeof value(record,"works.affectsStabilitySafetyOrWatertightness")==="boolean"?value(record,"works.affectsStabilitySafetyOrWatertightness"):null,supervisionReportAvailable:value(record,"works.supervisionReportAvailable")===true,replanteoCompleted:value(record,"works.replanteoCompleted")===true,terrainAvailabilityAccredited:typeof value(record,"works.terrainAvailabilityAccredited")==="boolean"?value(record,"works.terrainAvailabilityAccredited"):null,jointProjectAndWorks:value(record,"works.projectAndWorksJointAward")===true});}
function projectContent(record:any){return evaluateWorksProjectContent({baseTenderBudgetExVatCents:typeof value(record,"baseTenderBudgetCents")==="number"?value(record,"baseTenderBudgetCents"):null,workCategory:typeof value(record,"works.workCategory")==="string"?value(record,"works.workCategory"):null,memory:value(record,"works.projectMemoryAvailable")===true,plans:value(record,"works.projectPlansAvailable")===true,technicalSpecifications:value(record,"works.projectTechnicalSpecificationsAvailable")===true,budgetMeasurementsAndPrices:value(record,"works.projectBudgetMeasurementsAvailable")===true,worksProgramme:value(record,"works.projectProgrammeAvailable")===true,replanteoReferences:value(record,"works.projectReplanteoReferencesAvailable")===true,healthAndSafetyStudy:value(record,"works.projectHealthSafetyStudyAvailable")===true,otherLegallyRequiredDocuments:typeof value(record,"works.projectOtherLegalDocumentsComplete")==="boolean"?value(record,"works.projectOtherLegalDocumentsComplete"):null,simplifiedProjectExpresslyMotivated:value(record,"works.simplifiedProjectExpresslyMotivated")===true});}
function closure(record:any,physical:{assets:readonly {kind:string;available:boolean}[]}){const prep=preparation(record);const project=projectContent(record);return{prep,project,status:evaluateWorksVerticalClosure({pcapAvailable:physical.assets.some(a=>a.kind==="PCAP"&&a.available),memoryAvailable:physical.assets.some(a=>a.kind==="MEMORIA"&&a.available),pptAvailable:physical.assets.some(a=>a.kind==="PPT"&&a.available),preparation:prep,projectContentReady:project.complete,packageGeneratorReady:true})};}

/** LB97 hereda Supply+Service y añade Works con paquete físico condicionado a proyecto y preparación acreditados. */
export function createLB97RuntimeServer():http.Server{
  const base=createLB96RuntimeServer();
  return http.createServer(async(request,response)=>{
    security.applySecurityHeaders(response);
    try{
      const url=new URL(request.url??"/","http://localhost");const parts=url.pathname.split("/").filter(Boolean);
      if(request.method==="GET"&&(url.pathname==="/works"||url.pathname==="/works/")){sendHtml(response,WORKS_USER_JOURNEY_UI);return;}
      if(parts[0]==="api"&&parts[1]==="lb97"&&parts[2]==="cases"&&parts[3]){
        const caseId=decodeURIComponent(parts[3]);
        if(request.method==="GET"&&parts[4]==="journey"&&parts.length===5){
          const actor=security.authenticate(request);security.require(actor,"VIEWER");const restored=await durableEvidence.get(caseId);const store=createHttpPersistedWorksTemplateAssetStoreFromEnv();const physical=store?await store.readiness():{ready:false,blockers:["Persistencia externa Works no configurada."],assets:[]};const evaluated=closure(restored.record,physical);const journey=evaluateWorksUserJourney(restored.record,evaluated.status.physicalPackageOperational);sendJson(response,200,{journey,worksTemplates:physical,preparation:evaluated.prep,projectContent:evaluated.project,closure:evaluated.status,sourceAuthority:"JDA recommended Works models December 2025 + LCSP 231-244",officialModelClaimed:false,humanValidationRequired:true});return;
        }
        if(request.method==="POST"&&parts[4]==="generate-package"&&parts.length===5){
          const actor=security.authenticate(request);security.require(actor,"OPERATOR");const restored=await durableEvidence.get(caseId);const store=createHttpPersistedWorksTemplateAssetStoreFromEnv();if(!store){sendJson(response,503,{ready:false,blockers:["Persistencia externa Works no configurada."]});return;}const physical=await store.readiness();const evaluated=closure(restored.record,physical);const journey=evaluateWorksUserJourney(restored.record,evaluated.status.physicalPackageOperational);if(!evaluated.status.engineeringClosed||!journey.readyForDocuments){sendJson(response,409,{ready:false,blockers:[...new Set([...evaluated.status.blockers,...journey.blockers])],preparation:evaluated.prep,projectContent:evaluated.project,closure:evaluated.status,journey});return;}const pkg=await generateWorksUserDocumentPackage({record:restored.record,templateStore:store});if(!pkg.ready||!pkg.bytes||!pkg.fileName){sendJson(response,409,pkg);return;}sendBinary(response,pkg.bytes,pkg.fileName,pkg.mediaType);return;
        }
      }
      base.emit("request",request,response);
    }catch(error){const failure=error instanceof Error?error:new Error(String(error));if(!response.headersSent)sendJson(response,statusFor(failure),{error:failure.message});else response.end();}
  });
}
