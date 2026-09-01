import {createHash} from "node:crypto";
import {computeOdtStyleFingerprint} from "../lb23/UniversalOdtProductionRenderer";
import {readOdtZip} from "../lb23/OdtPackageCodec";
import {HttpPersistedTemplateAssetStore,type PersistedTemplateAssetDescriptor} from "../lb94/HttpPersistedTemplateAssetStore";
import {LB102_FERRETERIA_SOURCE_ASSETS,LB102_PANDA_ASSETS,LB102_SERVICE_SOURCEBACKED_ASSETS} from "./LB102PersistedPilotTemplateStores";

export type LB102ProtectedSourceGroup="ferreteria"|"panda"|"service-huelva"|"service-sevilla";
export type LB102ProtectedSourceKind="PCAP"|"MEMORIA"|"PPT";

interface SourceGroupPolicy{
 readonly family:"SUPPLY"|"SERVICE";
 readonly caseId:string;
 readonly sourceAuthority:string;
 readonly assets:readonly PersistedTemplateAssetDescriptor[];
 readonly neverGeneralModel:boolean;
}

const SERVICE_HUELVA_PREFIX="case:CONTR-2025-468715:";
const SERVICE_SEVILLA_PREFIX="case:CONTR-2026-38892:";

export const LB102_PROTECTED_SOURCE_GROUPS:Readonly<Record<LB102ProtectedSourceGroup,SourceGroupPolicy>>={
 ferreteria:{family:"SUPPLY",caseId:"CONTR/2026/240267",sourceAuthority:"VALIDATED_REAL_EXPEDIENTE",assets:LB102_FERRETERIA_SOURCE_ASSETS,neverGeneralModel:true},
 panda:{family:"SUPPLY",caseId:"CONTR 2025 466864",sourceAuthority:"VALIDATED_REAL_EXPEDIENTE_DERIVED_EDITABLE_RECONSTRUCTION",assets:LB102_PANDA_ASSETS,neverGeneralModel:true},
 "service-huelva":{family:"SERVICE",caseId:"CONTR 2025 468715",sourceAuthority:"VALIDATED_REAL_EXPEDIENTE_DERIVED_EDITABLE_RECONSTRUCTION",assets:LB102_SERVICE_SOURCEBACKED_ASSETS.filter(asset=>asset.templateId.startsWith(SERVICE_HUELVA_PREFIX)),neverGeneralModel:true},
 "service-sevilla":{family:"SERVICE",caseId:"CONTR 2026 38892",sourceAuthority:"VALIDATED_REAL_EXPEDIENTE_DERIVED_EDITABLE_RECONSTRUCTION",assets:LB102_SERVICE_SOURCEBACKED_ASSETS.filter(asset=>asset.templateId.startsWith(SERVICE_SEVILLA_PREFIX)),neverGeneralModel:true},
} as const;

function sha256(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
function persistenceConfig(){const endpoint=(process.env.CONTRATA_IA_PERSISTENCE_URL??"").trim().replace(/\/+$/,"");const token=(process.env.CONTRATA_IA_PERSISTENCE_TOKEN??"").trim();if(!endpoint.startsWith("https://")||token.length<16)throw new Error("Persistencia autenticada no configurada.");return{endpoint,token};}
function policy(group:LB102ProtectedSourceGroup){const value=LB102_PROTECTED_SOURCE_GROUPS[group];if(!value)throw new Error("Grupo de fuentes LB102 desconocido.");if(value.assets.length===0)throw new Error(`${group}: allowlist física vacía; ingreso bloqueado.`);return value;}
function descriptorFor(group:LB102ProtectedSourceGroup,kind:LB102ProtectedSourceKind){const value=policy(group);const matches=value.assets.filter(asset=>asset.kind===kind);if(matches.length!==1)throw new Error(`${group}/${kind}: la allowlist debe resolver exactamente un activo.`);return{groupPolicy:value,descriptor:matches[0]!};}

/**
 * Ingreso binario fail-closed para los activos físicos de los pilotos LB102.
 * Solo persiste bytes que coinciden simultáneamente con templateId permitido, SHA y huella de estilo del manifiesto en código.
 */
export async function persistLB102ProtectedSource(group:LB102ProtectedSourceGroup,kind:LB102ProtectedSourceKind,bytes:Uint8Array){
 const {groupPolicy,descriptor}=descriptorFor(group,kind);
 if(sha256(bytes)!==descriptor.sha256)throw new Error(`${group}/${kind}: SHA-256 no coincide con el binario permitido.`);
 let style:string;
 try{style=computeOdtStyleFingerprint(readOdtZip(bytes));}catch{throw new Error(`${group}/${kind}: el archivo no es un ODT válido.`);}
 if(style!==descriptor.styleFingerprint)throw new Error(`${group}/${kind}: huella de estilo no coincide con el activo permitido.`);
 const {endpoint,token}=persistenceConfig();
 const response=await fetch(`${endpoint}/templates/${encodeURIComponent(descriptor.templateId)}`,{method:"PUT",headers:{"x-contrata-ia-persistence-token":token,"content-type":"application/json"},body:JSON.stringify({templateId:descriptor.templateId,kind:descriptor.kind,mediaType:"application/vnd.oasis.opendocument.text",sha256:descriptor.sha256,styleFingerprint:descriptor.styleFingerprint,provenance:{role:descriptor.provenanceRole,family:groupPolicy.family,caseId:groupPolicy.caseId,sourceAuthority:groupPolicy.sourceAuthority,officialModelClaimed:false,neverGeneralModel:groupPolicy.neverGeneralModel,humanValidationRequired:true},byteLength:bytes.byteLength,contentBase64:Buffer.from(bytes).toString("base64")})});
 const text=await response.text();let payload:unknown={raw:text};try{payload=JSON.parse(text);}catch{}
 if(!response.ok)throw new Error(`${group}/${kind}: persistencia rechazó el activo (HTTP ${response.status}).`);
 return{descriptor,payload,byteLength:bytes.byteLength,sha256:descriptor.sha256,styleFingerprint:descriptor.styleFingerprint};
}

/** Readiness fuerte: recupera cada activo mediante el store protegido, que recalcula longitud y SHA de los bytes remotos. */
export async function lb102ProtectedSourceStatus(group:LB102ProtectedSourceGroup){
 const groupPolicy=policy(group);const {endpoint,token}=persistenceConfig();const readiness=await new HttpPersistedTemplateAssetStore(endpoint,token,groupPolicy.assets).readiness();
 return{group,family:groupPolicy.family,caseId:groupPolicy.caseId,ready:readiness.ready,assets:readiness.assets,blockers:readiness.blockers};
}

export function parseLB102ProtectedSourceGroup(value:string):LB102ProtectedSourceGroup|null{return value==="ferreteria"||value==="panda"||value==="service-huelva"||value==="service-sevilla"?value:null;}
export function parseLB102ProtectedSourceKind(value:string):LB102ProtectedSourceKind|null{const normalized=value.toUpperCase();return normalized==="PCAP"||normalized==="MEMORIA"||normalized==="PPT"?normalized:null;}
