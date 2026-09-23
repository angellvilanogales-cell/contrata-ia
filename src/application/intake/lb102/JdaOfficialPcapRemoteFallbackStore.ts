import {createHash} from "node:crypto";
import type {UniversalEditableTemplateBinarySource,UniversalEditableTemplateBinaryStore} from "../lb23/UniversalOdtProductionRenderer";
import {computeOdtStyleFingerprint} from "../lb23/UniversalOdtProductionRenderer";
import {readOdtZip} from "../lb23/OdtPackageCodec";
import type {PersistedTemplateAssetDescriptor} from "../lb94/HttpPersistedTemplateAssetStore";

function sha256(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}

/**
 * Fallback cerrado para un único modelo oficial Junta previamente acreditado.
 * Primero consulta la persistencia protegida; si el activo aún no está allí,
 * descarga exclusivamente la URL oficial fijada y exige SHA y huella de estilo
 * exactos. Nunca degrada a una plantilla procedente de un expediente real.
 *
 * En caso de divergencia, el error conserva las huellas observadas para poder
 * auditar si la Junta ha sustituido físicamente el ODT publicado. Esto no
 * relaja la puerta: cualquier diferencia continúa bloqueando la generación.
 */
export class JdaOfficialPcapRemoteFallbackStore implements UniversalEditableTemplateBinaryStore{
 public constructor(
  private readonly persisted:UniversalEditableTemplateBinaryStore,
  private readonly official:PersistedTemplateAssetDescriptor,
  private readonly officialUrl:string,
  private readonly label:string,
 ){}
 public async get(templateId:string):Promise<UniversalEditableTemplateBinarySource|null>{
  const persisted=await this.persisted.get(templateId);if(persisted)return persisted;
  if(templateId!==this.official.templateId)return null;
  let response:Response;
  try{response=await fetch(this.officialUrl,{method:"GET",headers:{accept:"application/vnd.oasis.opendocument.text"}});}catch(error){throw new Error(`No se puede recuperar ${this.label} desde la Junta: ${error instanceof Error?error.message:String(error)}`);}
  if(!response.ok)throw new Error(`La Junta no entrega ${this.label}: HTTP ${response.status}.`);
  const bytes=new Uint8Array(await response.arrayBuffer());
  const observedSha=sha256(bytes);
  let observedStyle:string;try{observedStyle=computeOdtStyleFingerprint(readOdtZip(bytes));}catch{throw new Error(`${this.label}: el recurso remoto no es un ODT válido (SHA observado ${observedSha}).`);}
  if(observedSha!==this.official.sha256)throw new Error(`${this.label}: SHA-256 remoto distinto del acreditado; esperado=${this.official.sha256}; observado=${observedSha}; huellaEstiloObservada=${observedStyle}; generación bloqueada.`);
  if(observedStyle!==this.official.styleFingerprint)throw new Error(`${this.label}: huella de estilo remota distinta de la acreditada; esperada=${this.official.styleFingerprint}; observada=${observedStyle}; SHA=${observedSha}; generación bloqueada.`);
  return{templateId:this.official.templateId,sourceId:this.official.sourceId,bytes};
 }
}
