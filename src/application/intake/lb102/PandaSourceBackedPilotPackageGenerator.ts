import {createHash} from "node:crypto";
import {readOdtZip,writeOdtZip} from "../lb23/OdtPackageCodec";
import {computeOdtStyleFingerprint,type UniversalEditableTemplateBinaryStore} from "../lb23/UniversalOdtProductionRenderer";
import {zipStoredFiles} from "../lb95/StoredZipPackage";
import type {UniversalEvidenceRecord} from "../lb52/UniversalEvidenceWorkspace";
import {LB102_PANDA_ASSETS} from "./LB102PersistedPilotTemplateStores";

function sha(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
function esc(v:string){return v.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&apos;");}
function odtText(bytes:Uint8Array){const e=readOdtZip(bytes).find(x=>x.name==="content.xml");return e?Buffer.from(e.bytes).toString("utf8").replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/\s+/g," "):"";}
function validatedText(record:UniversalEvidenceRecord,path:string){const f=record.fields[path];if(!f||f.status!=="HUMAN_VALIDATED"||!f.humanValidated||typeof f.value!=="string"||!f.value.trim())throw new Error(`${path} no está validado para Panda source-backed.`);return f.value.trim();}
function requiredAsset(index:number){const asset=LB102_PANDA_ASSETS[index];if(!asset)throw new Error(`Manifiesto Panda V4 incompleto en índice ${index}.`);return asset;}

const SPECS={
 PCAP:{asset:requiredAsset(0),tokens:{caseId:1,cpvMain:1},markers:["PROCEDIMIENTO ABIERTO SIMPLIFICADO ORDINARIO","I. ELEMENTOS DEL CONTRATO","IV. PRERROGATIVAS DE LA ADMINISTRACIÓN, JURISDICCIÓN Y RECURSOS"]},
 MEMORIA:{asset:requiredAsset(1),tokens:{caseId:1,cpvMain:1},markers:["1. NATURALEZA Y OBJETO DEL CONTRATO","14. SOLICITUD DE INFORME PRECEPTIVO PREVIO A LA CONTRATACIÓN","Página de 1 de 5"]},
 PPT:{asset:requiredAsset(2),tokens:{caseId:1},markers:["1 INTRODUCCIÓN","4.11 Seguridad","Página 2 de 16"]},
} as const;

type Kind=keyof typeof SPECS;
async function render(kind:Kind,record:UniversalEvidenceRecord,store:UniversalEditableTemplateBinaryStore){
 const spec=SPECS[kind],source=await store.get(spec.asset.templateId);if(!source)throw new Error(`Falta activo Panda ${kind} V4.`);
 if(sha(source.bytes)!==spec.asset.sha256)throw new Error(`SHA Panda ${kind} V4 incorrecto.`);
 let entries=readOdtZip(source.bytes);if(computeOdtStyleFingerprint(entries)!==spec.asset.styleFingerprint)throw new Error(`Huella Panda ${kind} V4 incorrecta.`);
 const ce=entries.find(x=>x.name==="content.xml");if(!ce)throw new Error(`Panda ${kind} sin content.xml.`);let content=Buffer.from(ce.bytes).toString("utf8");
 const values:{caseId:string;cpvMain:string}={caseId:record.caseId,cpvMain:validatedText(record,"cpvMain")};
 for(const [token,count] of Object.entries(spec.tokens)){const marker=`{{${token}}}`,actual=content.split(marker).length-1;if(actual!==count)throw new Error(`Panda ${kind}: anclaje ${token} ${actual}/${count}.`);content=content.replaceAll(marker,esc(values[token as keyof typeof values]));}
 if(/\{\{[^}]+\}\}/.test(content)||/CONTRATA-IA|DATOS VARIABLES DEL EXPEDIENTE/.test(content))throw new Error(`Panda ${kind} conserva marcadores técnicos.`);
 entries=entries.map(x=>x.name==="content.xml"?{...x,bytes:Buffer.from(content,"utf8")}:x);if(computeOdtStyleFingerprint(entries)!==spec.asset.styleFingerprint)throw new Error(`Panda ${kind} alteró estilo.`);
 const out=writeOdtZip(entries),text=odtText(out);for(const m of spec.markers)if(!text.toLowerCase().includes(m.toLowerCase()))throw new Error(`Panda ${kind}: falta marcador físico ${m}.`);return out;
}

/** Generador exclusivo del caso Panda de regresión. No constituye modelo general ASO. */
export async function generatePandaSourceBackedPilotPackage(input:{record:UniversalEvidenceRecord;templateStore:UniversalEditableTemplateBinaryStore}){
 try{
  if(input.record.caseId!=="CONTR 2025 466864")throw new Error("El renderer Panda source-backed V4 solo admite el caso de regresión CONTR 2025 466864.");
  if(validatedText(input.record,"contractType")!=="SUPPLY"||validatedText(input.record,"procedure")!=="ABIERTO_SIMPLIFICADO_ORDINARIO"||validatedText(input.record,"technical.supplyVariant")!=="ICT_LICENSE_OR_SOFTWARE")throw new Error("El caso no coincide con el perfil Panda de regresión.");
  const [pcap,memoria,ppt]=await Promise.all([render("PCAP",input.record,input.templateStore),render("MEMORIA",input.record,input.templateStore),render("PPT",input.record,input.templateStore)]);
  const safe=input.record.caseId.replaceAll("/","-").replaceAll(" ","-");const docs=[{kind:"PCAP" as const,fileName:`PCAP_${safe}_Panda_SourceBacked.odt`,bytes:pcap},{kind:"MEMORIA" as const,fileName:`Memoria_${safe}_Panda_SourceBacked.odt`,bytes:memoria},{kind:"PPT" as const,fileName:`PPT_${safe}_Panda_SourceBacked.odt`,bytes:ppt}];
  const manifest={schemaVersion:1,caseId:input.record.caseId,profile:"PANDA_SOURCE_BACKED_REGRESSION_LB102_V4" as const,sourceAuthority:"REG-SUPPLY-002_PHYSICAL_SOURCE",neverGeneralModel:true as const,documents:docs.map(d=>({kind:d.kind,fileName:d.fileName,sha256:sha(d.bytes),provenance:"VALIDATED_REAL_CASE_REGRESSION_SOURCE",officialModel:false as const})),sourcePhysicalPages:{MEMORIA:5,PCAP:85,PPT:16},crossDocumentAuditReady:true,humanAcceptanceRequired:true as const,productionReady:false as const};
  const bytes=zipStoredFiles([...docs.map(d=>({name:d.fileName,bytes:d.bytes})),{name:"manifest.json",bytes:Buffer.from(JSON.stringify(manifest,null,2),"utf8")}]);return{ready:true,fileName:`Contrata-IA_${safe}_Panda_SourceBacked.zip`,bytes,sha256:sha(bytes),manifest,blockers:[] as string[]};
 }catch(error){return{ready:false,fileName:null,bytes:null,sha256:null,manifest:null,blockers:[error instanceof Error?error.message:String(error)]};}
}
