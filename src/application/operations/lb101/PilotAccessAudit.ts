import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { SecurityAuditEvent, SecurityAuditPort } from "../lb7/OperationalPorts";

export interface ChainedSecurityAuditEvent extends SecurityAuditEvent {
  readonly sequence: number;
  readonly previousHash: string;
  readonly hash: string;
}

function digest(value: Omit<ChainedSecurityAuditEvent,"hash">): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

/**
 * Auditoría append-only con cadena SHA-256. No pretende sustituir un SIEM ni
 * afirmar cumplimiento ENS; ofrece trazabilidad verificable suficiente para el piloto.
 */
export class PilotAccessAudit implements SecurityAuditPort {
  public constructor(private readonly filePath:string){fs.mkdirSync(path.dirname(filePath),{recursive:true});}

  public record(event:SecurityAuditEvent):void {
    const previous=this.readAll().at(-1);
    const base:Omit<ChainedSecurityAuditEvent,"hash">={...event,sequence:(previous?.sequence??0)+1,previousHash:previous?.hash??"GENESIS"};
    const row:ChainedSecurityAuditEvent={...base,hash:digest(base)};
    fs.appendFileSync(this.filePath,`${JSON.stringify(row)}\n`,{encoding:"utf8",mode:0o600});
  }

  public readAll():readonly ChainedSecurityAuditEvent[]{
    if(!fs.existsSync(this.filePath))return[];
    return fs.readFileSync(this.filePath,"utf8").split("\n").filter(Boolean).map(line=>JSON.parse(line) as ChainedSecurityAuditEvent);
  }

  public verify():{valid:boolean;events:number;errors:readonly string[]}{
    const rows=this.readAll();const errors:string[]=[];let previous="GENESIS";
    for(let i=0;i<rows.length;i++){
      const row=rows[i]!;if(row.sequence!==i+1)errors.push(`Secuencia inválida en evento ${i+1}.`);if(row.previousHash!==previous)errors.push(`Cadena rota en evento ${i+1}.`);
      const {hash,...base}=row;if(digest(base)!==hash)errors.push(`Hash inválido en evento ${i+1}.`);previous=row.hash;
    }
    return{valid:errors.length===0,events:rows.length,errors};
  }
}
