import {generateStrictServicePilotPackage} from "../../intake/lb102/StrictServicePilotPackageGenerator";
import {createLB102PandaTemplateStoreFromEnv,createLB102ServiceTemplateStoreFromEnv} from "../../intake/lb102/LB102PersistedPilotTemplateStores";
import {generateSupplyAsoUserDocumentPackage} from "../../intake/lb102/SupplyAsoUserDocumentPackageGenerator";
import {createHttpPersistedTemplateAssetStoreFromEnv} from "../../intake/lb94/HttpPersistedTemplateAssetStore";
import {generateFerreteriaPilotPackage} from "./FerreteriaPilotPackageGenerator";
import {LB102_SUPPLY_PANDA} from "./RealSupplyPilotSnapshots";
import {LB102_SERVICE_5G,LB102_SERVICE_HUELVA} from "./RealServicePilotSnapshots";

export type LB102PilotPackageId="supply-ferreteria"|"supply-panda"|"service-huelva"|"service-5g";
export interface LB102PilotPackageDescriptor{id:LB102PilotPackageId;caseId:string;family:"SUPPLY"|"SERVICE";label:string;profile:string;}
export const LB102_PILOT_PACKAGE_CATALOG:readonly LB102PilotPackageDescriptor[]=[
 {id:"supply-ferreteria",caseId:"CONTR/2026/240267",family:"SUPPLY",label:"Ferretería SAE · ASA · DA 33.ª",profile:"FERRETERIA_SUPPLY_ASA_DA33_LB102_PROTECTED"},
 {id:"supply-panda",caseId:"CONTR 2025 466864",family:"SUPPLY",label:"Panda / licencias software · ASO",profile:"SUPPLY_ASO_SOFTWARE_AUTOFINANCED_LB102"},
 {id:"service-huelva",caseId:"CONTR 2025 0000468715",family:"SERVICE",label:"Limpieza SAE Huelva",profile:"SERVICE_STRICT_PILOT_LB102"},
 {id:"service-5g",caseId:"CONTR/2023/957915",family:"SERVICE",label:"Formación profesional tecnologías 5G",profile:"SERVICE_STRICT_PILOT_LB102"},
] as const;
export function pilotPackageDescriptor(id:string){return LB102_PILOT_PACKAGE_CATALOG.find(x=>x.id===id)??null;}
export interface GeneratedLB102PilotPackage{ready:boolean;descriptor:LB102PilotPackageDescriptor;fileName:string|null;bytes:Uint8Array|null;sha256:string|null;blockers:readonly string[];}
export async function generateLB102PilotPackage(id:LB102PilotPackageId):Promise<GeneratedLB102PilotPackage>{
 const descriptor=pilotPackageDescriptor(id);if(!descriptor)throw new Error("Paquete piloto desconocido.");
 try{
  if(id==="supply-ferreteria"){
   const store=createHttpPersistedTemplateAssetStoreFromEnv();if(!store)throw new Error("Persistencia de plantillas Supply no configurada.");
   const out=await generateFerreteriaPilotPackage(store);return{ready:out.ready,descriptor,fileName:out.fileName,bytes:out.bytes,sha256:out.sha256,blockers:out.blockers};
  }
  if(id==="supply-panda"){
   const store=createLB102PandaTemplateStoreFromEnv();if(!store)throw new Error("Persistencia de plantillas Panda no configurada.");
   const out=await generateSupplyAsoUserDocumentPackage({record:LB102_SUPPLY_PANDA,templateStore:store});return{ready:out.ready,descriptor,fileName:out.fileName,bytes:out.bytes,sha256:out.sha256,blockers:out.blockers};
  }
  const store=createLB102ServiceTemplateStoreFromEnv();if(!store)throw new Error("Persistencia de plantillas Service piloto no configurada.");
  const snapshot=id==="service-huelva"?LB102_SERVICE_HUELVA:LB102_SERVICE_5G;const out=await generateStrictServicePilotPackage({snapshot,templateStore:store});
  return{ready:out.ready,descriptor,fileName:out.fileName,bytes:out.bytes,sha256:out.sha256,blockers:out.blockers};
 }catch(error){return{ready:false,descriptor,fileName:null,bytes:null,sha256:null,blockers:[error instanceof Error?error.message:String(error)]};}
}
