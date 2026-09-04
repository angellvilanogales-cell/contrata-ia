import {createHash} from "node:crypto";
import {readOdtZip} from "../lb23/OdtPackageCodec";
import {computeOdtStyleFingerprint,type UniversalEditableTemplateBinaryStore} from "../lb23/UniversalOdtProductionRenderer";
import {zipStoredFiles} from "../lb95/StoredZipPackage";
import type {UniversalEvidenceRecord} from "../lb52/UniversalEvidenceWorkspace";
import {LB102_PANDA_ASSETS} from "./LB102PersistedPilotTemplateStores";
import {assertAtomicDocumentPackage} from "./AtomicDocumentPackageGate";
import {harmonizePandaOdtLayout,PANDA_FERRETERIA_LAYOUT_POLICY} from "./PandaFerreteriaLayoutHarmonizer";

function sha(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
function odtText(bytes:Uint8Array){const e=readOdtZip(bytes).find(x=>x.name==="content.xml");return e?Buffer.from(e.bytes).toString("utf8").replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/\s+/g," "):"";}
function validatedText(record:UniversalEvidenceRecord,path:string){const f=record.fields[path];if(!f||f.status!=="HUMAN_VALIDATED"||!f.humanValidated||typeof f.value!=="string"||!f.value.trim())throw new Error(`${path} no está validado para Panda source-backed.`);return f.value.trim();}
function requiredAsset(index:number){const asset=LB102_PANDA_ASSETS[index];if(!asset)throw new Error(`Manifiesto Panda V8 incompleto en índice ${index}.`);return asset;}

const SPECS={
 PCAP:{asset:requiredAsset(0),markers:["PROCEDIMIENTO ABIERTO SIMPLIFICADO ORDINARIO","I. ELEMENTOS DEL CONTRATO","IV. PRERROGATIVAS DE LA ADMINISTRACIÓN, JURISDICCIÓN Y RECURSOS","CONTR 2025 466864","48760000-3"]},
 MEMORIA:{asset:requiredAsset(1),markers:["1. NATURALEZA Y OBJETO DEL CONTRATO","14. SOLICITUD DE INFORME PRECEPTIVO PREVIO A LA CONTRATACIÓN","CONTR 2025 466864","48760000-3"]},
 PPT:{asset:requiredAsset(2),markers:["1 INTRODUCCIÓN","4.11 Seguridad","CONTR 2025 466864","PANDA SECURITY"]},
} as const;

type Kind=keyof typeof SPECS;
async function loadPhysical(kind:Kind,store:UniversalEditableTemplateBinaryStore){
 const spec=SPECS[kind],source=await store.get(spec.asset.templateId);if(!source)throw new Error(`Falta activo Panda ${kind} V8.`);
 if(sha(source.bytes)!==spec.asset.sha256)throw new Error(`SHA Panda ${kind} V8 incorrecto.`);
 const entries=readOdtZip(source.bytes);if(computeOdtStyleFingerprint(entries)!==spec.asset.styleFingerprint)throw new Error(`Huella Panda ${kind} V8 incorrecta.`);
 const sourceText=odtText(source.bytes);if(/\{\{[^}]+\}\}|DATOS VARIABLES DEL EXPEDIENTE/.test(sourceText))throw new Error(`Panda ${kind} conserva marcadores técnicos.`);
 for(const marker of spec.markers)if(!sourceText.toLowerCase().includes(marker.toLowerCase()))throw new Error(`Panda ${kind}: falta marcador físico ${marker}.`);
 const harmonized=harmonizePandaOdtLayout(source.bytes);
 const outputText=odtText(harmonized);
 if(outputText!==sourceText)throw new Error(`Panda ${kind}: la armonización de formato alteró el texto acreditado.`);
 return harmonized;
}

/** Panda V9: contenido source-backed exacto y presentación armonizada determinísticamente con el patrón visual Ferretería. */
export async function generatePandaSourceBackedPilotPackage(input:{record:UniversalEvidenceRecord;templateStore:UniversalEditableTemplateBinaryStore}){
 try{
  if(input.record.caseId!=="CONTR 2025 466864")throw new Error("El renderer Panda source-backed V9 solo admite el caso de regresión CONTR 2025 466864.");
  if(validatedText(input.record,"contractType")!=="SUPPLY"||validatedText(input.record,"procedure")!=="ABIERTO_SIMPLIFICADO_ORDINARIO"||validatedText(input.record,"technical.supplyVariant")!=="ICT_LICENSE_OR_SOFTWARE"||validatedText(input.record,"cpvMain")!=="48760000-3")throw new Error("El caso no coincide con el perfil Panda de regresión.");
  const [pcap,memoria,ppt]=await Promise.all([loadPhysical("PCAP",input.templateStore),loadPhysical("MEMORIA",input.templateStore),loadPhysical("PPT",input.templateStore)]);
  const safe=input.record.caseId.replaceAll("/","-").replaceAll(" ","-");const docs=[{kind:"PCAP" as const,fileName:`PCAP_${safe}_Panda_SourceBacked_V9.odt`,bytes:pcap},{kind:"MEMORIA" as const,fileName:`Memoria_${safe}_Panda_SourceBacked_V9.odt`,bytes:memoria},{kind:"PPT" as const,fileName:`PPT_${safe}_Panda_SourceBacked_V9.odt`,bytes:ppt}];
  const atomic=assertAtomicDocumentPackage({caseId:input.record.caseId,packageVersion:"PANDA_SOURCE_BACKED_REGRESSION_LB102_V9_FORMAT_HARMONIZED",canonicalSnapshot:input.record,documents:docs});
  const manifest={schemaVersion:3,caseId:input.record.caseId,profile:"PANDA_SOURCE_BACKED_REGRESSION_LB102_V9_FORMAT_HARMONIZED" as const,...atomic,sourceAuthority:"REG-SUPPLY-002_PHYSICAL_SOURCE",templateProvenance:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE" as const,layoutTransformation:{basis:"FERRETERIA_INSTITUTIONAL_VISUAL_PATTERN" as const,deterministic:true as const,textPreserved:true as const,...PANDA_FERRETERIA_LAYOUT_POLICY},neverGeneralModel:true as const,documents:docs.map(d=>({kind:d.kind,fileName:d.fileName,sha256:sha(d.bytes),snapshotHash:atomic.snapshotHash,generationId:atomic.generationId,provenance:"CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE" as const,sourceBasis:"VALIDATED_REAL_CASE_REGRESSION_SOURCE" as const,officialModel:false as const})),sourcePhysicalPages:{MEMORIA:5,PCAP:85,PPT:16},humanAcceptanceRequired:true as const,productionReady:false as const};
  const bytes=zipStoredFiles([...docs.map(d=>({name:d.fileName,bytes:d.bytes})),{name:"manifest.json",bytes:Buffer.from(JSON.stringify(manifest,null,2),"utf8")}]);return{ready:true,fileName:`Contrata-IA_${safe}_Panda_SourceBacked_V9.zip`,bytes,sha256:sha(bytes),manifest,blockers:[] as string[]};
 }catch(error){return{ready:false,fileName:null,bytes:null,sha256:null,manifest:null,blockers:[error instanceof Error?error.message:String(error)]};}
}
