import {evaluateLB102PilotAcceptance,type LB102PilotAcceptanceStatus} from "./LB102PilotAcceptanceGate";
import {countExecutableRealCases} from "./RealCaseRegressionCorpus";

export interface LB102TechnicalPrePilotInputs{
 readonly lb101SecurityReady:boolean;
 readonly negativeRegressionConflictPassed:boolean;
 readonly negativeRegressionMissingValidationPassed:boolean;
 readonly negativeRegressionTemplateIntegrityPassed:boolean;
}

/**
 * Estado técnico LB102 derivado del corpus real. LB99 y LB100 están cerrados para
 * alcance de piloto en la rama actual; la generación base no requiere SDK/API IA de pago.
 * La seguridad de despliegue se aporta desde el preflight LB101 y no se autoafirma.
 */
export function evaluateLB102TechnicalPrePilot(input:LB102TechnicalPrePilotInputs):LB102PilotAcceptanceStatus{
 return evaluateLB102PilotAcceptance({
  lb99PilotScopeClosed:true,
  sourceGovernanceReady:true,
  freeGenerationPathVerified:true,
  lb101SecurityReady:input.lb101SecurityReady,
  supplyRealCaseRuns:countExecutableRealCases("SUPPLY"),
  serviceRealCaseRuns:countExecutableRealCases("SERVICE"),
  negativeRegressionConflictPassed:input.negativeRegressionConflictPassed,
  negativeRegressionMissingValidationPassed:input.negativeRegressionMissingValidationPassed,
  negativeRegressionTemplateIntegrityPassed:input.negativeRegressionTemplateIntegrityPassed,
  userAcceptanceSessions:0,
  distinctPilotUsers:0,
  criticalDefectsOpen:0,
  generatedPackagesHumanReviewed:0,
  acceptanceDecisionRecorded:false,
 });
}
