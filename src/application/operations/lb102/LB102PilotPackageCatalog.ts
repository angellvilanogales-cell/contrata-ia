import {createLB102FerreteriaTemplateStoreFromEnv,createLB102PandaTemplateStoreFromEnv,createLB102ServiceSourceBackedTemplateStoreFromEnv} from "../../intake/lb102/LB102PersistedPilotTemplateStores";
import {generatePandaSourceBackedPilotPackage} from "../../intake/lb102/PandaSourceBackedPilotPackageGenerator";
import {generateServiceSourceBackedPilotPackage} from "../../intake/lb102/ServiceSourceBackedPilotPackageGenerator";
import {generateFerreteriaPilotPackage} from "./FerreteriaPilotPackageGenerator";
import {LB102_SUPPLY_PANDA} from "./RealSupplyPilotSnapshots";
import {LB102_SERVICE_HUELVA} from "./RealServicePilotSnapshots";
import {LB102_SERVICE_SEVILLA} from "./RealServicePilotSnapshotSevilla";

export type LB102PilotPackageId="supply-ferreteria"|"supply-panda"|"service-huelva"|"service-sevilla";
export interface LB102PilotPackageDescriptor{id:LB102PilotPackageId;caseId:string;family:"SUPPLY"|"SERVICE";label:string;profile:string;atomicDocumentSet:readonly ["PCAP","MEMORIA","PPT"];}
const ATOMIC=["PCAP","MEMORIA","PPT"] as const;
export const LB102_PILOT_PACKAGE_CATALOG:readonly LB102PilotPackageDescriptor[]=[
 {id:"supply-ferreteria",caseId:"CONTR/2026/240267",family:"SUPPLY",label:"Ferretería SAE · ASA · post-Intervención",profile:"FERRETERIA_SUPPLY_ASA_LB102_POST_INTERVENCION_V2",atomicDocumentSet:ATOMIC},
 {id:"supply-panda",caseId:"CONTR 2025 466864",family:"SUPPLY",label:"Panda / licencias software · ASO",profile:"PANDA_SOURCE_BACKED_REGRESSION_LB102_V8",atomicDocumentSet:ATOMIC},
 {id:"service-huelva",caseId:"CONTR 2025 0000468715",family:"SERVICE",label:"Limpieza SAE Huelva",profile:"SERVICE_HUELVA_SOURCE_BACKED_REGRESSION_LB102_V8",atomicDocumentSet:ATOMIC},
 {id:"service-sevilla",caseId:"CONTR 2026 38892",family:"SERVICE",label:"Mantenimiento integral SAE Sevilla",profile:"SERVICE_SEVILLA_SOURCE_BACKED_REGRESSION_LB102_V8",atomicDocumentSet:ATOMIC},
] as const;
export function pilotPackageDescriptor(id:string){return LB102_PILOT_PACKAGE_CATALOG.find(x=>x.id===id)??null;}
export interface GeneratedLB102PilotPackage{ready:boolean;descriptor:LB102PilotPackageDescriptor;fileName:string|null;bytes:Uint8Array|null;sha256:string|null;blockers:readonly string[];}
export async function generateLB102PilotPackage(id:LB102PilotPackageId):Promise<GeneratedLB102PilotPackage>{
 const descriptor=pilotPackageDescriptor(id);if(!descriptor)throw new Error("Paquete piloto desconocido.");
 try{
  if(id==="supply-ferreteria"){const store=createLB102FerreteriaTemplateStoreFromEnv();if(!store)throw new Error("Persistencia protegida Ferretería no configurada.");const out=await generateFerreteriaPilotPackage(store);return{ready:out.ready,descriptor,fileName:out.fileName,bytes:out.bytes,sha256:out.sha256,blockers:out.blockers};}
  if(id==="supply-panda"){const store=createLB102PandaTemplateStoreFromEnv();if(!store)throw new Error("Persistencia Panda source-backed V8 no configurada.");const out=await generatePandaSourceBackedPilotPackage({record:LB102_SUPPLY_PANDA,templateStore:store});return{ready:out.ready,descriptor,fileName:out.fileName,bytes:out.bytes,sha256:out.sha256,blockers:out.blockers};}
  const store=createLB102ServiceSourceBackedTemplateStoreFromEnv();if(!store)throw new Error("Persistencia Service source-backed V8 Huelva/Sevilla no configurada.");const snapshot=id==="service-huelva"?LB102_SERVICE_HUELVA:LB102_SERVICE_SEVILLA;const out=await generateServiceSourceBackedPilotPackage({snapshot,templateStore:store});return{ready:out.ready,descriptor,fileName:out.fileName,bytes:out.bytes,sha256:out.sha256,blockers:out.blockers};
 }catch(error){return{ready:false,descriptor,fileName:null,bytes:null,sha256:null,blockers:[error instanceof Error?error.message:String(error)]};}
}
