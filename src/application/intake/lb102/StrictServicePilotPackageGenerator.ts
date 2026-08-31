import {createHash} from "node:crypto";
import {readOdtZip,writeOdtZip} from "../lb23/OdtPackageCodec";
import {computeOdtStyleFingerprint,type UniversalEditableTemplateBinaryStore} from "../lb23/UniversalOdtProductionRenderer";
import {zipStoredFiles} from "../lb95/StoredZipPackage";

export type StrictServiceDocumentKind="PCAP"|"MEMORY"|"PPT";
const STYLE="sha256:ab69d4c2e87c1873c2bb3ccba87132e931ef0fff85273b1313df4245b50f002a";
const TEMPLATES={
 PCAP:{templateId:"contrata-ia:service:pcap:strict-pilot:LB102-V1",sha256:"d2ee1cc5d99660b2486bfb4b4e1cd3992bed36ae298ff5bbc9663869a4f66299",slots:["caseId","title","locationSummary","cpvSummary","objectSummary","lotsSummary","reservedContractSummary","needsBasedContractSummary","specificLegalRegimeSummary","economicSummary","budgetSummary","estimatedValueSummary","priceSummary","durationSummary","solvencySummary","buyerProfileSummary","procedureSummary","guaranteesSummary","awardCriteriaSummary","specialExecutionConditionsSummary","subcontractingSummary","penaltiesSummary","paymentSummary","executionSummary","suspensionSummary","modificationSummary","dataProtectionSummary","subrogationSummary"]},
 MEMORY:{templateId:"contrata-ia:service:memory:strict-pilot:LB102-V1",sha256:"5bd6d1f046e340a69e7b15a9ea8cdd88cb2b0ead4bfeaa0221aedbcc951eb774",slots:["caseId","needAndOwnMeans","object","cpvMain","lotsRegime","economicSummary","durationSummary","procedureAndSolvencySummary","awardCriteriaSummary","personnelAndExecutionSummary","modificationSummary"]},
 PPT:{templateId:"contrata-ia:service:ppt:strict-pilot:LB102-V1",sha256:"c3d646a4e1c986c73d463c0a8de908a67e3f16f7581fe0bc1f400ef8b5248115",slots:["caseId","object","contractManagement","durationSummary","executionLocations","technicalRequirements","serviceVariantRequirements","personnelAndMeansRequirements","serviceControlAndExecutionConditions"]},
} as const;

