import { createHash } from "node:crypto";
import { readOdtZip, writeOdtZip, type OdtZipEntry } from "../lb23/OdtPackageCodec";
import { computeOdtStyleFingerprint } from "../lb23/UniversalOdtProductionRenderer";
import type { WorksGeneralTemplateManifestRecord } from "./WorksGeneralTemplateManifest";
import { evaluateWorksGeneralTemplateBytes } from "./WorksGeneralTemplatePhysicalGate";

export interface WorksRenderedDocument {
  kind: "PCAP" | "MEMORY" | "PPT";
  templateId: string;
  bytes: Uint8Array;
  sha256: string;
  styleFingerprint: string;
  appliedSlots: readonly string[];
  humanValidationRequired: true;
}
function entry(entries:readonly OdtZipEntry[],name:string){const found=entries.find(x=>x.name===name);if(!found)throw new Error(`ODT inválido: falta ${name}.`);return found;}
function escapeXml(value:string){return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&apos;");}
function hash(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}

/** Renderer puro: no deduce ni completa decisiones. Exige valor explícito para cada slot físico. */
export function renderWorksGeneralTemplate(input:{manifest:WorksGeneralTemplateManifestRecord;templateBytes:Uint8Array;values:Readonly<Record<string,string|number|boolean>>}):WorksRenderedDocument{
  const gate=evaluateWorksGeneralTemplateBytes(input.manifest,input.templateBytes);
  if(!gate.ready)throw new Error(`Gate físico Works rechazado: ${gate.blockers.join(" | ")}`);
  let entries=readOdtZip(input.templateBytes);let content=Buffer.from(entry(entries,"content.xml").bytes).toString("utf8");const applied:string[]=[];
  for(const slot of input.manifest.slots){
    if(!(slot in input.values))throw new Error(`Falta valor validado para el slot Works ${slot}.`);
    const value=input.values[slot];const token=`{{${slot}}}`;const count=content.split(token).length-1;if(count!==1)throw new Error(`El slot Works ${slot} no tiene anclaje único.`);
    content=content.replace(token,escapeXml(typeof value==="boolean"?(value?"Sí":"No"):String(value)));applied.push(slot);
  }
  if(/\{\{[A-Za-z0-9.]+\}\}/.test(content))throw new Error("El render Works deja slots pendientes.");
  entries=entries.map(x=>x.name==="content.xml"?{...x,bytes:Buffer.from(content,"utf8")}:x);
  const style=computeOdtStyleFingerprint(entries);if(style!==input.manifest.expectedStyleFingerprint)throw new Error("El render Works alteró la huella de estilo.");
  const bytes=writeOdtZip(entries);
  return{kind:input.manifest.kind,templateId:input.manifest.templateId,bytes,sha256:hash(bytes),styleFingerprint:style,appliedSlots:applied,humanValidationRequired:true};
}
