import {createHash} from "node:crypto";
import {readOdtZip,writeOdtZip} from "../lb23/OdtPackageCodec";
import {computeOdtStyleFingerprint,type UniversalEditableTemplateBinaryStore} from "../lb23/UniversalOdtProductionRenderer";
import {zipStoredFiles} from "../lb95/StoredZipPackage";
import type {StrictServicePilotSnapshot,StrictServiceDocumentKind} from "./StrictServicePilotPackageGenerator";

export const SERVICE_V2_STYLE="sha256:7caa80e68cf19d03cfd70538125c1762f79fadbe2b4a4e3f9af2203f7492027d" as const;
export const SERVICE_V2_TEMPLATES={
 PCAP:{templateId:"contrata-ia:service:pcap:strict-pilot:LB102-V2",sha256:"fe4fd96179c13dfe1ab72150ee17e49190001d2a0920c5040fb8298f94296214",minBytes:10000,slots:["caseId","title","locationSummary","cpvSummary","objectSummary","lotsSummary","reservedContractSummary","needsBasedContractSummary","specificLegalRegimeSummary","economicSummary","budgetSummary","estimatedValueSummary","priceSummary","durationSummary","solvencySummary","buyerProfileSummary","procedureSummary","guaranteesSummary","awardCriteriaSummary","specialExecutionConditionsSummary","subcontractingSummary","penaltiesSummary","paymentSummary","executionSummary","suspensionSummary","modificationSummary","dataProtectionSummary","subrogationSummary"]},
 MEMORY:{templateId:"contrata-ia:service:memory:strict-pilot:LB102-V2",sha256:"540d557e70621f3a041fb193b2f3ddba9543c247e36f4dc45c123a0971d869fe",minBytes:7000,slots:["caseId","needAndOwnMeans","object","cpvMain","lotsRegime","economicSummary","durationSummary","procedureAndSolvencySummary","awardCriteriaSummary","personnelAndExecutionSummary","modificationSummary"]},
 PPT:{templateId:"contrata-ia:service:ppt:strict-pilot:LB102-V2",sha256:"8e6aa998d71234e4a91ea597f2301ff923248ab8adb5e9b01e83ba60a438e4d1",minBytes:9000,slots:["caseId","object","contractManagement","durationSummary","executionLocations","technicalRequirements","serviceVariantRequirements","personnelAndMeansRequirements","serviceControlAndExecutionConditions"]},
} as const;