export interface StrictServicePilotSnapshot{
 caseId:string;sourceAuthority:string;sourceReferences:readonly string[];sourceConfirmed:true;sourceConflict:false;
 values:{PCAP:Readonly<Record<string,string>>;MEMORY:Readonly<Record<string,string>>;PPT:Readonly<Record<string,string>>};
 auditTerms:{object:string;cpv:string;pbl:string;estimatedValue:string};
}
function hash(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
function esc(v:string){return v.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&apos;");}
function text(bytes:Uint8Array){const e=readOdtZip(bytes).find(x=>x.name==="content.xml");return e?Buffer.from(e.bytes).toString("utf8").replace(/<[^>]+>/g," ").replace(/\s+/g," "):"";}
function requireTerm(label:string,term:string,targets:readonly {name:string;text:string}[]){if(!term.trim())throw new Error(`Auditoría cruzada Service: ${label} vacío.`);for(const target of targets)if(!target.text.includes(term))throw new Error(`Auditoría cruzada Service: ${target.name} no materializa ${label}=${term}.`);}
async function render(kind:StrictServiceDocumentKind,s:StrictServicePilotSnapshot,store:UniversalEditableTemplateBinaryStore){
 const spec=TEMPLATES[kind],source=await store.get(spec.templateId);if(!source)throw new Error(`Falta activo físico ${spec.templateId}.`);
 if(hash(source.bytes)!==spec.sha256)throw new Error(`Integridad física Service ${kind}: SHA-256 no coincide.`);
 const entries=readOdtZip(source.bytes);if(computeOdtStyleFingerprint(entries)!==STYLE)throw new Error(`Integridad física Service ${kind}: huella de estilo no coincide.`);
 const contentEntry=entries.find(x=>x.name==="content.xml");if(!contentEntry)throw new Error(`ODT Service ${kind} sin content.xml.`);
 let content=Buffer.from(contentEntry.bytes).toString("utf8");const values=s.values[kind];
 const extra=Object.keys(values).filter(k=>!spec.slots.includes(k as never));if(extra.length)throw new Error(`Slots Service no autorizados: ${extra.join(", ")}.`);
 for(const slot of spec.slots){const value=values[slot];if(typeof value!=="string"||!value.trim())throw new Error(`Snapshot Service no confirma ${kind}.${slot}.`);const token=`{{${slot}}}`;if(content.split(token).length-1!==1)throw new Error(`Anclaje Service ${kind}.${slot} no único.`);content=content.replace(token,esc(value.trim()));}
 if(/\{\{[^}]+\}\}/.test(content)||content.includes("REQUIERE DECISIÓN HUMANA"))throw new Error(`Service ${kind} conserva huecos o marcadores humanos.`);
 const out=writeOdtZip(entries.map(x=>x.name==="content.xml"?{...x,bytes:Buffer.from(content,"utf8")}:x));if(computeOdtStyleFingerprint(readOdtZip(out))!==STYLE)throw new Error(`Service ${kind} alteró estilo.`);return out;
}
export async function generateStrictServicePilotPackage(input:{snapshot:StrictServicePilotSnapshot;templateStore:UniversalEditableTemplateBinaryStore}){
 const s=input.snapshot;const blockers:string[]=[];
 try{
  if(!s.sourceConfirmed||s.sourceConflict)throw new Error("El expediente Service no tiene snapshot primario confirmado y libre de conflictos.");
  if(s.sourceReferences.length<3)throw new Error("El piloto Service exige trazabilidad a Memoria, PCAP y PPT primarios.");
  const pcap=await render("PCAP",s,input.templateStore),memory=await render("MEMORY",s,input.templateStore),ppt=await render("PPT",s,input.templateStore);
  const docs={PCAP:text(pcap),MEMORY:text(memory),PPT:text(ppt)};
  const all=[{name:"PCAP",text:docs.PCAP},{name:"MEMORY",text:docs.MEMORY},{name:"PPT",text:docs.PPT}] as const;
  const admin=[{name:"PCAP",text:docs.PCAP},{name:"MEMORY",text:docs.MEMORY}] as const;
  requireTerm("caseId",s.caseId,all);
  requireTerm("object",s.auditTerms.object,all);
  requireTerm("cpv",s.auditTerms.cpv,admin);
  requireTerm("pbl",s.auditTerms.pbl,admin);
  requireTerm("estimatedValue",s.auditTerms.estimatedValue,admin);
  const safe=s.caseId.replaceAll("/","-").replaceAll(" ","-");const documents=[{kind:"PCAP" as const,fileName:`PCAP_${safe}.odt`,bytes:pcap},{kind:"MEMORY" as const,fileName:`Memoria_${safe}.odt`,bytes:memory},{kind:"PPT" as const,fileName:`PPT_${safe}.odt`,bytes:ppt}];
  const manifest={schemaVersion:1,caseId:s.caseId,profile:"SERVICE_STRICT_PILOT_LB102" as const,sourceAuthority:s.sourceAuthority,sourceReferences:s.sourceReferences,documents:documents.map(d=>({kind:d.kind,fileName:d.fileName,sha256:hash(d.bytes),provenance:"CONTRATA_IA_DERIVED_STRICT_PILOT_TEMPLATE",officialModel:false as const})),crossDocumentAuditReady:true,packageCompleteForPilot:true,humanAcceptanceRequired:true as const,productionReady:false as const};
  const bytes=zipStoredFiles([...documents.map(d=>({name:d.fileName,bytes:d.bytes})),{name:"manifest.json",bytes:Buffer.from(JSON.stringify(manifest,null,2),"utf8")}]);return{ready:true,fileName:`Contrata-IA_${safe}_Service_Strict.zip`,bytes,sha256:hash(bytes),manifest,blockers};
 }catch(error){blockers.push(error instanceof Error?error.message:String(error));return{ready:false,fileName:null,bytes:null,sha256:null,manifest:null,blockers};}
}
