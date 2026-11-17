import { describe,expect,it } from "vitest";
import { evaluateLB102PilotAcceptance } from "../src/application/operations/lb102/LB102PilotAcceptanceGate";
const base={lb99PilotScopeClosed:true,sourceGovernanceReady:true,freeGenerationPathVerified:true,lb101SecurityReady:true,supplyRealCaseRuns:2,serviceRealCaseRuns:2,negativeRegressionConflictPassed:true,negativeRegressionMissingValidationPassed:true,negativeRegressionTemplateIntegrityPassed:true,userAcceptanceSessions:0,distinctPilotUsers:0,criticalDefectsOpen:0,generatedPackagesHumanReviewed:4,acceptanceDecisionRecorded:false};
describe("LB102 pilot acceptance",()=>{
 it("separa pre-piloto técnico de aceptación humana",()=>{const x=evaluateLB102PilotAcceptance(base);expect(x.technicalPrePilotReady).toBe(true);expect(x.appViableForPilot).toBe(false);});
 it("requiere usuarios distintos y decisión de aceptación",()=>{const x=evaluateLB102PilotAcceptance({...base,userAcceptanceSessions:2,distinctPilotUsers:2,acceptanceDecisionRecorded:true});expect(x.appViableForPilot).toBe(true);expect(x.productionReady).toBe(false);});
 it("bloquea con defectos críticos abiertos",()=>{const x=evaluateLB102PilotAcceptance({...base,userAcceptanceSessions:2,distinctPilotUsers:2,criticalDefectsOpen:1,acceptanceDecisionRecorded:true});expect(x.appViableForPilot).toBe(false);});
});
