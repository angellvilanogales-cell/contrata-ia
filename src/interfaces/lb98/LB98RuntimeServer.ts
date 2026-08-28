import http,{type ServerResponse}from"node:http";
import path from"node:path";
import { UniversalEvidenceWorkspace,type UniversalEvidenceRecord } from "../../application/intake/lb52/UniversalEvidenceWorkspace";
import { evaluateWorksPreparationGate } from "../../application/intake/lb97/WorksPreparationGate";
import { evaluateWorksProjectContent } from "../../application/intake/lb97/WorksProjectContentGate";
import { evaluateConcessionPhysicalBaseline } from "../../application/intake/lb98/ConcessionPhysicalBaseline";
import { createHttpPersistedConcessionTemplateAssetStoreFromEnv } from "../../application/intake/lb98/ConcessionPersistedTemplateAssetStore";
import { evaluateConcessionRiskOperational } from "../../application/intake/lb98/ConcessionRiskOperationalGate";
import { generateConcessionUserDocumentPackage } from "../../application/intake/lb98/ConcessionUserDocumentPackageGenerator";
import { evaluateConcessionUserJourney } from "../../application/intake/lb98/ConcessionUserJourneyCoordinator";
import { evaluateConcessionVerticalClosure } from "../../application/intake/lb98/ConcessionVerticalClosureGate";
import { evaluateConcessionViabilityContent } from "../../application/intake/lb98/ConcessionViabilityContentGate";
import { evaluateWorksConcessionPreparation } from "../../application/intake/lb98/WorksConcessionPreparationGate";
import { createHttpPersistedWorksConcessionTemplateAssetStoreFromEnv } from "../../application/intake/lb98/WorksConcessionPersistedTemplateAssetStore";
import { generateWorksConcessionDocumentPackage } from "../../application/intake/lb98/WorksConcessionUserDocumentPackageGenerator";
import { DurableUniversalEvidenceWorkspace } from "../../application/universal/DurableUniversalEvidenceWorkspace";
import { createUniversalCaseMirrorFromEnv } from "../../application/universal/HttpUniversalCaseMirror";
import { UniversalDurableCaseStore } from "../../application/universal/UniversalDurableCaseStore";
import { createLB97RuntimeServer } from "../lb97/LB97RuntimeServer";
import { SecurityPolicy } from "../lb7/SecurityPolicy";
import { CONCESSION_USER_JOURNEY_UI } from "./ConcessionUserJourneyUi";

const DATA_ROOT=path.resolve(process.env.CONTRATA_IA_DATA_DIR??"var/contrata-ia");
const EVIDENCE_ROOT=path.join(DATA_ROOT,"universal-evidence-v1");
const security=new SecurityPolicy();
const localEvidence=new UniversalEvidenceWorkspace(EVIDENCE_ROOT);
const durableEvidence=new DurableUniversalEvidenceWorkspace(EVIDENCE_ROOT,localEvidence,new UniversalDurableCaseStore(1,createUniversalCaseMirrorFromEnv()??undefined));

type ConcessionSubtype="SERVICE_CONCESSION"|"WORKS_CONCESSION";
function sendJson(r:ServerResponse,s:number,v:unknown){const b=Buffer.from(JSON.stringify(v));r.writeHead(s,{"content-type":"application/json; charset=utf-8","content-length":b.length,"cache-control":"no-store"});r.end(b);}
function sendHtml(r:ServerResponse,h:string){const b=Buffer.from(h);r.writeHead(200,{"content-type":"text/html; charset=utf-8","content-length":b.length,"cache-control":"no-store"});r.end(b);}
function sendBinary(r:ServerResponse,d:Uint8Array,n:string,m:string){const b=Buffer.from(d);r.writeHead(200,{"content-type":m,"content-length":b.length,"content-disposition":`attachment; filename="${n}"`,"cache-control":"no-store"});r.end(b);}
function statusFor(e:Error){if(/autenticación|credencial|sesión segura/i.test(e.message))return 401;if(/permiso insuficiente/i.test(e.message))return 403;if(/no encontrad/i.test(e.message))return 404;return 400;}
function v(r:UniversalEvidenceRecord,p:string){return r.fields[p]?.value;}
function subtype(r:UniversalEvidenceRecord):ConcessionSubtype|null{const x=v(r,"concession.subtype");return x==="SERVICE_CONCESSION"||x==="WORKS_CONCESSION"?x:null;}
function boolOrNull(r:UniversalEvidenceRecord,p:string):boolean|null{const x=v(r,p);return typeof x==="boolean"?x:null;}
function numberOrNull(r:UniversalEvidenceRecord,p:string):number|null{const x=v(r,p);return typeof x==="number"&&Number.isFinite(x)?x:null;}
function stringOrNull(r:UniversalEvidenceRecord,p:string):string|null{const x=v(r,p);return typeof x==="string"&&x.trim()?x:null;}

