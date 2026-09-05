import {createHash} from "node:crypto";
import {readOdtZip} from "../lb23/OdtPackageCodec";
import {computeOdtStyleFingerprint,type UniversalEditableTemplateBinaryStore} from "../lb23/UniversalOdtProductionRenderer";
import {zipStoredFiles} from "../lb95/StoredZipPackage";
import type {UniversalEvidenceRecord} from "../lb52/UniversalEvidenceWorkspace";
import {LB102_PANDA_ASSETS,PANDA_OFFICIAL_ASO_PCAP_SOURCE_URL} from "./LB102PersistedPilotTemplateStores";
import {assertAtomicDocumentPackage} from "./AtomicDocumentPackageGate";
import {assertNoOdtSignatureResidue,sanitizeOdtSignatureResidue} from "./OdtSignatureResidueSanitizer";
import {renderPandaOfficialAsoPcap} from "./PandaOfficialAsoPcapRenderer";
import {assertPandaInstitutionalEvidenceQuality,institutionalizePandaEvidenceOdt} from "./PandaInstitutionalEvidenceFormatter";

function sha(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
function odtText(bytes:Uint8Array){const e=readOdtZip(bytes).find(x=>x.name==="content.xml");return e?Buffer.from(e.bytes).toString("utf8").replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/\s+/g," "):"";}
function validatedText(record:UniversalEvidenceRecord,path:string){const f=record.fields[path];if(!f||f.status!=="HUMAN_VALIDATED"||!f.humanValidated||typeof f.value!=="string"||!f.value.trim())throw new Error(`${path} no está validado para Panda V11.`);return f.value.trim();}
function requiredAsset(kind:"MEMORIA"|"PPT"){const asset=LB102_PANDA_ASSETS.find(item=>item.kind===kind);if(!asset)throw new Error(`Manifiesto Panda V11 incompleto para ${kind}.`);return asset;}

const EVIDENCE_SPECS={
 MEMORIA:{asset:requiredAsset("MEMORIA"),markers:["1. NATURALEZA Y OBJETO DEL CONTRATO","14. SOLICITUD DE INFORME PRECEPTIVO PREVIO A LA CONTRATACIÓN","CONTR 2025 466864","48760000-3"]},
 PPT:{asset:requiredAsset("PPT"),markers:["1 INTRODUCCIÓN","4.11 Seguridad","CONTR 2025 466864","PANDA SECURITY"]},
} as const;
type EvidenceKind=keyof typeof EVIDENCE_SPECS;

async function loadInstitutionalEvidence(kind:EvidenceKind,store:UniversalEditableTemplateBinaryStore){
 const spec=EVIDENCE_SPECS[kind],source=await store.get(spec.asset.templateId);if(!source)throw new Error(`Falta activo Panda ${kind} de evidencia.`);
 if(sha(source.bytes)!==spec.asset.sha256)throw new Error(`SHA Panda ${kind} de evidencia incorrecto.`);
 const entries=readOdtZip(source.bytes);if(computeOdtStyleFingerprint(entries)!==spec.asset.styleFingerprint)throw new Error(`Huella Panda ${kind} de evidencia incorrecta.`);
 const sourceText=odtText(source.bytes);if(/\{\{[^}]+\}\}|DATOS VARIABLES DEL EXPEDIENTE/.test(sourceText))throw new Error(`Panda ${kind} conserva marcadores técnicos.`);
 for(const marker of spec.markers)if(!sourceText.toLowerCase().includes(marker.toLowerCase()))throw new Error(`Panda ${kind}: falta marcador físico ${marker}.`);
 const sanitized=sanitizeOdtSignatureResidue(source.bytes);const cleanedText=odtText(sanitized);
 for(const marker of spec.markers)if(!cleanedText.toLowerCase().includes(marker.toLowerCase()))throw new Error(`Panda ${kind}: el saneado de firma eliminó contenido material ${marker}.`);
 const institutional=institutionalizePandaEvidenceOdt(sanitized,kind);assertNoOdtSignatureResidue(institutional,`Panda ${kind} V11`);assertPandaInstitutionalEvidenceQuality(institutional,kind);return institutional;
}

