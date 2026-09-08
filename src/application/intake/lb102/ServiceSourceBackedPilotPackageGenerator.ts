import {createHash} from "node:crypto";
import {readOdtZip} from "../lb23/OdtPackageCodec";
import {computeOdtStyleFingerprint,type UniversalEditableTemplateBinaryStore} from "../lb23/UniversalOdtProductionRenderer";
import {zipStoredFiles} from "../lb95/StoredZipPackage";
import {LB102_SERVICE_SOURCEBACKED_ASSETS,SERVICE_OFFICIAL_OPEN_PCAP_SOURCE_URL} from "./LB102PersistedPilotTemplateStores";
import {assertAtomicDocumentPackage} from "./AtomicDocumentPackageGate";
import {sanitizeOdtSignatureResidue} from "./OdtSignatureResidueSanitizer";
import {assertLb102ExactMaterialization,assertLb102GeneratedDocumentQuality,assertLb102NoCriticalPlaceholders,assertLb102SemanticConcepts,lb102OdtText} from "./LB102UniversalDocumentQualityGate";
import {institutionalizeServiceMemoryOdt,institutionalizeServicePptOdt} from "./ServiceInstitutionalEvidenceFormatter";
import {renderServiceOfficialOpenPcap} from "./ServiceOfficialOpenPcapRenderer";
import type {StrictServicePilotSnapshot} from "./StrictServicePilotPackageGenerator";