function legalGates(record:UniversalEvidenceRecord){
  const currentSubtype=subtype(record);const conclusion=v(record,"concession.viabilityStudyConclusion");const stateAid=v(record,"concession.stateAidRelevant");
  const risk=evaluateConcessionRiskOperational({subtype:currentSubtype,viabilityStudyApproved:v(record,"concession.viabilityStudyApproved")===true,viabilityStudyConcludesViable:conclusion==="VIABLE"?true:conclusion==="NOT_VIABLE"?false:null,demandRiskTransferred:v(record,"concession.demandRiskTransferred")===true,supplyRiskTransferred:v(record,"concession.supplyRiskTransferred")===true,marketExposureReal:v(record,"concession.marketExposureReal")===true,recoveryOfInvestmentGuaranteed:boolOrNull(record,"concession.investmentRecoveryGuaranteed"),recoveryOfCostsGuaranteed:boolOrNull(record,"concession.costRecoveryGuaranteed"),estimatedPotentialLossMoreThanNominal:v(record,"concession.potentialLossMoreThanNominal")===true,concessionRevenueModelDefined:Boolean(v(record,"concession.revenueModel")),netPresentValueAnalysisAvailable:Boolean(v(record,"concession.npvAnalysis")),stateAidRelevant:typeof stateAid==="boolean"?stateAid:null,stateAidCompatibilityAddressed:stateAid===false||Boolean(v(record,"concession.stateAidCompatibility"))});
  const viability=evaluateConcessionViabilityContent({subtype:currentSubtype,concessionChoiceJustification:Boolean(v(record,"need")),demandForecast:Boolean(v(record,"concession.demandForecast")),investmentAndFinancingPlan:Boolean(v(record,"concession.investmentPlan")),operatingCostRevenueModel:Boolean(v(record,"concession.revenueModel")),netPresentValueAndDiscountRate:Boolean(v(record,"concession.npvAnalysis")),riskAllocationMatrix:Boolean(v(record,"concession.riskAllocation")),stateAidResolved:typeof stateAid==="boolean"&&(stateAid===false||Boolean(v(record,"concession.stateAidCompatibility"))});
  return{risk,viability};
}

function worksPreparation(record:UniversalEvidenceRecord,viabilityComplete:boolean){
  if(subtype(record)!=="WORKS_CONCESSION")return{ready:true,blockers:[] as readonly string[]};
  const administrationFullyDefinesWorks=boolOrNull(record,"concession.works.administrationFullyDefinesWorks");
  const projectContent=administrationFullyDefinesWorks===true?evaluateWorksProjectContent({
    baseTenderBudgetExVatCents:numberOrNull(record,"baseTenderBudgetCents"),
    workCategory:stringOrNull(record,"works.workCategory") as "FIRST_ESTABLISHMENT"|"REFORM"|"MAJOR_REPAIR"|"REPAIR"|"CONSERVATION"|"MAINTENANCE"|"RESTORATION"|"REHABILITATION"|"DEMOLITION"|"OTHER"|null,
    memory:v(record,"works.projectMemoryAvailable")===true,
    plans:v(record,"works.projectPlansAvailable")===true,
    technicalSpecifications:v(record,"works.projectTechnicalSpecificationsAvailable")===true,
    budgetMeasurementsAndPrices:v(record,"works.projectBudgetMeasurementsAvailable")===true,
    worksProgramme:v(record,"works.projectProgrammeAvailable")===true,
    replanteoReferences:v(record,"works.projectReplanteoReferencesAvailable")===true,
    healthAndSafetyStudy:v(record,"works.projectHealthSafetyStudyAvailable")===true,
    otherLegallyRequiredDocuments:boolOrNull(record,"works.projectOtherLegalDocumentsComplete"),
    simplifiedProjectExpresslyMotivated:v(record,"works.simplifiedProjectExpresslyMotivated")===true,
  }):null;
  const prep=administrationFullyDefinesWorks===true?evaluateWorksPreparationGate({
    projectExists:v(record,"works.projectExists")===true,
    projectApproved:v(record,"works.projectApproval")===true,
    baseTenderBudgetExVatCents:numberOrNull(record,"baseTenderBudgetCents"),
    affectsStabilitySafetyOrWatertightness:boolOrNull(record,"works.affectsStabilitySafetyOrWatertightness"),
    supervisionReportAvailable:v(record,"works.supervisionReportAvailable")===true,
    replanteoCompleted:v(record,"works.replanteoCompleted")===true,
    terrainAvailabilityAccredited:boolOrNull(record,"works.terrainAvailabilityAccredited"),
    jointProjectAndWorks:v(record,"works.projectAndWorksJointAward")===true,
  }):null;
  return evaluateWorksConcessionPreparation({
    viabilityStudyApproved:v(record,"concession.viabilityStudyApproved")===true,
    viabilityContentComplete:viabilityComplete,
    administrationFullyDefinesWorks,
    anteprojectRequired:boolOrNull(record,"concession.works.anteprojectRequired"),
    anteprojectAvailable:v(record,"concession.works.anteprojectAvailable")===true,
    anteprojectApproved:v(record,"concession.works.anteprojectApproved")===true,
    anteprojectPublicInformationCompleted:v(record,"concession.works.anteprojectPublicInformationCompleted")===true,
    projectAvailable:v(record,"concession.works.projectAvailable")===true,
    projectContent,
    worksPreparation:prep,
    financialEvaluationOfficeReportApplicable:boolOrNull(record,"concession.works.financialEvaluationOfficeReportApplicable"),
    financialEvaluationOfficeReportAvailable:v(record,"concession.works.financialEvaluationOfficeReportAvailable")===true,
  });
}

function realCaseReady(currentSubtype:ConcessionSubtype|null){
  const baseline=evaluateConcessionPhysicalBaseline();
  if(currentSubtype==="SERVICE_CONCESSION")return baseline.cases.some(c=>c.subtype===currentSubtype&&c.hasPcap&&c.hasPpt&&c.hasMemory&&c.hasViabilityStudy&&c.viabilityApproved);
  if(currentSubtype==="WORKS_CONCESSION")return baseline.cases.some(c=>c.subtype===currentSubtype&&c.hasViabilityStudy&&c.viabilityApproved&&c.hasProjectDocumentation===true);
  return false;
}

function profileFor(record:UniversalEvidenceRecord){
  const currentSubtype=subtype(record);
  if(currentSubtype==="SERVICE_CONCESSION")return{currentSubtype,sourceAuthority:"LCSP + caso real SAS Puerto Real",store:createHttpPersistedConcessionTemplateAssetStoreFromEnv()};
  if(currentSubtype==="WORKS_CONCESSION")return{currentSubtype,sourceAuthority:"LCSP arts. 247-250 + concesión de obras aparcamientos nuevo Hospital de Málaga",store:createHttpPersistedWorksConcessionTemplateAssetStoreFromEnv()};
  return{currentSubtype:null,sourceAuthority:"SUBTYPE_NOT_RESOLVED",store:null};
}

/** LB98 selecciona físicamente SERVICE_CONCESSION o WORKS_CONCESSION; nunca mezcla sus perfiles. */
export function createLB98RuntimeServer():http.Server{
  const base=createLB97RuntimeServer();
  return http.createServer(async(request,response)=>{
    security.applySecurityHeaders(response);
    try{
      const url=new URL(request.url??"/","http://localhost");const parts=url.pathname.split("/").filter(Boolean);
      if(request.method==="GET"&&(url.pathname==="/concession"||url.pathname==="/concession/")){sendHtml(response,CONCESSION_USER_JOURNEY_UI);return;}
      if(parts[0]==="api"&&parts[1]==="lb98"&&parts[2]==="cases"&&parts[3]){
        const caseId=decodeURIComponent(parts[3]);
        if(request.method==="GET"&&parts[4]==="journey"&&parts.length===5){
          const actor=security.authenticate(request);security.require(actor,"VIEWER");const restored=await durableEvidence.get(caseId);const profile=profileFor(restored.record);
          const physical=profile.store?await profile.store.readiness():{ready:false,blockers:[profile.currentSubtype?"Persistencia externa Concession no configurada.":"Debe validarse el subtipo concesional antes de seleccionar activos."],assets:[] as Array<{kind:string;available:boolean}>};
          const gates=legalGates(restored.record);const preparation=worksPreparation(restored.record,gates.viability.complete);
          const closure=evaluateConcessionVerticalClosure({realCaseEvidenceReady:realCaseReady(profile.currentSubtype),risk:gates.risk,viabilityContent:gates.viability,preparationReady:preparation.ready,preparationBlockers:preparation.blockers,pcapAvailable:physical.assets.some(a=>a.kind==="PCAP"&&a.available),memoryAvailable:physical.assets.some(a=>a.kind==="MEMORIA"&&a.available),pptAvailable:physical.assets.some(a=>a.kind==="PPT"&&a.available),viabilityTemplateAvailable:physical.assets.some(a=>a.kind==="VIABILITY"&&a.available),packageGeneratorReady:profile.currentSubtype!==null,e2eReady:profile.currentSubtype!==null});
          const journey=evaluateConcessionUserJourney(restored.record,closure.physicalPackageOperational);
          sendJson(response,200,{journey,concessionSubtype:profile.currentSubtype,concessionTemplates:physical,risk:gates.risk,viability:gates.viability,worksConcessionPreparation:profile.currentSubtype==="WORKS_CONCESSION"?preparation:null,closure,realCaseEvidence:evaluateConcessionPhysicalBaseline().cases,sourceAuthority:profile.sourceAuthority,officialModelClaimed:false,humanValidationRequired:true});return;
        }
        if(request.method==="POST"&&parts[4]==="generate-package"&&parts.length===5){
          const actor=security.authenticate(request);security.require(actor,"OPERATOR");const restored=await durableEvidence.get(caseId);const profile=profileFor(restored.record);
          if(!profile.currentSubtype){sendJson(response,409,{ready:false,blockers:["Debe validarse expresamente SERVICE_CONCESSION o WORKS_CONCESSION antes de generar."]});return;}
          if(!profile.store){sendJson(response,503,{ready:false,blockers:["Persistencia externa Concession no configurada."]});return;}
          const physical=await profile.store.readiness();const gates=legalGates(restored.record);const preparation=worksPreparation(restored.record,gates.viability.complete);
          const closure=evaluateConcessionVerticalClosure({realCaseEvidenceReady:realCaseReady(profile.currentSubtype),risk:gates.risk,viabilityContent:gates.viability,preparationReady:preparation.ready,preparationBlockers:preparation.blockers,pcapAvailable:physical.assets.some(a=>a.kind==="PCAP"&&a.available),memoryAvailable:physical.assets.some(a=>a.kind==="MEMORIA"&&a.available),pptAvailable:physical.assets.some(a=>a.kind==="PPT"&&a.available),viabilityTemplateAvailable:physical.assets.some(a=>a.kind==="VIABILITY"&&a.available),packageGeneratorReady:true,e2eReady:true});
          const journey=evaluateConcessionUserJourney(restored.record,closure.physicalPackageOperational);
          if(!closure.engineeringClosed||!journey.readyForDocuments){sendJson(response,409,{ready:false,blockers:[...new Set([...closure.blockers,...journey.blockers])],preparation,closure,journey});return;}
          const pkg=profile.currentSubtype==="WORKS_CONCESSION"?await generateWorksConcessionDocumentPackage({record:restored.record,templateStore:profile.store}):await generateConcessionUserDocumentPackage({record:restored.record,templateStore:profile.store});
          if(!pkg.ready||!pkg.bytes||!pkg.fileName){sendJson(response,409,pkg);return;}sendBinary(response,pkg.bytes,pkg.fileName,pkg.mediaType);return;
        }
      }
      base.emit("request",request,response);
    }catch(error){const failure=error instanceof Error?error:new Error(String(error));if(!response.headersSent)sendJson(response,statusFor(failure),{error:failure.message});else response.end();}
  });
}