/** Panda V11: PCAP sobre modelo oficial ASO vigente con Anexo I materializado desde evidencia real; Memoria/PPT remaquetados institucionalmente y sin huellas de firma. */
export async function generatePandaSourceBackedPilotPackage(input:{record:UniversalEvidenceRecord;templateStore:UniversalEditableTemplateBinaryStore}){
 try{
  if(input.record.caseId!=="CONTR 2025 466864")throw new Error("El renderer Panda V11 solo admite el caso de regresión CONTR 2025 466864.");
  if(validatedText(input.record,"contractType")!=="SUPPLY"||validatedText(input.record,"procedure")!=="ABIERTO_SIMPLIFICADO_ORDINARIO"||validatedText(input.record,"technical.supplyVariant")!=="ICT_LICENSE_OR_SOFTWARE"||validatedText(input.record,"cpvMain")!=="48760000-3")throw new Error("El caso no coincide con el perfil Panda V11.");
  const pcap=await renderPandaOfficialAsoPcap({templateStore:input.templateStore,caseId:input.record.caseId,record:input.record});
  const [memoria,ppt]=await Promise.all([loadInstitutionalEvidence("MEMORIA",input.templateStore),loadInstitutionalEvidence("PPT",input.templateStore)]);
  assertNoOdtSignatureResidue(pcap.bytes,"PCAP Panda V11");
  const safe=input.record.caseId.replaceAll("/","-").replaceAll(" ","-");const docs=[{kind:"PCAP" as const,fileName:`PCAP_${safe}_JDA_ASO_Official_Materialized_V11.odt`,bytes:pcap.bytes},{kind:"MEMORIA" as const,fileName:`Memoria_${safe}_Panda_Institucional_V11.odt`,bytes:memoria},{kind:"PPT" as const,fileName:`PPT_${safe}_Panda_Institucional_V11.odt`,bytes:ppt}];
  const atomic=assertAtomicDocumentPackage({caseId:input.record.caseId,packageVersion:"PANDA_LB102_V11_OFFICIAL_PCAP_MATERIALIZED_INSTITUTIONAL",canonicalSnapshot:input.record,documents:docs});
  const manifest={schemaVersion:5,caseId:input.record.caseId,profile:"PANDA_LB102_V11_OFFICIAL_PCAP_MATERIALIZED_INSTITUTIONAL" as const,...atomic,pcapModel:{officialModel:true as const,sourceAuthority:"JDA_COMISION_CONSULTIVA_RECOMMENDED_MODEL" as const,sourceUrl:PANDA_OFFICIAL_ASO_PCAP_SOURCE_URL,stylePolicy:"PRESERVE_OFFICIAL_MODEL_STYLE" as const,annexIDataAuthority:"VALIDATED_REAL_CASE_PCAP_EVIDENCE" as const},evidenceAuthority:"REG-SUPPLY-002_PHYSICAL_SOURCE",evidenceLayoutTransformation:{basis:"SOURCE_PLIEGOS_AND_FERRETERIA_INSTITUTIONAL_REFLOW" as const,deterministic:true as const,font:"Source Sans Pro",fontSize:"10.5pt",lineHeight:"115%",pageMargin:"2cm"},signaturePolicy:{digitalSignatureResidueAllowed:false as const,verificationCodesAllowed:false as const,visibleSignedDocumentFooterAllowed:false as const,signerNameMayRemainOnlyAsEditableBusinessData:true as const},qualityPolicy:{pcapMaterializationRequired:true as const,institutionalEvidenceFormattingRequired:true as const,unresolvedCriticalPlaceholdersAllowed:false as const},documents:docs.map(d=>({kind:d.kind,fileName:d.fileName,sha256:sha(d.bytes),snapshotHash:atomic.snapshotHash,generationId:atomic.generationId,provenance:d.kind==="PCAP"?"OFFICIAL_MODEL_PLUS_VALIDATED_ANNEX_I_EVIDENCE":"VALIDATED_REAL_CASE_EVIDENCE_CLEANED_REFLOWED",officialModel:d.kind==="PCAP"})),humanAcceptanceRequired:true as const,productionReady:false as const};
  const bytes=zipStoredFiles([...docs.map(d=>({name:d.fileName,bytes:d.bytes})),{name:"manifest.json",bytes:Buffer.from(JSON.stringify(manifest,null,2),"utf8")}]);return{ready:true,fileName:`Contrata-IA_${safe}_Panda_V11.zip`,bytes,sha256:sha(bytes),manifest,blockers:[] as string[]};
 }catch(error){return{ready:false,fileName:null,bytes:null,sha256:null,manifest:null,blockers:[error instanceof Error?error.message:String(error)]};}
}
