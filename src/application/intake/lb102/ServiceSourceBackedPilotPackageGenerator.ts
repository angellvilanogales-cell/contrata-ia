import {createHash} from "node:crypto";
import {readOdtZip} from "../lb23/OdtPackageCodec";
import {computeOdtStyleFingerprint,type UniversalEditableTemplateBinaryStore} from "../lb23/UniversalOdtProductionRenderer";
import {zipStoredFiles} from "../lb95/StoredZipPackage";
import {LB102_SERVICE_SOURCEBACKED_ASSETS} from "./LB102PersistedPilotTemplateStores";
import {assertAtomicDocumentPackage} from "./AtomicDocumentPackageGate";
import type {StrictServicePilotSnapshot} from "./StrictServicePilotPackageGenerator";

function sha(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
function odtText(bytes:Uint8Array){const e=readOdtZip(bytes).find(x=>x.name==="content.xml");return e?Buffer.from(e.bytes).toString("utf8").replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/\s+/g," "):"";}

type CaseKey="HUELVA"|"SEVILLA";type Kind="PCAP"|"MEMORIA"|"PPT";
const CASES:Readonly<Record<CaseKey,{caseId:string;sourceAuthority:string;pages:Readonly<Record<Kind,number>>;sourceIdentifierVariants:readonly string[];markers:Readonly<Record<Kind,readonly string[]>>;assetIds:Readonly<Record<Kind,string>>}>>={
 HUELVA:{
  caseId:"CONTR 2025 468715",sourceAuthority:"JDA_SAE_HUELVA_PRIMARY_TRIAD",pages:{MEMORIA:13,PCAP:103,PPT:28},sourceIdentifierVariants:["CONTR 2025 468715"],
  markers:{MEMORIA:["MEMORIA JUSTIFICATIVA DE LA NECESIDAD DE LA CONTRATACIÓN","CONTR 2025 468715","SERVICIOS DE LIMPIEZA","174.582,58"],PCAP:["CONTRATACIÓN DE SERVICIOS MEDIANTE PROCEDIMIENTO ABIERTO","CONTR 2025 468715","SERVICIOS DE LIMPIEZA","90911200-8"],PPT:["PLIEGO DE PRESCRIPCIONES TÉCNICAS","SERVICIO DE LIMPIEZA","AYAMONTE","LEPE","ISLA CRISTINA","PUEBLA DE GUZMÁN"]},
  assetIds:{MEMORIA:"case:CONTR-2025-468715:memoria:sourcebacked:v8",PCAP:"case:CONTR-2025-468715:pcap:sourcebacked:v8",PPT:"case:CONTR-2025-468715:ppt:sourcebacked:v8"},
 },
 SEVILLA:{
  caseId:"CONTR 2026 38892",sourceAuthority:"JDA_SAE_SEVILLA_PRIMARY_TRIAD",pages:{MEMORIA:13,PCAP:113,PPT:53},sourceIdentifierVariants:["CONTR 2026 38892","CONTR/20026/38892"],
  markers:{MEMORIA:["MEMORIA JUSTIFICATIVA PARA LA CONTRATACIÓN DEL SERVICIO DE MANTENIMIENTO INTEGRAL","CONTR 2026 38892","829.086,88","1.823.991,14"],PCAP:["SERVICIO DE MANTENIMIENTO INTEGRAL","PROCEDIMIENTO ABIERTO SUJETO A REGULACIÓN ARMONIZADA","CONTR/20026/38892","50700000-2"],PPT:["PLIEGO DE PRESCRIPCIONES TÉCNICAS","SERVICIO DE MANTENIMIENTO INTEGRAL","50700000-2","50413200-5","50710000-5"]},
  assetIds:{MEMORIA:"case:CONTR-2026-38892:memoria:sourcebacked:v8",PCAP:"case:CONTR-2026-38892:pcap:sourcebacked:v8",PPT:"case:CONTR-2026-38892:ppt:sourcebacked:v8"},
 },
} as const;

