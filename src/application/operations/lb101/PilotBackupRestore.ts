import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

function sha(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
function files(root:string):string[]{if(!fs.existsSync(root))return[];return fs.readdirSync(root,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(root,e.name)):[path.join(root,e.name)]);}
function relative(root:string,file:string){return path.relative(root,file).split(path.sep).join("/");}
export interface PilotBackupManifest{createdAt:string;sourceRoot:string;files:readonly {path:string;sha256:string;byteLength:number}[];}

/** Backup local deterministic para piloto. Infraestructura externa puede replicar después este directorio. */
export class PilotBackupRestore{
  public create(sourceRoot:string,backupRoot:string,createdAt=new Date().toISOString()):PilotBackupManifest{
    fs.mkdirSync(backupRoot,{recursive:true});const snapshot=createdAt.replace(/[:.]/g,"-");const target=path.join(backupRoot,snapshot);fs.mkdirSync(target,{recursive:true});const entries=[] as Array<{path:string;sha256:string;byteLength:number}>;
    for(const file of files(sourceRoot)){const rel=relative(sourceRoot,file);const bytes=fs.readFileSync(file);const dest=path.join(target,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(file,dest);entries.push({path:rel,sha256:sha(bytes),byteLength:bytes.byteLength});}
    entries.sort((a,b)=>a.path.localeCompare(b.path));const manifest:PilotBackupManifest={createdAt,sourceRoot,files:entries};fs.writeFileSync(path.join(target,"backup-manifest.json"),JSON.stringify(manifest,null,2),{encoding:"utf8",mode:0o600});return manifest;
  }
  public restoreDrill(snapshotRoot:string,targetRoot:string):{valid:boolean;files:number;errors:readonly string[]}{
    const manifestPath=path.join(snapshotRoot,"backup-manifest.json");if(!fs.existsSync(manifestPath))return{valid:false,files:0,errors:["Falta backup-manifest.json."]};const manifest=JSON.parse(fs.readFileSync(manifestPath,"utf8")) as PilotBackupManifest;fs.mkdirSync(targetRoot,{recursive:true});const errors:string[]=[];
    for(const item of manifest.files){const source=path.join(snapshotRoot,item.path);if(!fs.existsSync(source)){errors.push(`Falta ${item.path} en backup.`);continue;}const bytes=fs.readFileSync(source);if(bytes.byteLength!==item.byteLength||sha(bytes)!==item.sha256){errors.push(`Integridad incorrecta: ${item.path}.`);continue;}const dest=path.join(targetRoot,item.path);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(source,dest);const restored=fs.readFileSync(dest);if(sha(restored)!==item.sha256)errors.push(`Restore incorrecto: ${item.path}.`);
    }
    return{valid:errors.length===0,files:manifest.files.length,errors};
  }
}
