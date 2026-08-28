import fs from "node:fs";
import path from "node:path";

export type PilotContractFamily="SUPPLY"|"SERVICE";
export interface PilotAcceptanceSession{readonly id:string;readonly actorId:string;readonly recordedAt:string;}
export interface PilotPackageReview{readonly caseId:string;readonly family:PilotContractFamily;readonly packageSha256:string;readonly reviewerId:string;readonly reviewedAt:string;readonly accepted:boolean;readonly criticalDefectsOpen:number;readonly notes?:string;}
export interface PilotAcceptanceDecision{readonly actorId:string;readonly recordedAt:string;readonly accepted:boolean;readonly rationale:string;}
interface PilotAcceptanceState{sessions:PilotAcceptanceSession[];reviews:PilotPackageReview[];decision:PilotAcceptanceDecision|null;}
const EMPTY:Readonly<PilotAcceptanceState>={sessions:[],reviews:[],decision:null};
function validSha(value:string){return /^[a-f0-9]{64}$/i.test(value);}
function now(){return new Date().toISOString();}

/** Evidencia humana durable. No crea ni presume sesiones: solo registra actos autenticados. */
export class LB102PilotAcceptanceStore{
 public constructor(private readonly filePath:string){}
 private read():PilotAcceptanceState{try{const x=JSON.parse(fs.readFileSync(this.filePath,"utf8")) as PilotAcceptanceState;return{sessions:Array.isArray(x.sessions)?x.sessions:[],reviews:Array.isArray(x.reviews)?x.reviews:[],decision:x.decision??null};}catch{return{sessions:[],reviews:[],decision:null};}}
 private write(state:PilotAcceptanceState){fs.mkdirSync(path.dirname(this.filePath),{recursive:true});const tmp=`${this.filePath}.${process.pid}.tmp`;fs.writeFileSync(tmp,JSON.stringify(state,null,2),{mode:0o600});fs.renameSync(tmp,this.filePath);}
 public recordSession(actorId:string):PilotAcceptanceSession{if(!actorId.trim())throw new Error("La sesión exige identidad nominativa autenticada.");const state=this.read();const session={id:`LB102-${Date.now()}-${state.sessions.length+1}`,actorId:actorId.trim(),recordedAt:now()};state.sessions.push(session);this.write(state);return session;}
 public recordReview(input:Omit<PilotPackageReview,"reviewerId"|"reviewedAt">,reviewerId:string):PilotPackageReview{if(!input.caseId.trim())throw new Error("La revisión exige caseId.");if(!validSha(input.packageSha256))throw new Error("La revisión exige SHA-256 del paquete generado.");if(!Number.isInteger(input.criticalDefectsOpen)||input.criticalDefectsOpen<0)throw new Error("criticalDefectsOpen debe ser entero no negativo.");const state=this.read();if(state.reviews.some(x=>x.packageSha256.toLowerCase()===input.packageSha256.toLowerCase()))throw new Error("Ese paquete ya tiene revisión humana registrada.");const review={...input,caseId:input.caseId.trim(),reviewerId:reviewerId.trim(),reviewedAt:now(),...(input.notes?.trim()?{notes:input.notes.trim()}:{})};state.reviews.push(review);this.write(state);return review;}
 public recordDecision(input:{accepted:boolean;rationale:string},actorId:string):PilotAcceptanceDecision{if(!input.rationale.trim())throw new Error("La decisión final exige motivación.");const state=this.read();const decision={actorId:actorId.trim(),recordedAt:now(),accepted:input.accepted,rationale:input.rationale.trim()};state.decision=decision;this.write(state);return decision;}
 public evidence(){const state=this.read();return{userAcceptanceSessions:state.sessions.length,distinctPilotUsers:new Set(state.sessions.map(x=>x.actorId)).size,generatedPackagesHumanReviewed:state.reviews.length,criticalDefectsOpen:state.reviews.reduce((n,x)=>n+x.criticalDefectsOpen,0),acceptanceDecisionRecorded:state.decision?.accepted===true,state};}
}
