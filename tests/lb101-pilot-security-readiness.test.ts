import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe,expect,it } from "vitest";
import { SecurityPolicy } from "../src/interfaces/lb7/SecurityPolicy";
import { PilotAccessAudit } from "../src/application/operations/lb101/PilotAccessAudit";
import { PilotDocumentVersionStore } from "../src/application/operations/lb101/PilotDocumentVersionStore";
import { PilotBackupRestore } from "../src/application/operations/lb101/PilotBackupRestore";
import { evaluateLB101PilotSecurityReadiness } from "../src/application/operations/lb101/LB101PilotSecurityReadiness";

function tmp(){return fs.mkdtempSync(path.join(os.tmpdir(),"contrata-lb101-"));}
describe("LB101 seguridad de piloto",()=>{
  it("autentica identidades nominativas separadas y conserva RBAC",()=>{
    const policy=new SecurityPolicy({NODE_ENV:"production",CONTRATA_IA_USERS_JSON:JSON.stringify([{id:"gestor.a",role:"OPERATOR",token:"token-operador-0001"},{id:"revisor.b",role:"REVIEWER",token:"token-revisor--0002"}])});
    expect(policy.namedIdentityCount()).toBe(2);expect(policy.authenticateToken("token-operador-0001").id).toBe("gestor.a");expect(policy.authenticateToken("token-revisor--0002").role).toBe("REVIEWER");expect(()=>policy.require(policy.authenticateToken("token-operador-0001"),"REVIEWER")).toThrow(/Permiso insuficiente/);
  });
  it("rechaza credenciales nominativas compartidas",()=>{expect(()=>new SecurityPolicy({NODE_ENV:"production",CONTRATA_IA_USERS_JSON:JSON.stringify([{id:"a1",role:"OPERATOR",token:"token-compartido-0001"},{id:"b2",role:"REVIEWER",token:"token-compartido-0001"}])})).toThrow(/compartir|duplicad/i);});
  it("detecta alteración de auditoría append-only",()=>{const root=tmp();const file=path.join(root,"audit.jsonl");const audit=new PilotAccessAudit(file);audit.record({timestamp:"2026-08-28T10:00:00Z",actor:"gestor.a",action:"OPEN_CASE",caseId:"REG-SUPPLY-001",outcome:"SUCCESS"});audit.record({timestamp:"2026-08-28T10:01:00Z",actor:"revisor.b",action:"VALIDATE",caseId:"REG-SUPPLY-001",outcome:"SUCCESS"});expect(audit.verify().valid).toBe(true);const rows=fs.readFileSync(file,"utf8").replace("OPEN_CASE","DELETE_CASE");fs.writeFileSync(file,rows);expect(new PilotAccessAudit(file).verify().valid).toBe(false);});
  it("versiona paquetes aceptados sin sobrescribir y verifica SHA",()=>{const root=tmp();const store=new PilotDocumentVersionStore(path.join(root,"versions"));store.save({caseId:"REG-SUPPLY-001",actorId:"revisor.b",fileName:"v1.zip",bytes:Buffer.from("uno"),sourceCommit:"abc",humanAccepted:true});store.save({caseId:"REG-SUPPLY-001",actorId:"revisor.b",fileName:"v2.zip",bytes:Buffer.from("dos"),sourceCommit:"def",humanAccepted:true});expect(store.list("REG-SUPPLY-001").map(x=>x.version)).toEqual([1,2]);expect(store.verify("REG-SUPPLY-001").valid).toBe(true);});
  it("realiza backup y restore drill con verificación de integridad",()=>{const root=tmp();const source=path.join(root,"source");fs.mkdirSync(source);fs.writeFileSync(path.join(source,"case.json"),"contenido");const backups=path.join(root,"backups");const tool=new PilotBackupRestore();const manifest=tool.create(source,backups,"2026-08-28T10:00:00.000Z");expect(manifest.files).toHaveLength(1);const snapshot=path.join(backups,"2026-08-28T10-00-00-000Z");const result=tool.restoreDrill(snapshot,path.join(root,"restored"));expect(result.valid).toBe(true);expect(fs.readFileSync(path.join(root,"restored","case.json"),"utf8")).toBe("contenido");});
  it("solo declara readiness con todas las evidencias operativas",()=>{const ready=evaluateLB101PilotSecurityReadiness({namedIdentityCount:2,roleSeparationVerified:true,appendOnlyAuditVerified:true,documentVersioningVerified:true,backupVerified:true,restoreDrillVerified:true,httpsTerminationConfigured:true,persistenceAuthenticated:true,secretsOutsideRepository:true});expect(ready.pilotSecurityReady).toBe(true);expect(ready.ensComplianceClaimed).toBe(false);expect(ready.productionReady).toBe(false);const blocked=evaluateLB101PilotSecurityReadiness({...{namedIdentityCount:2,roleSeparationVerified:true,appendOnlyAuditVerified:true,documentVersioningVerified:true,backupVerified:true,restoreDrillVerified:true,httpsTerminationConfigured:true,persistenceAuthenticated:true,secretsOutsideRepository:true},restoreDrillVerified:false});expect(blocked.pilotSecurityReady).toBe(false);});
});
