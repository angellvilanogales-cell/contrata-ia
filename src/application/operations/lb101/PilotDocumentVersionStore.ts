import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export interface PilotDocumentVersion {caseId:string;version:number;createdAt:string;actorId:string;packageSha256:string;fileName:string;sourceCommit:string;humanAccepted:boolean;}
function sha(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
function safe(id:string){if(!/^[A-Za-z0-9/_-]{4,120}$/.test(id))throw new Error("caseId no válido para versionado.");return id.replaceAll("/","__");}

/** Conserva cada paquete aceptado como versión inmutable, sin sobrescribir versiones anteriores. */
export class PilotDocumentVersionStore{
  public constructor(private readonly root:string){fs.mkdirSync(root,{recursive:true});}
  public save(input:{caseId:string;actorId:string;fileName:string;bytes:Uint8Array;sourceCommit:string;humanAccepted:boolean;createdAt?:string}):PilotDocumentVersion{
    if(!input.humanAccepted)throw new Error("No se versiona como paquete aceptado sin aceptación humana expresa.");
    const dir=path.join(this.root,safe(input.caseId));fs.mkdirSync(dir,{recursive:true});const current=this.list(input.caseId);const version=(current.at(-1)?.version??0)+1;const packageSha256=sha(input.bytes);const record:PilotDocumentVersion={caseId:input.caseId,version,createdAt:input.createdAt??new Date().toISOString(),actorId:input.actorId,fileName:input.fileName,packageSha256,sourceCommit:input.sourceCommit,humanAccepted:true};
    const bin=path.join(dir,`v${String(version).padStart(4,"0")}-${packageSha256}.zip`);const meta=`${bin}.json`;if(fs.existsSync(bin)||fs.existsSync(meta))throw new Error("Colisión de versión documental inmutable.");fs.writeFileSync(bin,input.bytes,{mode:0o600});fs.writeFileSync(meta,JSON.stringify(record,null,2),{encoding:"utf8",mode:0o600});return record;
  }
  public list(caseId:string):readonly PilotDocumentVersion[]{const dir=path.join(this.root,safe(caseId));if(!fs.existsSync(dir))return[];return fs.readdirSync(dir).filter(x=>x.endsWith(".zip.json")).sort().map(x=>JSON.parse(fs.readFileSync(path.join(dir,x),"utf8")) as PilotDocumentVersion);}
  public verify(caseId:string):{valid:boolean;versions:number;errors:readonly string[]}{const errors:string[]=[];const rows=this.list(caseId);for(const row of rows){const bin=path.join(this.root,safe(caseId),`v${String(row.version).padStart(4,"0")}-${row.packageSha256}.zip`);if(!fs.existsSync(bin)){errors.push(`Falta binario v${row.version}.`);continue;}if(sha(fs.readFileSync(bin))!==row.packageSha256)errors.push(`SHA alterado en v${row.version}.`);}return{valid:errors.length===0,versions:rows.length,errors};}
}
