import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {afterEach,describe,expect,it} from "vitest";
import {evaluateLB102PilotAcceptance} from "../src/application/operations/lb102/LB102PilotAcceptanceGate";
import {LB102PilotAcceptanceStore} from "../src/application/operations/lb102/LB102PilotAcceptanceStore";
const roots:string[]=[];function store(){const root=fs.mkdtempSync(path.join(os.tmpdir(),"lb102-acceptance-"));roots.push(root);return new LB102PilotAcceptanceStore(path.join(root,"acceptance.json"));}
afterEach(()=>{for(const root of roots.splice(0))fs.rmSync(root,{recursive:true,force:true});});
function status(s:LB102PilotAcceptanceStore){const e=s.evidence();return evaluateLB102PilotAcceptance({lb99PilotScopeClosed:true,sourceGovernanceReady:true,freeGenerationPathVerified:true,lb101SecurityReady:true,supplyRealCaseRuns:2,serviceRealCaseRuns:2,negativeRegressionConflictPassed:true,negativeRegressionMissingValidationPassed:true,negativeRegressionTemplateIntegrityPassed:true,userAcceptanceSessions:e.userAcceptanceSessions,distinctPilotUsers:e.distinctPilotUsers,criticalDefectsOpen:e.criticalDefectsOpen,generatedPackagesHumanReviewed:e.generatedPackagesHumanReviewed,acceptanceDecisionRecorded:e.acceptanceDecisionRecorded});}
describe("LB102 evidencia humana del piloto",()=>{
 it("solo alcanza viabilidad con dos usuarios, cuatro paquetes sin críticos y aceptación motivada",()=>{const s=store();s.recordSession("revisor.a");s.recordSession("admin.b");for(let i=0;i<4;i++)s.recordReview({caseId:`CASE-${i+1}`,family:i<2?"SUPPLY":"SERVICE",packageSha256:String(i+1).repeat(64),accepted:true,criticalDefectsOpen:0},i<2?"revisor.a":"admin.b");s.recordDecision({accepted:true,rationale:"Los cuatro paquetes han sido revisados y no presentan defectos críticos abiertos."},"admin.b");const x=status(s);expect(x.technicalPrePilotReady).toBe(true);expect(x.appViableForPilot).toBe(true);expect(x.productionReady).toBe(false);});
 it("no cuenta dos veces el mismo paquete",()=>{const s=store();const review={caseId:"CASE-1",family:"SUPPLY" as const,packageSha256:"a".repeat(64),accepted:true,criticalDefectsOpen:0};s.recordReview(review,"revisor.a");expect(()=>s.recordReview(review,"admin.b")).toThrow(/ya tiene revisión/);});
 it("una decisión de rechazo no se transforma en aceptación",()=>{const s=store();s.recordDecision({accepted:false,rationale:"Se detectan incidencias pendientes."},"admin.b");expect(s.evidence().acceptanceDecisionRecorded).toBe(false);expect(status(s).appViableForPilot).toBe(false);});
});
