import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {afterEach,describe,expect,it} from "vitest";
import {runLB101LivePreflight} from "../src/interfaces/lb102/LB102RuntimeServer";

const keys=["NODE_ENV","CONTRATA_IA_USERS_JSON","CONTRATA_IA_PUBLIC_BASE_URL","CONTRATA_IA_PERSISTENCE_URL","CONTRATA_IA_PERSISTENCE_TOKEN","CONTRATA_IA_DATA_DIR"] as const;
const original=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
afterEach(()=>{for(const k of keys){const v=original[k];if(v===undefined)delete process.env[k];else process.env[k]=v;}});
function configure(){const root=fs.mkdtempSync(path.join(os.tmpdir(),"lb102-preflight-data-"));process.env.NODE_ENV="production";process.env.CONTRATA_IA_DATA_DIR=root;process.env.CONTRATA_IA_PUBLIC_BASE_URL="https://contrata-ia.example.test";process.env.CONTRATA_IA_PERSISTENCE_URL="https://persistence.example.test";process.env.CONTRATA_IA_PERSISTENCE_TOKEN="persist-token-0000000001";process.env.CONTRATA_IA_USERS_JSON=JSON.stringify([{id:"gestor.piloto",role:"OPERATOR",token:"operator-token-00000001"},{id:"revisor.piloto",role:"REVIEWER",token:"reviewer-token-00000001"}]);return root;}
describe("LB102 live preflight",()=>{
 it("acredita controles LB101 con dos identidades, HTTPS, persistencia, auditoría, versiones y restore",()=>{const root=configure();try{const status=runLB101LivePreflight();expect(status.pilotSecurityReady).toBe(true);expect(status.blockers).toEqual([]);expect(status.productionReady).toBe(false);expect(status.ensComplianceClaimed).toBe(false);}finally{fs.rmSync(root,{recursive:true,force:true});}});
 it("bloquea una configuración sin identidades nominativas",()=>{const root=configure();process.env.CONTRATA_IA_USERS_JSON="[]";try{const status=runLB101LivePreflight();expect(status.pilotSecurityReady).toBe(false);expect(status.blockers.join(" ")).toMatch(/identidades nominativas|roles|credenciales/i);}finally{fs.rmSync(root,{recursive:true,force:true});}});
});