function hash(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
function esc(v:string){return v.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&apos;");}
function text(bytes:Uint8Array){const e=readOdtZip(bytes).find(x=>x.name==="content.xml");return e?Buffer.from(e.bytes).toString("utf8").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim():"";}
function rawPart(bytes:Uint8Array,name:string){const e=readOdtZip(bytes).find(x=>x.name===name);return e?Buffer.from(e.bytes).toString("utf8"):"";}
function requireTerm(label:string,term:string,targets:readonly {name:string;text:string}[]){if(!term.trim())throw new Error(`Auditoría cruzada Service V2: ${label} vacío.`);for(const target of targets)if(!target.text.includes(term))throw new Error(`Auditoría cruzada Service V2: ${target.name} no materializa ${label}=${term}.`);}

/**
 * Fidelidad estructural mínima derivada del corpus Service real del proyecto.
 * No afirma identidad con un modelo oficial: protege que el renderer conserve
 * cabecera/pie institucionales, jerarquía administrativa, tablas y anexos.
 */
export function auditServiceV2StructuralFidelity(kind:StrictServiceDocumentKind,bytes:Uint8Array){
 const blockers:string[]=[];const content=rawPart(bytes,"content.xml"),styles=rawPart(bytes,"styles.xml"),visible=text(bytes);
 const spec=SERVICE_V2_TEMPLATES[kind];
 if(bytes.byteLength<spec.minBytes)blockers.push(`${kind}: activo demasiado reducido para el perfil físico Service V2.`);
 if(!styles.includes("JUNTA DE ANDALUCÍA")||!styles.includes("CONSEJERÍA DE EMPLEO"))blockers.push(`${kind}: falta cabecera institucional derivada.`);
 if(!styles.includes("text:page-number")||!styles.includes("text:page-count"))blockers.push(`${kind}: falta paginación dinámica en pie.`);
 if(!styles.includes("#006B4F"))blockers.push(`${kind}: falta jerarquía cromática administrativa acreditada.`);
 if(!content.includes("table:table"))blockers.push(`${kind}: falta estructura tabular administrativa.`);
 if(kind==="PCAP"){
  for(const token of ["ANEXO I","1. OBJETO DEL CONTRATO","2. PRESUPUESTO BASE","8. CRITERIOS DE ADJUDICACIÓN","16. PROTECCIÓN DE DATOS","17. SUBROGACIÓN"])if(!visible.includes(token))blockers.push(`PCAP: falta bloque estructural ${token}.`);
 }
 if(kind==="MEMORY"){
  for(const token of ["MEMORIA JUSTIFICATIVA","1. NECESIDAD","3. DIVISIÓN EN LOTES","4. PRESUPUESTO BASE","8. PERSONAL","10. CONCLUSIÓN"])if(!visible.includes(token))blockers.push(`MEMORIA: falta bloque estructural ${token}.`);
 }
 if(kind==="PPT"){
  for(const token of ["PLIEGO DE PRESCRIPCIONES TÉCNICAS","ÍNDICE","1. OBJETO","5. PRESCRIPCIONES TÉCNICAS","ANEXO I","ANEXO II"])if(!visible.includes(token))blockers.push(`PPT: falta bloque estructural ${token}.`);
  if((content.match(/<table:table\b/g)??[]).length<3)blockers.push("PPT: se exigen tablas de identificación y anexos técnicos.");
 }
 if(visible.includes("CONTRATA-IA · SERVICIO · PILOTO ESTRICTO"))blockers.push(`${kind}: reaparece la maqueta mínima V1.`);
 return{ready:blockers.length===0,blockers} as const;
}

async function render(kind:StrictServiceDocumentKind,s:StrictServicePilotSnapshot,store:UniversalEditableTemplateBinaryStore){
 const spec=SERVICE_V2_TEMPLATES[kind],source=await store.get(spec.templateId);if(!source)throw new Error(`Falta activo físico ${spec.templateId}.`);
 if(hash(source.bytes)!==spec.sha256)throw new Error(`Integridad física Service V2 ${kind}: SHA-256 no coincide.`);
 const entries=readOdtZip(source.bytes);if(computeOdtStyleFingerprint(entries)!==SERVICE_V2_STYLE)throw new Error(`Integridad física Service V2 ${kind}: huella de estilo no coincide.`);
 const fidelity=auditServiceV2StructuralFidelity(kind,source.bytes);if(!fidelity.ready)throw new Error(fidelity.blockers.join(" | "));
 const contentEntry=entries.find(x=>x.name==="content.xml");if(!contentEntry)throw new Error(`ODT Service V2 ${kind} sin content.xml.`);
 let content=Buffer.from(contentEntry.bytes).toString("utf8");const values=s.values[kind];
 const extra=Object.keys(values).filter(k=>!spec.slots.includes(k as never));if(extra.length)throw new Error(`Slots Service V2 no autorizados: ${extra.join(", ")}.`);
 for(const slot of spec.slots){const value=values[slot];if(typeof value!=="string"||!value.trim())throw new Error(`Snapshot Service no confirma ${kind}.${slot}.`);const token=`{{${slot}}}`;if(content.split(token).length-1!==1)throw new Error(`Anclaje Service V2 ${kind}.${slot} no único.`);content=content.replace(token,esc(value.trim()));}
 if(/\{\{[^}]+\}\}/.test(content)||content.includes("REQUIERE DECISIÓN HUMANA"))throw new Error(`Service V2 ${kind} conserva huecos o marcadores humanos.`);
 const out=writeOdtZip(entries.map(x=>x.name==="content.xml"?{...x,bytes:Buffer.from(content,"utf8")}:x));if(computeOdtStyleFingerprint(readOdtZip(out))!==SERVICE_V2_STYLE)throw new Error(`Service V2 ${kind} alteró estilo.`);return out;
}

export async function generateStrictServicePilotPackageV2(input:{snapshot:StrictServicePilotSnapshot;templateStore:UniversalEditableTemplateBinaryStore}){
 const s=input.snapshot;const blockers:string[]=[];
 try{
  if(!s.sourceConfirmed||s.sourceConflict)throw new Error("El expediente Service no tiene snapshot primario confirmado y libre de conflictos.");
  if(s.sourceReferences.length<3)throw new Error("El piloto Service exige trazabilidad a Memoria, PCAP y PPT primarios.");
  const pcap=await render("PCAP",s,input.templateStore),memory=await render("MEMORY",s,input.templateStore),ppt=await render("PPT",s,input.templateStore);
  const docs={PCAP:text(pcap),MEMORY:text(memory),PPT:text(ppt)};const all=[{name:"PCAP",text:docs.PCAP},{name:"MEMORY",text:docs.MEMORY},{name:"PPT",text:docs.PPT}] as const;const admin=[{name:"PCAP",text:docs.PCAP},{name:"MEMORY",text:docs.MEMORY}] as const;
  requireTerm("caseId",s.caseId,all);requireTerm("object",s.auditTerms.object,all);requireTerm("cpv",s.auditTerms.cpv,admin);requireTerm("pbl",s.auditTerms.pbl,admin);requireTerm("estimatedValue",s.auditTerms.estimatedValue,admin);
  const safe=s.caseId.replaceAll("/","-").replaceAll(" ","-");const documents=[{kind:"PCAP" as const,fileName:`PCAP_${safe}.odt`,bytes:pcap},{kind:"MEMORY" as const,fileName:`Memoria_${safe}.odt`,bytes:memory},{kind:"PPT" as const,fileName:`PPT_${safe}.odt`,bytes:ppt}];
  const manifest={schemaVersion:2,caseId:s.caseId,profile:"SERVICE_SOURCE_STRUCTURAL_PILOT_LB102_V2" as const,sourceAuthority:s.sourceAuthority,sourceReferences:s.sourceReferences,documents:documents.map(d=>({kind:d.kind,fileName:d.fileName,sha256:hash(d.bytes),provenance:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE",officialModel:false as const,sourceFidelity:"PROMOTED_SOURCE_DERIVED_STYLE" as const})),crossDocumentAuditReady:true,structuralFidelityAuditReady:true,packageCompleteForPilot:true,humanAcceptanceRequired:true as const,productionReady:false as const};
  const bytes=zipStoredFiles([...documents.map(d=>({name:d.fileName,bytes:d.bytes})),{name:"manifest.json",bytes:Buffer.from(JSON.stringify(manifest,null,2),"utf8")}]);return{ready:true,fileName:`Contrata-IA_${safe}_Service_SourceStructural_V2.zip`,bytes,sha256:hash(bytes),manifest,blockers};
 }catch(error){blockers.push(error instanceof Error?error.message:String(error));return{ready:false,fileName:null,bytes:null,sha256:null,manifest:null,blockers};}
}
