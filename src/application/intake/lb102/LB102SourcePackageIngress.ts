import {createHash} from "node:crypto";
import {readOdtZip} from "../lb23/OdtPackageCodec";
import {computeOdtStyleFingerprint} from "../lb23/UniversalOdtProductionRenderer";
import {LB102_PROTECTED_SOURCE_GROUPS,persistLB102ProtectedSource,type LB102ProtectedSourceGroup,type LB102ProtectedSourceKind} from "./LB102ProtectedSourceIngress";

interface PackageAssetSpec{readonly fileName:string;readonly group:LB102ProtectedSourceGroup;readonly kind:LB102ProtectedSourceKind;}
export type LB102SourcePackageProfile="PANDA_HUELVA_SEVILLA_V8"|"FERRETERIA_POST_INTERVENCION_V2";

const CORE_V8_SPECS:readonly PackageAssetSpec[]=[
 {group:"panda",kind:"MEMORIA",fileName:"panda_memoria_v8.odt"},
 {group:"panda",kind:"PCAP",fileName:"panda_pcap_v8.odt"},
 {group:"panda",kind:"PPT",fileName:"panda_ppt_v8.odt"},
 {group:"service-huelva",kind:"MEMORIA",fileName:"huelva_memoria_v8.odt"},
 {group:"service-huelva",kind:"PCAP",fileName:"huelva_pcap_v8.odt"},
 {group:"service-huelva",kind:"PPT",fileName:"huelva_ppt_v8.odt"},
 {group:"service-sevilla",kind:"MEMORIA",fileName:"sevilla_memoria_v8.odt"},
 {group:"service-sevilla",kind:"PCAP",fileName:"sevilla_pcap_v8.odt"},
 {group:"service-sevilla",kind:"PPT",fileName:"sevilla_ppt_v8.odt"},
] as const;
const FERRETERIA_POST_INTERVENCION_SPECS:readonly PackageAssetSpec[]=[
 {group:"ferreteria",kind:"PCAP",fileName:"PCAP_Ferreteria_V8_post_Intervencion.odt"},
 {group:"ferreteria",kind:"MEMORIA",fileName:"Memoria_Ferreteria_V14_post_Intervencion.odt"},
 {group:"ferreteria",kind:"PPT",fileName:"PPT_Ferreteria_V8_post_Intervencion.odt"},
] as const;

export const LB102_SOURCE_PACKAGE_PROFILES:Readonly<Record<LB102SourcePackageProfile,readonly PackageAssetSpec[]>>={
 PANDA_HUELVA_SEVILLA_V8:CORE_V8_SPECS,
 FERRETERIA_POST_INTERVENCION_V2:FERRETERIA_POST_INTERVENCION_SPECS,
} as const;

function sha256(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
function descriptor(group:LB102ProtectedSourceGroup,kind:LB102ProtectedSourceKind){const matches=LB102_PROTECTED_SOURCE_GROUPS[group].assets.filter(asset=>asset.kind===kind);if(matches.length!==1)throw new Error(`${group}/${kind}: allowlist física inválida.`);return matches[0]!;}
function odtNames(entries:ReturnType<typeof readOdtZip>){return entries.filter(entry=>entry.name.toLowerCase().endsWith(".odt")).map(entry=>entry.name).sort();}
function matchesProfile(actual:readonly string[],specs:readonly PackageAssetSpec[]){const expected=specs.map(spec=>spec.fileName).sort();return actual.length===expected.length&&actual.every((name,index)=>name===expected[index]);}
function resolveProfile(entries:ReturnType<typeof readOdtZip>):{profile:LB102SourcePackageProfile;specs:readonly PackageAssetSpec[]}{
 const actual=odtNames(entries);
 for(const [profile,specs] of Object.entries(LB102_SOURCE_PACKAGE_PROFILES) as [LB102SourcePackageProfile,readonly PackageAssetSpec[]][]){if(matchesProfile(actual,specs))return{profile,specs};}
 const known=new Set(Object.values(LB102_SOURCE_PACKAGE_PROFILES).flat().map(spec=>spec.fileName));const unknown=actual.filter(name=>!known.has(name));
 if(unknown.length)throw new Error(`Paquete LB102 contiene ODT no reconocidos: ${unknown.join(", ")}.`);
 const ferreteriaPresent=actual.some(name=>FERRETERIA_POST_INTERVENCION_SPECS.some(spec=>spec.fileName===name));
 if(ferreteriaPresent)throw new Error("Paquete Ferretería incompleto: se exige la tríada conjunta PCAP + Memoria + PPT post-Intervención.");
 throw new Error("Paquete LB102 incompleto o mezcla perfiles incompatibles; use el ZIP V8 Panda/Huelva/Sevilla o la tríada Ferretería post-Intervención.");
}

/**
 * Ingreso binario de fuentes físicas LB102 por perfiles cerrados. Cada ZIP se
 * valida completamente contra allowlist + SHA-256 + huella de estilo antes de
 * persistir el primer ODT. Ferretería solo se admite como tríada post-Intervención.
 */
export async function persistLB102ProtectedSourcePackage(zipBytes:Uint8Array){
 const entries=readOdtZip(zipBytes);const {profile,specs}=resolveProfile(entries);
 const selected=specs.map(spec=>{const entry=entries.find(item=>item.name===spec.fileName);if(!entry)throw new Error(`${profile}: falta ${spec.fileName}.`);return{spec,bytes:entry.bytes};});
 const seen=new Set<string>();for(const item of selected){const key=`${item.spec.group}/${item.spec.kind}`;if(seen.has(key))throw new Error(`Activo duplicado en paquete: ${key}.`);seen.add(key);const allowed=descriptor(item.spec.group,item.spec.kind);if(sha256(item.bytes)!==allowed.sha256)throw new Error(`${key}: SHA-256 no coincide con la allowlist.`);const style=computeOdtStyleFingerprint(readOdtZip(item.bytes));if(style!==allowed.styleFingerprint)throw new Error(`${key}: huella de estilo no coincide con la allowlist.`);}
 const saved=[];for(const item of selected){const result=await persistLB102ProtectedSource(item.spec.group,item.spec.kind,item.bytes);saved.push({group:item.spec.group,kind:item.spec.kind,templateId:result.descriptor.templateId,byteLength:result.byteLength,sha256:result.sha256,styleFingerprint:result.styleFingerprint});}
 return{profile,saved,groups:[...new Set(selected.map(item=>item.spec.group))],ferreteriaIncluded:profile==="FERRETERIA_POST_INTERVENCION_V2",atomicValidationBeforePersistence:true,productionReady:false as const,humanValidationRequired:true as const};
}
