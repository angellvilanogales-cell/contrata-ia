import {createHash} from "node:crypto";
import type {UniversalEditableTemplateBinarySource,UniversalEditableTemplateBinaryStore} from "../lb23/UniversalOdtProductionRenderer";
import {computeOdtStyleFingerprint} from "../lb23/UniversalOdtProductionRenderer";
import {readOdtZip} from "../lb23/OdtPackageCodec";
import type {PersistedTemplateAssetDescriptor} from "../lb94/HttpPersistedTemplateAssetStore";

function sha256(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}

/**
 * Fallback de transición para el modelo oficial Panda ASO. Primero intenta la
 * persistencia protegida. Si el activo oficial todavía no ha sido ingresado,
 * recupera exclusivamente la URL oficial fijada, exige SHA-256 y huella de
 * estilo exactos y sólo entonces expone los bytes al renderer.
 *
 * No admite URLs configurables ni degradación a modelos de expedientes reales.
 */
export class PandaOfficialAsoRemoteFallbackStore implements UniversalEditableTemplateBinaryStore{
 public constructor(
  private readonly persisted:UniversalEditableTemplateBinaryStore,
  private readonly official:PersistedTemplateAssetDescriptor,
  private readonly officialUrl:string,
 ){}
 public async get(templateId:string):Promise<UniversalEditableTemplateBinarySource|null>{
  const persisted=await this.persisted.get(templateId);
  if(persisted)return persisted;
  if(templateId!==this.official.templateId)return null;
  let response:Response;
  try{response=await fetch(this.officialUrl,{method:"GET",headers:{accept:"application/vnd.oasis.opendocument.text"}});}catch(error){throw new Error(`No se puede recuperar temporalmente el PCAP oficial ASO desde la Junta: ${error instanceof Error?error.message:String(error)}`);}
  if(!response.ok)throw new Error(`La Junta no entrega el PCAP oficial ASO: HTTP ${response.status}.`);
  const bytes=new Uint8Array(await response.arrayBuffer());
  if(sha256(bytes)!==this.official.sha256)throw new Error("El PCAP oficial ASO remoto no coincide con el SHA-256 acreditado; generación bloqueada.");
  let style:string;try{style=computeOdtStyleFingerprint(readOdtZip(bytes));}catch{throw new Error("El recurso oficial ASO remoto no es un ODT válido.");}
  if(style!==this.official.styleFingerprint)throw new Error("El PCAP oficial ASO remoto no coincide con la huella de estilo acreditada; generación bloqueada.");
  return{templateId:this.official.templateId,sourceId:this.official.sourceId,bytes};
 }
}