function sha(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
function odtText(bytes:Uint8Array){return lb102OdtText(bytes);}

type CaseKey="HUELVA"|"SEVILLA";type Kind="PCAP"|"MEMORIA"|"PPT";
const CASES:Readonly<Record<CaseKey,{caseId:string;sourceAuthority:string;pages:Readonly<Record<Kind,number>>;sourceIdentifierVariants:readonly string[];markers:Readonly<Record<Kind,readonly string[]>>;assetIds:Readonly<Record<Kind,string>>;quality:Readonly<Record<Kind,{exact:readonly string[];semantic:readonly (readonly string[])[]}>>}>>={
 HUELVA:{
  caseId:"CONTR 2025 468715",sourceAuthority:"JDA_SAE_HUELVA_PRIMARY_TRIAD",pages:{MEMORIA:13,PCAP:103,PPT:28},sourceIdentifierVariants:["CONTR 2025 468715"],
  markers:{MEMORIA:["MEMORIA JUSTIFICATIVA DE LA NECESIDAD DE LA CONTRATACIÓN","CONTR 2025 468715","SERVICIOS DE LIMPIEZA","174.582,58"],PCAP:["CONTRATACIÓN DE SERVICIOS MEDIANTE PROCEDIMIENTO ABIERTO","CONTR 2025 468715","SERVICIOS DE LIMPIEZA","90911200-8"],PPT:["PLIEGO DE PRESCRIPCIONES TÉCNICAS","SERVICIO DE LIMPIEZA","AYAMONTE","LEPE","ISLA CRISTINA","PUEBLA DE GUZMÁN"]},
  assetIds:{MEMORIA:"case:CONTR-2025-468715:memoria:sourcebacked:v8",PCAP:"case:CONTR-2025-468715:pcap:sourcebacked:v8",PPT:"case:CONTR-2025-468715:ppt:sourcebacked:v8"},
  quality:{PCAP:{exact:["CONTR 2025 468715","90911200-8"],semantic:[["limpieza"],["servicio","servicios"]]},MEMORIA:{exact:["CONTR 2025 468715","174.582,58"],semantic:[["limpieza"],["necesidad","contratacion","contratación"]]},PPT:{exact:["AYAMONTE","LEPE","ISLA CRISTINA","PUEBLA DE GUZMÁN"],semantic:[["limpieza"],["prescripciones tecnicas","prescripciones técnicas"]]}},
 },
 SEVILLA:{
  caseId:"CONTR 2026 38892",sourceAuthority:"JDA_SAE_SEVILLA_PRIMARY_TRIAD",pages:{MEMORIA:13,PCAP:113,PPT:53},sourceIdentifierVariants:["CONTR 2026 38892","CONTR/20026/38892"],
  markers:{MEMORIA:["MEMORIA JUSTIFICATIVA PARA LA CONTRATACIÓN DEL SERVICIO DE MANTENIMIENTO INTEGRAL","CONTR 2026 38892","829.086,88","1.823.991,14"],PCAP:["SERVICIO DE MANTENIMIENTO INTEGRAL","PROCEDIMIENTO ABIERTO SUJETO A REGULACIÓN ARMONIZADA","CONTR/20026/38892","50700000-2"],PPT:["PLIEGO DE PRESCRIPCIONES TÉCNICAS","SERVICIO DE MANTENIMIENTO INTEGRAL","50700000-2","50413200-5"]},
  assetIds:{MEMORIA:"case:CONTR-2026-38892:memoria:sourcebacked:v8",PCAP:"case:CONTR-2026-38892:pcap:sourcebacked:v8",PPT:"case:CONTR-2026-38892:ppt:sourcebacked:v8"},
  quality:{PCAP:{exact:["50700000-2"],semantic:[["mantenimiento integral"],["procedimiento abierto","regulacion armonizada","regulación armonizada"]]},MEMORIA:{exact:["CONTR 2026 38892","829.086,88","1.823.991,14"],semantic:[["mantenimiento integral"],["memoria justificativa"]]},PPT:{exact:["50700000-2","50413200-5"],semantic:[["mantenimiento integral"],["prescripciones tecnicas","prescripciones técnicas"]]}},
 },
} as const;

function caseKey(snapshot:StrictServicePilotSnapshot):CaseKey{if(snapshot.caseId==="CONTR 2025 0000468715"||snapshot.caseId==="CONTR 2025 468715")return"HUELVA";if(snapshot.caseId==="CONTR 2026 38892")return"SEVILLA";throw new Error(`El renderer Service source-backed no admite ${snapshot.caseId}.`);}
function descriptor(templateId:string){const out=LB102_SERVICE_SOURCEBACKED_ASSETS.find(x=>x.templateId===templateId);if(!out)throw new Error(`No existe descriptor físico ${templateId}.`);return out;}

function assertSourcePcapEvidence(bytes:Uint8Array,key:CaseKey){const spec=CASES[key],q=spec.quality.PCAP,text=odtText(bytes);assertLb102NoCriticalPlaceholders(text,`Service ${key}/PCAP evidencia`);assertLb102ExactMaterialization(text,`Service ${key}/PCAP evidencia`,q.exact);assertLb102SemanticConcepts(text,`Service ${key}/PCAP evidencia`,q.semantic);}

async function loadEvidence(kind:Kind,key:CaseKey,store:UniversalEditableTemplateBinaryStore){const spec=CASES[key],asset=descriptor(spec.assetIds[kind]),source=await store.get(asset.templateId);if(!source)throw new Error(`Falta activo Service ${key}/${kind} V8.`);if(sha(source.bytes)!==asset.sha256)throw new Error(`SHA Service ${key}/${kind} V8 incorrecto.`);const entries=readOdtZip(source.bytes);if(computeOdtStyleFingerprint(entries)!==asset.styleFingerprint)throw new Error(`Huella Service ${key}/${kind} V8 incorrecta.`);const sourceText=odtText(source.bytes);if(/\{\{[^}]+\}\}|DATOS VARIABLES DEL EXPEDIENTE/.test(sourceText))throw new Error(`Service ${key}/${kind} conserva marcadores técnicos.`);for(const marker of spec.markers[kind])if(!sourceText.toLowerCase().includes(marker.toLowerCase()))throw new Error(`Service ${key}/${kind}: falta marcador físico ${marker}.`);
 const sanitized=sanitizeOdtSignatureResidue(source.bytes);if(kind==="PCAP"){assertSourcePcapEvidence(sanitized,key);return sanitized;}const output=kind==="MEMORIA"?institutionalizeServiceMemoryOdt(sanitized,`Service ${key}/MEMORIA`):institutionalizeServicePptOdt(sanitized,`Service ${key}/PPT`);const q=spec.quality[kind];assertLb102GeneratedDocumentQuality({bytes:output,kind,label:`Service ${key}/${kind}`,exactValues:q.exact,semanticConceptGroups:q.semantic});return output;}

