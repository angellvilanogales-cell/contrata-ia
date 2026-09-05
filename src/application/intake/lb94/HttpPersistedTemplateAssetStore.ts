import { createHash } from "node:crypto";
import type { UniversalEditableTemplateBinarySource, UniversalEditableTemplateBinaryStore } from "../lb23/UniversalOdtProductionRenderer";
import { SUPPLY_GENERAL_DERIVED_ASSET_MANIFEST } from "./SupplyGeneralDerivedAssetManifest";

export interface PersistedTemplateAssetDescriptor {
  kind: "PCAP" | "MEMORIA" | "PPT" | "VIABILITY";
  templateId: string;
  sourceId: string;
  sha256: string;
  styleFingerprint: string;
  provenanceRole:
    | "OFFICIAL_MODEL"
    | "VALIDATED_REAL_CASE_SOURCE"
    | "VALIDATED_REAL_CASE_REGRESSION_SOURCE"
    | "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE"
    | "CONTRATA_IA_DERIVED_MIXED_SPECIALIZED_TEMPLATE"
    | "CONTRATA_IA_DERIVED_STRICT_PILOT_TEMPLATE"
    | "CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE"
    | "CONTRATA_IA_DERIVED_PROCEDURE_TEMPLATE"
    | "CONTRATA_IA_DERIVED_SUBFAMILY_TEMPLATE";
}

export const LB94_SUPPLY_GENERAL_RUNTIME_ASSETS: readonly PersistedTemplateAssetDescriptor[] = [
  {kind:"PCAP",templateId:"JDA-PCAP-SUPPLY-ASA-AUTOFINANCED-2025-12-17",sourceId:"jda:cccp:pcap:supply:asa:autofinanced:2025-12-17:odt",sha256:"45e1e6b16ec41d77206d3ef385c70f87c9120bb0ccce4e43d9a24d245812cadc",styleFingerprint:"sha256:9eb23463f4d56abd03531cb909206ef47d749054bf284087bd45867b39e6ceee",provenanceRole:"OFFICIAL_MODEL"},
  ...SUPPLY_GENERAL_DERIVED_ASSET_MANIFEST.map(item=>({kind:item.kind,templateId:item.templateId,sourceId:item.templateId,sha256:item.sha256,styleFingerprint:item.styleFingerprint,provenanceRole:item.provenanceRole})),
] as const;
interface RemoteTemplatePayload{templateId?:unknown;kind?:unknown;mediaType?:unknown;sha256?:unknown;styleFingerprint?:unknown;provenance?:unknown;contentBase64?:unknown;byteLength?:unknown;}
function sha256(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
function normalizeEndpoint(value:string){const endpoint=value.trim().replace(/\/+$/,"");if(!endpoint.startsWith("https://"))throw new Error("El almacén remoto de plantillas exige HTTPS.");return endpoint;}
function decodeBase64(value:string){if(!/^[A-Za-z0-9+/]*={0,2}$/.test(value)||value.length%4!==0)throw new Error("El activo remoto contiene base64 inválido.");return Buffer.from(value,"base64");}
function provenanceRole(value:unknown):string|null{if(!value||typeof value!=="object"||Array.isArray(value))return null;const role=(value as Record<string,unknown>).role;return typeof role==="string"?role:null;}
function transientStatus(status:number){return status===500||status===502||status===503||status===504;}
function wait(milliseconds:number){return new Promise(resolve=>setTimeout(resolve,milliseconds));}

/** Store físico universal: identidad, naturaleza, estilo, procedencia, tamaño y SHA se contrastan antes de exponer bytes. */
export class HttpPersistedTemplateAssetStore implements UniversalEditableTemplateBinaryStore{
  private readonly endpoint:string;
  public constructor(endpoint:string,private readonly token:string,private readonly manifest:readonly PersistedTemplateAssetDescriptor[]=LB94_SUPPLY_GENERAL_RUNTIME_ASSETS){this.endpoint=normalizeEndpoint(endpoint);if(!token.trim())throw new Error("Falta token del almacén remoto de plantillas.");}
  private async fetchTemplate(templateId:string):Promise<Response>{
    const url=`${this.endpoint}/templates/${encodeURIComponent(templateId)}`;
    let last:Response|null=null;
    for(let attempt=0;attempt<3;attempt+=1){
      try{
        const response=await fetch(url,{method:"GET",headers:{"x-contrata-ia-persistence-token":this.token,accept:"application/json"}});
        last=response;
        if(!transientStatus(response.status)||attempt===2)return response;
      }catch(error){
        if(attempt===2)throw error;
      }
      await wait(75*(attempt+1));
    }
    if(!last)throw new Error("No se puede contactar con la persistencia remota de plantillas.");
    return last;
  }
  public async get(templateId:string):Promise<UniversalEditableTemplateBinarySource|null>{const descriptor=this.manifest.find(item=>item.templateId===templateId);if(!descriptor)return null;const response=await this.fetchTemplate(templateId);if(response.status===404)return null;if(!response.ok)throw new Error(`No se puede recuperar ${descriptor.kind} desde persistencia: HTTP ${response.status}.`);const payload=await response.json() as RemoteTemplatePayload;if(payload.templateId!==descriptor.templateId)throw new Error(`Identidad remota incorrecta para ${descriptor.kind}.`);if(payload.kind!==descriptor.kind)throw new Error(`Naturaleza remota incorrecta para ${descriptor.templateId}.`);if(payload.mediaType!=="application/vnd.oasis.opendocument.text")throw new Error(`Media type remoto inválido para ${descriptor.templateId}.`);if(payload.sha256!==descriptor.sha256)throw new Error(`SHA declarado remoto no coincide para ${descriptor.templateId}.`);if(payload.styleFingerprint!==descriptor.styleFingerprint)throw new Error(`Huella de estilo remota no coincide para ${descriptor.templateId}.`);if(provenanceRole(payload.provenance)!==descriptor.provenanceRole)throw new Error(`Procedencia remota no coincide para ${descriptor.templateId}.`);if(typeof payload.contentBase64!=="string")throw new Error(`Faltan bytes persistidos para ${descriptor.templateId}.`);const bytes=decodeBase64(payload.contentBase64);if(typeof payload.byteLength!=="number"||payload.byteLength!==bytes.byteLength)throw new Error(`Longitud remota no coincide para ${descriptor.templateId}.`);if(sha256(bytes)!==descriptor.sha256)throw new Error(`SHA calculado de los bytes remotos no coincide para ${descriptor.templateId}.`);return{templateId:descriptor.templateId,sourceId:descriptor.sourceId,bytes};}
  public async readiness(){const assets:Array<{templateId:string;kind:string;available:boolean;error?:string}>=[];for(const descriptor of this.manifest){try{const source=await this.get(descriptor.templateId);assets.push({templateId:descriptor.templateId,kind:descriptor.kind,available:Boolean(source),...(source?{}:{error:"Activo no encontrado."})});}catch(error){assets.push({templateId:descriptor.templateId,kind:descriptor.kind,available:false,error:error instanceof Error?error.message:String(error)});}}const blockers=assets.filter(item=>!item.available).map(item=>`${item.kind}: ${item.error??"no disponible"}`);return{ready:blockers.length===0,assets,blockers} as const;}
}
export function createHttpPersistedTemplateAssetStoreFromEnv():HttpPersistedTemplateAssetStore|null{const endpoint=process.env.CONTRATA_IA_PERSISTENCE_URL?.trim();const token=process.env.CONTRATA_IA_PERSISTENCE_TOKEN?.trim();if(!endpoint||!token)return null;return new HttpPersistedTemplateAssetStore(endpoint,token);}
