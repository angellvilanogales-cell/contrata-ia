import {createHash} from "node:crypto";
import {readOdtZip,writeOdtZip} from "../lb23/OdtPackageCodec";
import {computeOdtStyleFingerprint,type UniversalEditableTemplateBinaryStore} from "../lb23/UniversalOdtProductionRenderer";

const STYLE="sha256:049071c575580cb7080b5f9c530523e2c3160bec87902205592c36225cc67064";
export const SUPPLY_ASO_SOFTWARE_TEMPLATES={
 MEMORY:{templateId:"contrata-ia:supply:memory:aso:software:LB102-V1",sha256:"c69f3a25bf8051e3ac60898b3f4efb2f4e299ad46a0a5566da88027669efb05c",styleFingerprint:STYLE,slots:["caseId","need","object","cpvMain","lotsSummary","economicSummary","durationSummary","procedureSummary","solvencySummary","awardCriteriaSummary","executionSummary"] as const},
 PPT:{templateId:"contrata-ia:supply:ppt:aso:software:LB102-V1",sha256:"bd9e7c31f6705ba23815b127e09185eefb6dc4685990daaa32a1407c16b15264",styleFingerprint:STYLE,slots:["caseId","object","cpvMain","durationSummary","deliveryLocation","technicalRequirements","licenseRequirements","supportRequirements","receiptSummary","specialExecutionConditions"] as const},
} as const;
export type SupplyAsoSoftwareKind=keyof typeof SUPPLY_ASO_SOFTWARE_TEMPLATES;
function hash(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
function esc(x:string){return x.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&apos;");}
export async function renderSupplyAsoSoftwareTemplate(input:{kind:SupplyAsoSoftwareKind;templateStore:UniversalEditableTemplateBinaryStore;caseId:string;values:Readonly<Record<string,string>>}){
 const manifest=SUPPLY_ASO_SOFTWARE_TEMPLATES[input.kind];const source=await input.templateStore.get(manifest.templateId);if(!source)throw new Error(`No se encuentra ${input.kind} Supply ASO software persistido.`);
 if(hash(source.bytes)!==manifest.sha256)throw new Error(`SHA de ${input.kind} Supply ASO software no coincide.`);
 let entries=readOdtZip(source.bytes);const mime=entries.find(x=>x.name==="mimetype"),contentEntry=entries.find(x=>x.name==="content.xml");
 if(!mime||Buffer.from(mime.bytes).toString("utf8").trim()!=="application/vnd.oasis.opendocument.text"||!contentEntry)throw new Error(`${input.kind} Supply ASO software no es ODT válido.`);
 if(computeOdtStyleFingerprint(entries)!==manifest.styleFingerprint)throw new Error(`Huella de estilo ${input.kind} Supply ASO software no coincide.`);
 let content=Buffer.from(contentEntry.bytes).toString("utf8");for(const slot of manifest.slots){const token=`{{${slot}}}`;if(content.split(token).length-1!==1)throw new Error(`Slot ${input.kind}.${slot} no tiene anclaje único.`);const value=input.values[slot];if(!value?.trim())throw new Error(`Falta valor validado para ${input.kind}.${slot}.`);content=content.replace(token,esc(value));}
 if(/\{\{[^}]+\}\}/.test(content))throw new Error(`${input.kind} Supply ASO software deja placeholders.`);
 entries=entries.map(x=>x.name==="content.xml"?{...x,bytes:Buffer.from(content,"utf8")}:x);if(computeOdtStyleFingerprint(entries)!==manifest.styleFingerprint)throw new Error(`El render ${input.kind} alteró la huella de estilo.`);
 const bytes=writeOdtZip(entries);return{kind:input.kind,bytes,sha256:hash(bytes),fileName:`${input.kind}_${input.caseId.replaceAll("/","-")}_Supply_ASO_Software.odt`,officialModel:false as const,humanValidationRequired:true as const};
}