export function assertServiceOfficialPcapPreUat(key:CaseKey,officialModel:boolean){if(!officialModel)throw new Error(`Service ${key}: UAT bloqueada. El PCAP debe reconstruirse sobre el modelo oficial Junta de Servicios correspondiente.`);}

export async function generateServiceSourceBackedPilotPackage(input:{snapshot:StrictServicePilotSnapshot;templateStore:UniversalEditableTemplateBinaryStore}){
 try{
  if(!input.snapshot.sourceConfirmed)throw new Error("El snapshot Service no está confirmado.");const key=caseKey(input.snapshot),spec=CASES[key];
  const [sourcePcap,memoria,ppt]=await Promise.all([loadEvidence("PCAP",key,input.templateStore),loadEvidence("MEMORIA",key,input.templateStore),loadEvidence("PPT",key,input.templateStore)]);
  const q=spec.quality.PCAP;const renderedPcap=await renderServiceOfficialOpenPcap({templateStore:input.templateStore,sourcePcapBytes:sourcePcap,label:`Service ${key}/PCAP oficial`,exactValues:q.exact,semanticConceptGroups:q.semantic});assertServiceOfficialPcapPreUat(key,renderedPcap.officialModel);const pcap=renderedPcap.bytes;
  const safe=spec.caseId.replaceAll("/","-").replaceAll(" ","-");
  const docs=[{kind:"PCAP" as const,fileName:`PCAP_${safe}_Service_JDA_Open_Official.odt`,bytes:pcap},{kind:"MEMORIA" as const,fileName:`Memoria_${safe}_Service_SourceBacked.odt`,bytes:memoria},{kind:"PPT" as const,fileName:`PPT_${safe}_Service_SourceBacked.odt`,bytes:ppt}];
  const packageVersion=`SERVICE_${key}_SOURCE_BACKED_REGRESSION_LB102_V8`;const unresolved=input.snapshot.sourceConflict?[`El snapshot ${spec.caseId} contiene conflicto de fuente no resuelto.`]:[];const atomic=assertAtomicDocumentPackage({caseId:spec.caseId,packageVersion,canonicalSnapshot:input.snapshot,documents:docs,unresolvedConflicts:unresolved});
  const manifest={schemaVersion:4,caseId:spec.caseId,profile:packageVersion,...atomic,sourceAuthority:spec.sourceAuthority,templateProvenance:"OFFICIAL_PCAP_PLUS_SOURCE_BACKED_EVIDENCE" as const,sourceBasis:"VALIDATED_REAL_CASE_REGRESSION_SOURCE" as const,neverGeneralModel:true as const,sourceIdentifierVariants:spec.sourceIdentifierVariants,sourceConflictRecorded:spec.sourceIdentifierVariants.length>1,signaturePolicy:{digitalSignatureResidueAllowed:false as const,verificationCodesAllowed:false as const},preUatPolicy:{officialPcapRequired:true as const,officialPcapSatisfied:true as const,pandaLessonsApplied:true as const},officialPcap:{sourceUrl:SERVICE_OFFICIAL_OPEN_PCAP_SOURCE_URL,family:"SERVICE" as const,procedure:"OPEN" as const,financing:"SELF_FUNDED" as const},documents:docs.map(d=>({kind:d.kind,fileName:d.fileName,sha256:sha(d.bytes),snapshotHash:atomic.snapshotHash,generationId:atomic.generationId,provenance:d.kind==="PCAP"?"OFFICIAL_MODEL_PLUS_VALIDATED_ANNEX_I_EVIDENCE" as const:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE" as const,officialModel:d.kind==="PCAP"})),sourcePhysicalPages:spec.pages,humanAcceptanceRequired:true as const,productionReady:false as const};
  const bytes=zipStoredFiles([...docs.map(d=>({name:d.fileName,bytes:d.bytes})),{name:"manifest.json",bytes:Buffer.from(JSON.stringify(manifest,null,2),"utf8")}]);return{ready:true,fileName:`Contrata-IA_${safe}_Service_SourceBacked.zip`,bytes,sha256:sha(bytes),manifest,blockers:[] as string[]};
 }catch(error){return{ready:false,fileName:null,bytes:null,sha256:null,manifest:null,blockers:[error instanceof Error?error.message:String(error)]};}
}
