import {createHash} from "node:crypto";
import {readOdtZip,writeOdtZip} from "../lb23/OdtPackageCodec";
import {computeOdtStyleFingerprint,type UniversalEditableTemplateBinaryStore} from "../lb23/UniversalOdtProductionRenderer";

export const SUPPLY_ASO_DERIVED_PCAP={
 templateId:"contrata-ia:supply:pcap:aso:autofinanced:LB102-V1",
 sha256:"7559603d593b3845f27dbff17b7ba8d1150c2cf2844205c1999ceed69dbeaa90",
 styleFingerprint:"sha256:049071c575580cb7080b5f9c530523e2c3160bec87902205592c36225cc67064",
 sourceAuthority:"JDA_RECOMMENDED_SUPPLY_ASO_AUTOFINANCED_2025_12_PLUS_REG_SUPPLY_002",
 officialModel:false as const,
 slots:["caseId","title","object","cpvMain","lotsSummary","economicSummary","durationSummary","solvencySummary","procedureSummary","awardCriteriaSummary","specialExecutionConditions","deliveryLocation","da33Summary","priceSummary"] as const,
};
export type SupplyAsoPcapSlot=typeof SUPPLY_ASO_DERIVED_PCAP.slots[number];
function hash(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
function esc(x:string){return x.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&apos;");}

/** Render puro del perfil ASO derivado. No completa ni decide campos jurídicos. */
export async function renderSupplyAsoDerivedPcap(input:{templateStore:UniversalEditableTemplateBinaryStore;values:Readonly<Record<SupplyAsoPcapSlot,string>>;caseId:string}){
 const source=await input.templateStore.get(SUPPLY_ASO_DERIVED_PCAP.templateId);if(!source)throw new Error("No se encuentra el PCAP Supply ASO derivado persistido.");
 if(hash(source.bytes)!==SUPPLY_ASO_DERIVED_PCAP.sha256)throw new Error("SHA del PCAP Supply ASO derivado no coincide.");
 let entries=readOdtZip(source.bytes);const mime=entries.find(x=>x.name==="mimetype");const contentEntry=entries.find(x=>x.name==="content.xml");
 if(!mime||Buffer.from(mime.bytes).toString("utf8").trim()!=="application/vnd.oasis.opendocument.text"||!contentEntry)throw new Error("Activo Supply ASO no es ODT válido.");
 if(computeOdtStyleFingerprint(entries)!==SUPPLY_ASO_DERIVED_PCAP.styleFingerprint)throw new Error("Huella de estilo Supply ASO no coincide.");
 let content=Buffer.from(contentEntry.bytes).toString("utf8");
 for(const slot of SUPPLY_ASO_DERIVED_PCAP.slots){const token=`{{${slot}}}`;if(content.split(token).length-1!==1)throw new Error(`Slot ASO ${slot} no tiene anclaje único.`);const value=input.values[slot];if(!value?.trim())throw new Error(`Falta valor validado para ${slot}.`);content=content.replace(token,esc(value));}
 if(/\{\{[^}]+\}\}/.test(content))throw new Error("PCAP Supply ASO deja placeholders sin resolver.");
 entries=entries.map(x=>x.name==="content.xml"?{...x,bytes:Buffer.from(content,"utf8")}:x);
 if(computeOdtStyleFingerprint(entries)!==SUPPLY_ASO_DERIVED_PCAP.styleFingerprint)throw new Error("El render ASO alteró la huella de estilo.");
 const bytes=writeOdtZip(entries);return{bytes,sha256:hash(bytes),fileName:`PCAP_${input.caseId.replaceAll("/","-")}_Supply_ASO.odt`,officialModel:false as const,humanValidationRequired:true as const};
}
