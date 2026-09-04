import {createHash} from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export type PilotContractFamily="SUPPLY"|"SERVICE";
export interface PilotAcceptanceSession{readonly id:string;readonly actorId:string;readonly recordedAt:string;}
export interface PilotPackageReview{readonly caseId:string;readonly family:PilotContractFamily;readonly packageSha256:string;readonly reviewerId:string;readonly reviewedAt:string;readonly accepted:boolean;readonly criticalDefectsOpen:number;readonly notes?:string;}
export interface PilotAcceptanceDecision{readonly actorId:string;readonly recordedAt:string;readonly accepted:boolean;readonly rationale:string;}
export interface PilotAcceptanceState{sessions:PilotAcceptanceSession[];reviews:PilotPackageReview[];decision:PilotAcceptanceDecision|null;}
export interface PilotAcceptanceEvidence{userAcceptanceSessions:number;distinctPilotUsers:number;generatedPackagesHumanReviewed:number;totalPackageReviews:number;distinctCasesHumanReviewed:number;criticalDefectsOpen:number;acceptanceDecisionRecorded:boolean;state:PilotAcceptanceState;}
export interface LB102PilotAcceptanceStoreLike{
 recordSession(actorId:string):PilotAcceptanceSession|Promise<PilotAcceptanceSession>;
 recordReview(input:Omit<PilotPackageReview,"reviewerId"|"reviewedAt">,reviewerId:string):PilotPackageReview|Promise<PilotPackageReview>;
 recordDecision(input:{accepted:boolean;rationale:string},actorId:string):PilotAcceptanceDecision|Promise<PilotAcceptanceDecision>;
 evidence():PilotAcceptanceEvidence|Promise<PilotAcceptanceEvidence>;
}
function validSha(value:string){return /^[a-f0-9]{64}$/i.test(value);}
function now(){return new Date().toISOString();}
function cleanState(value:unknown):PilotAcceptanceState{if(!value||typeof value!=="object"||Array.isArray(value))return{sessions:[],reviews:[],decision:null};const x=value as Partial<PilotAcceptanceState>;return{sessions:Array.isArray(x.sessions)?x.sessions:[],reviews:Array.isArray(x.reviews)?x.reviews:[],decision:x.decision??null};}
function evidenceOf(state:PilotAcceptanceState):PilotAcceptanceEvidence{const distinctCases=new Set(state.reviews.map(x=>x.caseId)).size;return{userAcceptanceSessions:state.sessions.length,distinctPilotUsers:new Set(state.sessions.map(x=>x.actorId)).size,generatedPackagesHumanReviewed:distinctCases,totalPackageReviews:state.reviews.length,distinctCasesHumanReviewed:distinctCases,criticalDefectsOpen:state.reviews.reduce((n,x)=>n+x.criticalDefectsOpen,0),acceptanceDecisionRecorded:state.decision?.accepted===true,state};}
function validateReview(input:Omit<PilotPackageReview,"reviewerId"|"reviewedAt">){if(!input.caseId.trim())throw new Error("La revisión exige caseId.");if(!validSha(input.packageSha256))throw new Error("La revisión exige SHA-256 del paquete generado.");if(!Number.isInteger(input.criticalDefectsOpen)||input.criticalDefectsOpen<0)throw new Error("criticalDefectsOpen debe ser entero no negativo.");}
function canonicalJson(value:unknown):string{if(value===null)return"null";if(typeof value==="string"||typeof value==="boolean")return JSON.stringify(value);if(typeof value==="number")return Number.isFinite(value)?JSON.stringify(value):"null";if(Array.isArray(value))return`[${value.map(item=>canonicalJson(item===undefined?null:item)).join(",")}]`;if(typeof value==="object"){const record=value as Record<string,unknown>;return`{${Object.keys(record).filter(key=>record[key]!==undefined&&typeof record[key]!=="function"&&typeof record[key]!=="symbol").sort().map(key=>`${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(",")}}`;}throw new Error("Valor no soportado al calcular checksum canónico.");}
function stateChecksum(state:PilotAcceptanceState){return createHash("sha256").update(canonicalJson(state)).digest("hex");}

/** Evidencia humana local para desarrollo/test. No crea ni presume sesiones: solo registra actos autenticados. */
export class LB102PilotAcceptanceStore implements LB102PilotAcceptanceStoreLike{
 public constructor(private readonly filePath:string){}
 private read():PilotAcceptanceState{try{return cleanState(JSON.parse(fs.readFileSync(this.filePath,"utf8")));}catch{return{sessions:[],reviews:[],decision:null};}}
 private write(state:PilotAcceptanceState){fs.mkdirSync(path.dirname(this.filePath),{recursive:true});const tmp=`${this.filePath}.${process.pid}.tmp`;fs.writeFileSync(tmp,JSON.stringify(state,null,2),{mode:0o600});fs.renameSync(tmp,this.filePath);}
 public recordSession(actorId:string):PilotAcceptanceSession{if(!actorId.trim())throw new Error("La sesión exige identidad nominativa autenticada.");const state=this.read();const session={id:`LB102-${Date.now()}-${state.sessions.length+1}`,actorId:actorId.trim(),recordedAt:now()};state.sessions.push(session);this.write(state);return session;}
 public recordReview(input:Omit<PilotPackageReview,"reviewerId"|"reviewedAt">,reviewerId:string):PilotPackageReview{validateReview(input);const state=this.read();if(state.reviews.some(x=>x.packageSha256.toLowerCase()===input.packageSha256.toLowerCase()))throw new Error("Ese paquete ya tiene revisión humana registrada.");const review={...input,caseId:input.caseId.trim(),reviewerId:reviewerId.trim(),reviewedAt:now(),...(input.notes?.trim()?{notes:input.notes.trim()}:{})};state.reviews.push(review);this.write(state);return review;}
 public recordDecision(input:{accepted:boolean;rationale:string},actorId:string):PilotAcceptanceDecision{if(!input.rationale.trim())throw new Error("La decisión final exige motivación.");const state=this.read();const decision={actorId:actorId.trim(),recordedAt:now(),accepted:input.accepted,rationale:input.rationale.trim()};state.decision=decision;this.write(state);return decision;}
 public evidence(){return evidenceOf(this.read());}
}

interface RemoteEnvelope{schemaVersion?:unknown;payload?:unknown;checksum?:unknown;}
/** Persistencia durable LB102 sobre el servicio remoto ya autenticado de Contrata-IA. */
export class HttpLB102PilotAcceptanceStore implements LB102PilotAcceptanceStoreLike{
 private readonly endpoint:string;
 private queue:Promise<void>=Promise.resolve();
 public constructor(endpoint:string,private readonly token:string){this.endpoint=endpoint.trim().replace(/\/+$/,"");if(!this.endpoint.startsWith("https://"))throw new Error("La evidencia UAT remota exige HTTPS.");if(token.trim().length<16)throw new Error("Falta token válido de persistencia UAT.");}
 private async read():Promise<PilotAcceptanceState>{const response=await fetch(`${this.endpoint}/lb102-acceptance/pilot`,{headers:{"x-contrata-ia-persistence-token":this.token,accept:"application/json"}});if(response.status===404)return{sessions:[],reviews:[],decision:null};if(!response.ok)throw new Error(`No se puede recuperar evidencia UAT: HTTP ${response.status}.`);const envelope=await response.json() as RemoteEnvelope;const state=cleanState(envelope.payload);if(typeof envelope.checksum!=="string"||stateChecksum(state)!==envelope.checksum)throw new Error("La evidencia UAT remota no supera la verificación de integridad SHA-256.");return state;}
 private async write(state:PilotAcceptanceState){const checksum=stateChecksum(state);const response=await fetch(`${this.endpoint}/lb102-acceptance/pilot`,{method:"PUT",headers:{"x-contrata-ia-persistence-token":this.token,"content-type":"application/json",accept:"application/json"},body:JSON.stringify({schemaVersion:1,payload:state,checksum})});if(!response.ok)throw new Error(`No se puede persistir evidencia UAT: HTTP ${response.status}.`);}
 private mutate<T>(operation:(state:PilotAcceptanceState)=>T):Promise<T>{let result!:T;const run=this.queue.then(async()=>{const state=await this.read();result=operation(state);await this.write(state);});this.queue=run.catch(()=>undefined);return run.then(()=>result);}
 public recordSession(actorId:string){if(!actorId.trim())return Promise.reject(new Error("La sesión exige identidad nominativa autenticada."));return this.mutate(state=>{const session={id:`LB102-${Date.now()}-${state.sessions.length+1}`,actorId:actorId.trim(),recordedAt:now()};state.sessions.push(session);return session;});}
 public recordReview(input:Omit<PilotPackageReview,"reviewerId"|"reviewedAt">,reviewerId:string){try{validateReview(input);}catch(error){return Promise.reject(error);}return this.mutate(state=>{if(state.reviews.some(x=>x.packageSha256.toLowerCase()===input.packageSha256.toLowerCase()))throw new Error("Ese paquete ya tiene revisión humana registrada.");const review={...input,caseId:input.caseId.trim(),reviewerId:reviewerId.trim(),reviewedAt:now(),...(input.notes?.trim()?{notes:input.notes.trim()}:{})};state.reviews.push(review);return review;});}
 public recordDecision(input:{accepted:boolean;rationale:string},actorId:string){if(!input.rationale.trim())return Promise.reject(new Error("La decisión final exige motivación."));return this.mutate(state=>{const decision={actorId:actorId.trim(),recordedAt:now(),accepted:input.accepted,rationale:input.rationale.trim()};state.decision=decision;return decision;});}
 public async evidence(){return evidenceOf(await this.read());}
}

export function createLB102PilotAcceptanceStoreFromEnv(filePath:string):LB102PilotAcceptanceStoreLike{const endpoint=process.env.CONTRATA_IA_PERSISTENCE_URL?.trim();const token=process.env.CONTRATA_IA_PERSISTENCE_TOKEN?.trim();return endpoint&&token?new HttpLB102PilotAcceptanceStore(endpoint,token):new LB102PilotAcceptanceStore(filePath);}
