import http, { type ServerResponse } from "node:http";
import path from "node:path";
import { UniversalEvidenceWorkspace } from "../../application/intake/lb52/UniversalEvidenceWorkspace";
import { createHttpPersistedServiceTemplateAssetStoreFromEnv } from "../../application/intake/lb96/ServicePersistedTemplateAssetStore";
import { generateServiceUserDocumentPackage } from "../../application/intake/lb96/ServiceUserDocumentPackageGenerator";
import { evaluateServiceUserJourney } from "../../application/intake/lb96/ServiceUserJourneyCoordinator";
import { evaluateServiceVerticalClosure } from "../../application/intake/lb96/ServiceVerticalClosureGate";
import { DurableUniversalEvidenceWorkspace } from "../../application/universal/DurableUniversalEvidenceWorkspace";
import { createUniversalCaseMirrorFromEnv } from "../../application/universal/HttpUniversalCaseMirror";
import { UniversalDurableCaseStore } from "../../application/universal/UniversalDurableCaseStore";
import { createLB95RuntimeServer } from "../lb95/LB95RuntimeServer";
import { SecurityPolicy } from "../lb7/SecurityPolicy";
import { SERVICE_USER_JOURNEY_UI } from "./ServiceUserJourneyUi";

const DATA_ROOT = path.resolve(process.env.CONTRATA_IA_DATA_DIR ?? "var/contrata-ia");
const EVIDENCE_ROOT = path.join(DATA_ROOT, "universal-evidence-v1");
const security = new SecurityPolicy();
const localEvidence = new UniversalEvidenceWorkspace(EVIDENCE_ROOT);
const durableEvidence = new DurableUniversalEvidenceWorkspace(EVIDENCE_ROOT, localEvidence, new UniversalDurableCaseStore(1, createUniversalCaseMirrorFromEnv() ?? undefined));

function sendJson(response: ServerResponse, status: number, value: unknown): void { const body=Buffer.from(JSON.stringify(value)); response.writeHead(status,{"content-type":"application/json; charset=utf-8","content-length":body.length,"cache-control":"no-store"}); response.end(body); }
function sendHtml(response: ServerResponse, html: string): void { const body=Buffer.from(html); response.writeHead(200,{"content-type":"text/html; charset=utf-8","content-length":body.length,"cache-control":"no-store"}); response.end(body); }
function sendBinary(response:ServerResponse,data:Uint8Array,fileName:string,mediaType:string):void { const body=Buffer.from(data); response.writeHead(200,{"content-type":mediaType,"content-length":body.length,"content-disposition":`attachment; filename="${fileName}"`,"cache-control":"no-store"}); response.end(body); }
function statusFor(error: Error): number { if(/autenticación|credencial|sesión segura/i.test(error.message))return 401; if(/permiso insuficiente/i.test(error.message))return 403; if(/no encontrad/i.test(error.message))return 404; return 400; }

function closureFromPhysical(physical:{assets:readonly {kind:string;available:boolean}[]}) {
  return evaluateServiceVerticalClosure({
    memoryAvailable: physical.assets.some(asset=>asset.kind==="MEMORIA"&&asset.available===true),
    pptAvailable: physical.assets.some(asset=>asset.kind==="PPT"&&asset.available===true),
    pcapDerivedAvailable: physical.assets.some(asset=>asset.kind==="PCAP"&&asset.available===true),
  });
}

/** LB96: recorrido Service + paquete físico editable source-backed. El PCAP es derivado Contrata-IA y nunca se presenta como modelo oficial. */
export function createLB96RuntimeServer(): http.Server {
  const base=createLB95RuntimeServer();
  return http.createServer(async(request,response)=>{
    security.applySecurityHeaders(response);
    try {
      const url=new URL(request.url??"/","http://localhost"); const parts=url.pathname.split("/").filter(Boolean);
      if(request.method==="GET"&&(url.pathname==="/service"||url.pathname==="/service/")){sendHtml(response,SERVICE_USER_JOURNEY_UI);return;}
      if(parts[0]==="api"&&parts[1]==="lb96"&&parts[2]==="cases"&&parts[3]){
        const caseId=decodeURIComponent(parts[3]);
        if(request.method==="GET"&&parts[4]==="journey"&&parts.length===5){
          const actor=security.authenticate(request); security.require(actor,"VIEWER"); const restored=await durableEvidence.get(caseId); const store=createHttpPersistedServiceTemplateAssetStoreFromEnv();
          const physical=store?await store.readiness():{ready:false,blockers:["Persistencia externa de plantillas Service no configurada."],assets:[]}; const closure=closureFromPhysical(physical); const journey=evaluateServiceUserJourney(restored.record,closure.physicalPackageOperational);
          sendJson(response,200,{journey,persistence:restored.persistence.status,serviceTemplates:physical,closure,sourceAuthority:"JDA Service 2026 + SAE Maintenance 2026 + corpus Service",pcapOfficialModelClaimed:false,humanValidationRequired:true}); return;
        }
        if(request.method==="POST"&&parts[4]==="generate-package"&&parts.length===5){
          const actor=security.authenticate(request); security.require(actor,"OPERATOR"); const restored=await durableEvidence.get(caseId); const store=createHttpPersistedServiceTemplateAssetStoreFromEnv();
          if(!store){sendJson(response,503,{ready:false,blockers:["Persistencia externa de plantillas Service no configurada."]});return;}
          const physical=await store.readiness(); const closure=closureFromPhysical(physical); const journey=evaluateServiceUserJourney(restored.record,closure.physicalPackageOperational);
          if(!closure.engineeringClosed||!journey.readyForDocuments){sendJson(response,409,{ready:false,blockers:[...new Set([...closure.blockers,...journey.blockers])],closure,journey});return;}
          const pkg=await generateServiceUserDocumentPackage({record:restored.record,templateStore:store}); if(!pkg.ready||!pkg.bytes||!pkg.fileName){sendJson(response,409,pkg);return;}
          sendBinary(response,pkg.bytes,pkg.fileName,pkg.mediaType); return;
        }
      }
      base.emit("request",request,response);
    } catch(error){const failure=error instanceof Error?error:new Error(String(error)); if(!response.headersSent)sendJson(response,statusFor(failure),{error:failure.message}); else response.end();}
  });
}
