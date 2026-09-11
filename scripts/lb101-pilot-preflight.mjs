#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { SecurityPolicy } from "../dist/interfaces/lb7/SecurityPolicy.js";
import { PilotAccessAudit } from "../dist/application/operations/lb101/PilotAccessAudit.js";
import { PilotDocumentVersionStore } from "../dist/application/operations/lb101/PilotDocumentVersionStore.js";
import { PilotBackupRestore } from "../dist/application/operations/lb101/PilotBackupRestore.js";
import { evaluateLB101PilotSecurityReadiness } from "../dist/application/operations/lb101/LB101PilotSecurityReadiness.js";

function parsedUsers(){try{const x=JSON.parse(process.env.CONTRATA_IA_USERS_JSON??"[]");return Array.isArray(x)?x:[];}catch{return[];}}
const users=parsedUsers();const roles=new Set(users.map(x=>x?.role).filter(Boolean));const policy=new SecurityPolicy(process.env);
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),"contrata-lb101-preflight-"));
const audit=new PilotAccessAudit(path.join(scratch,"audit.jsonl"));audit.record({timestamp:new Date().toISOString(),actor:"preflight",action:"PREFLIGHT",outcome:"SUCCESS"});
const versions=new PilotDocumentVersionStore(path.join(scratch,"versions"));versions.save({caseId:"PREFLIGHT-CASE",actorId:"preflight",fileName:"test.zip",bytes:Buffer.from("contrata-ia-preflight"),sourceCommit:process.env.RENDER_GIT_COMMIT??process.env.GITHUB_SHA??"unknown",humanAccepted:true});
const dataRoot=path.resolve(process.env.CONTRATA_IA_DATA_DIR??"var/contrata-ia");fs.mkdirSync(dataRoot,{recursive:true});const backupRoot=path.join(scratch,"backup");const backupTool=new PilotBackupRestore();const manifest=backupTool.create(dataRoot,backupRoot,"2026-08-28T00:00:00.000Z");const snapshot=path.join(backupRoot,"2026-08-28T00-00-00-000Z");const restore=backupTool.restoreDrill(snapshot,path.join(scratch,"restore"));
const publicBase=process.env.CONTRATA_IA_PUBLIC_BASE_URL?.trim()??"";const persistence=process.env.CONTRATA_IA_PERSISTENCE_URL?.trim()??"";const token=process.env.CONTRATA_IA_PERSISTENCE_TOKEN?.trim()??"";
const evidence={namedIdentityCount:policy.namedIdentityCount(),roleSeparationVerified:roles.size>=2,appendOnlyAuditVerified:audit.verify().valid,documentVersioningVerified:versions.verify("PREFLIGHT-CASE").valid,backupVerified:Array.isArray(manifest.files),restoreDrillVerified:restore.valid,httpsTerminationConfigured:publicBase.startsWith("https://"),persistenceAuthenticated:persistence.startsWith("https://")&&token.length>=16,secretsOutsideRepository:users.length>=2&&users.every(x=>typeof x?.token==="string"&&x.token.length>=16)};
const status=evaluateLB101PilotSecurityReadiness(evidence);console.log(JSON.stringify({evidence,status},null,2));process.exit(status.pilotSecurityReady?0:2);
