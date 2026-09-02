import {createHash} from "node:crypto";
import {readOdtZip} from "../lb23/OdtPackageCodec";
import {computeOdtStyleFingerprint} from "../lb23/UniversalOdtProductionRenderer";
import {LB102_PROTECTED_SOURCE_GROUPS,persistLB102ProtectedSource,type LB102ProtectedSourceGroup,type LB102ProtectedSourceKind} from "./LB102ProtectedSourceIngress";

interface PackageAssetSpec{readonly fileNames:readonly string[];readonly group:LB102ProtectedSourceGroup;readonly kind:LB102ProtectedSourceKind;readonly optional?:boolean;}
const SPECS:readonly PackageAssetSpec[]=[
 {group:"panda",kind:"MEMORIA",fileNames:["panda_memoria_v8.odt"]},
 {group:"panda",kind:"PCAP",fileNames:["panda_pcap_v8.odt"]},
 {group:"panda",kind:"PPT",fileNames:["panda_ppt_v8.odt"]},
 {group:"service-huelva",kind:"MEMORIA",fileNames:["huelva_memoria_v8.odt"]},
 {group:"service-huelva",kind:"PCAP",fileNames:["huelva_pcap_v8.odt"]},
 {group:"service-huelva",kind:"PPT",fileNames:["huelva_ppt_v8.odt"]},
 {group:"service-sevilla",kind:"MEMORIA",fileNames:["sevilla_memoria_v8.odt"]},
 {group:"service-sevilla",kind:"PCAP",fileNames:["sevilla_pcap_v8.odt"]},
 {group:"service-sevilla",kind:"PPT",fileNames:["sevilla_ppt_v8.odt"]},
 {group:"ferreteria",kind:"MEMORIA",optional:true,fileNames:["04_Memoría Ferretería SSCC SAE V12_letrado.odt","04_Memoría Ferretería SSCC SAE V12_letrado(1).odt"]},
 {group:"ferreteria",kind:"PPT",optional:true,fileNames:["PPT Feretería SSCC SAE V6.odt","PPT Feretería SSCC SAE V6(2).odt"]},
] as const;

function sha256(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
function descriptor(group:LB102ProtectedSourceGroup,kind:LB102ProtectedSourceKind){const matches=LB102_PROTECTED_SOURCE_GROUPS[group].assets.filter(asset=>asset.kind===kind);if(matches.length!==1)throw new Error(`${group}/${kind}: allowlist física inválida.`);return matches[0]!;}
function locate(entries:ReturnType<typeof readOdtZip>,spec:PackageAssetSpec){for(const name of spec.fileNames){const entry=entries.find(item=>item.name===name);if(entry)return entry;}return null;}

/**
 * Ingreso de un ZIP binario de fuentes físicas LB102. Valida todos los ODT del
 * paquete contra la allowlist antes de persistir el primero. No convierte casos
 * reales en modelos generales y no acredita UAT por sí solo.
 */
export async function persistLB102ProtectedSourcePackage(zipBytes:Uint8Array){
 const entries=readOdtZip(zipBytes);const selected:readonly {spec:PackageAssetSpec;bytes:Uint8Array}[]=SPECS.flatMap(spec=>{const entry=locate(entries,spec);if(!entry){if(spec.optional)return[];throw new Error(`Paquete LB102 incompleto: falta ${spec.group}/${spec.kind}.`);}return[{spec,bytes:entry.bytes}];});
 const odtEntries=entries.filter(entry=>entry.name.toLowerCase().endsWith(".odt"));if(odtEntries.length!==selected.length)throw new Error("El paquete contiene ODT no reconocidos por la allowlist LB102.");
 const seen=new Set<string>();for(const item of selected){const key=`${item.spec.group}/${item.spec.kind}`;if(seen.has(key))throw new Error(`Activo duplicado en paquete: ${key}.`);seen.add(key);const allowed=descriptor(item.spec.group,item.spec.kind);if(sha256(item.bytes)!==allowed.sha256)throw new Error(`${key}: SHA-256 no coincide con la allowlist.`);const style=computeOdtStyleFingerprint(readOdtZip(item.bytes));if(style!==allowed.styleFingerprint)throw new Error(`${key}: huella de estilo no coincide con la allowlist.`);}
 const saved=[];for(const item of selected){const result=await persistLB102ProtectedSource(item.spec.group,item.spec.kind,item.bytes);saved.push({group:item.spec.group,kind:item.spec.kind,templateId:result.descriptor.templateId,byteLength:result.byteLength,sha256:result.sha256,styleFingerprint:result.styleFingerprint});}
 return{saved,requiredGroups:["panda","service-huelva","service-sevilla"] as const,ferreteriaIncluded:selected.some(item=>item.spec.group==="ferreteria"),productionReady:false as const,humanValidationRequired:true as const};
}
