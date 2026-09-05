import { createHash } from "node:crypto";
import { readOdtZip, writeOdtZip, type OdtZipEntry } from "../lb23/OdtPackageCodec";
import { computeOdtStyleFingerprint } from "../lb23/UniversalOdtProductionRenderer";
import type { ConcessionGeneralTemplateManifestRecord } from "./ConcessionGeneralTemplateManifest";
import { evaluateConcessionGeneralTemplateBytes } from "./ConcessionGeneralTemplatePhysicalGate";

export interface ConcessionRenderedDocument {
  kind:"PCAP"|"MEMORY"|"PPT"|"VIABILITY"; templateId:string; bytes:Uint8Array; sha256:string; styleFingerprint:string; appliedSlots:readonly string[]; humanValidationRequired:true;
}
function entry(entries:readonly OdtZipEntry[],name:string){const found=entries.find(x=>x.name===name);if(!found)throw new Error(`ODT inválido: falta ${name}.`);return found;}
function escapeXml(value:string){return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&apos;");}
function hash(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}

/** Renderer puro: no clasifica la concesión ni decide riesgo/viabilidad. */
export function renderConcessionGeneralTemplate(input:{manifest:ConcessionGeneralTemplateManifestRecord;templateBytes:Uint8Array;values:Readonly<Record<string,string|number|boolean>>}):ConcessionRenderedDocument{
  const gate=evaluateConcessionGeneralTemplateBytes(input.manifest,input.templateBytes);if(!gate.ready)throw new Error(`Gate físico Concession rechazado: ${gate.blockers.join(" | ")}`);
  let entries=readOdtZip(input.templateBytes);let content=Buffer.from(entry(entries,"content.xml").bytes).toString("utf8");const applied:string[]=[];
  for(const slot of input.manifest.slots){if(!(slot in input.values))throw new Error(`Falta valor validado para el slot Concession ${slot}.`);const token=`{{${slot}}}`;if(content.split(token).length-1!==1)throw new Error(`El slot Concession ${slot} no tiene anclaje único.`);const v=input.values[slot];content=content.replace(token,escapeXml(typeof v==="boolean"?(v?"Sí":"No"):String(v)));applied.push(slot);}
  if(/\{\{[A-Za-z0-9.]+\}\}/.test(content))throw new Error("El render Concession deja slots pendientes.");
  entries=entries.map(x=>x.name==="content.xml"?{...x,bytes:Buffer.from(content,"utf8")}:x);const style=computeOdtStyleFingerprint(entries);if(style!==input.manifest.expectedStyleFingerprint)throw new Error("El render Concession alteró la huella de estilo.");const bytes=writeOdtZip(entries);
  return{kind:input.manifest.kind,templateId:input.manifest.templateId,bytes,sha256:hash(bytes),styleFingerprint:style,appliedSlots:applied,humanValidationRequired:true};
}