function caseKey(snapshot:StrictServicePilotSnapshot):CaseKey{if(snapshot.caseId==="CONTR 2025 0000468715"||snapshot.caseId==="CONTR 2025 468715")return"HUELVA";if(snapshot.caseId==="CONTR 2026 38892")return"SEVILLA";throw new Error(`El renderer Service source-backed no admite ${snapshot.caseId}.`);}
function descriptor(templateId:string){const out=LB102_SERVICE_SOURCEBACKED_ASSETS.find(x=>x.templateId===templateId);if(!out)throw new Error(`No existe descriptor físico ${templateId}.`);return out;}
async function load(kind:Kind,key:CaseKey,store:UniversalEditableTemplateBinaryStore){const spec=CASES[key],asset=descriptor(spec.assetIds[kind]),source=await store.get(asset.templateId);if(!source)throw new Error(`Falta activo Service ${key}/${kind} V8.`);if(sha(source.bytes)!==asset.sha256)throw new Error(`SHA Service ${key}/${kind} V8 incorrecto.`);const entries=readOdtZip(source.bytes);if(computeOdtStyleFingerprint(entries)!==asset.styleFingerprint)throw new Error(`Huella Service ${key}/${kind} V8 incorrecta.`);const text=odtText(source.bytes);if(/\{\{[^}]+\}\}|DATOS VARIABLES DEL EXPEDIENTE/.test(text))throw new Error(`Service ${key}/${kind} conserva marcadores técnicos.`);for(const marker of spec.markers[kind])if(!text.toLowerCase().includes(marker.toLowerCase()))throw new Error(`Service ${key}/${kind}: falta marcador físico ${marker}.`);return source.bytes;}

/** Cada caso Service se entrega como una única generación atómica PCAP+Memoria+PPT. */
export async function generateServiceSourceBackedPilotPackage(input:{snapshot:StrictServicePilotSnapshot;templateStore:UniversalEditableTemplateBinaryStore}){
 try{
  if(!input.snapshot.sourceConfirmed)throw new Error("El snapshot Service no está confirmado.");const key=caseKey(input.snapshot),spec=CASES[key];
  const [pcap,memoria,ppt]=await Promise.all([load("PCAP",key,input.templateStore),load("MEMORIA",key,input.templateStore),load("PPT",key,input.templateStore)]);const safe=spec.caseId.replaceAll("/","-").replaceAll(" ","-");
  const docs=[{kind:"PCAP" as const,fileName:`PCAP_${safe}_Service_SourceBacked.odt`,bytes:pcap},{kind:"MEMORIA" as const,fileName:`Memoria_${safe}_Service_SourceBacked.odt`,bytes:memoria},{kind:"PPT" as const,fileName:`PPT_${safe}_Service_SourceBacked.odt`,bytes:ppt}];
  const packageVersion=`SERVICE_${key}_SOURCE_BACKED_REGRESSION_LB102_V8`;const unresolved=input.snapshot.sourceConflict?[`El snapshot ${spec.caseId} contiene conflicto de fuente no resuelto.`]:[];const atomic=assertAtomicDocumentPackage({caseId:spec.caseId,packageVersion,canonicalSnapshot:input.snapshot,documents:docs,unresolvedConflicts:unresolved});
  const manifest={schemaVersion:2,caseId:spec.caseId,profile:packageVersion,...atomic,sourceAuthority:spec.sourceAuthority,templateProvenance:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE" as const,sourceBasis:"VALIDATED_REAL_CASE_REGRESSION_SOURCE" as const,neverGeneralModel:true as const,sourceIdentifierVariants:spec.sourceIdentifierVariants,sourceConflictRecorded:spec.sourceIdentifierVariants.length>1,documents:docs.map(d=>({kind:d.kind,fileName:d.fileName,sha256:sha(d.bytes),snapshotHash:atomic.snapshotHash,generationId:atomic.generationId,provenance:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE" as const,officialModel:false as const})),sourcePhysicalPages:spec.pages,humanAcceptanceRequired:true as const,productionReady:false as const};
  const bytes=zipStoredFiles([...docs.map(d=>({name:d.fileName,bytes:d.bytes})),{name:"manifest.json",bytes:Buffer.from(JSON.stringify(manifest,null,2),"utf8")}]);return{ready:true,fileName:`Contrata-IA_${safe}_Service_SourceBacked.zip`,bytes,sha256:sha(bytes),manifest,blockers:[] as string[]};
 }catch(error){return{ready:false,fileName:null,bytes:null,sha256:null,manifest:null,blockers:[error instanceof Error?error.message:String(error)]};}
}
