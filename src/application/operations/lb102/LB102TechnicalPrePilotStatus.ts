import {evaluateLB102PilotAcceptance,type LB102PilotAcceptanceStatus} from "./LB102PilotAcceptanceGate";
import {countExecutableRealCases} from "./RealCaseRegressionCorpus";

export interface LB102TechnicalPrePilotInputs{
 readonly lb101SecurityReady:boolean;
 readonly deployedGenerationReady:boolean;
 readonly negativeRegressionConflictPassed:boolean;
 readonly negativeRegressionMissingValidationPassed:boolean;
 readonly negativeRegressionTemplateIntegrityPassed:boolean;
}

/**
 * Estado técnico LB102 derivado del corpus real y de la capacidad efectiva de generar
 * los cuatro paquetes del piloto en el despliegue actual. No basta con que el corpus y
 * las regresiones estén cerrados: si falta un activo persistido requerido, el preflight
 * debe permanecer bloqueado hasta que el autodiagnóstico de generación sea positivo.
 */
export function evaluateLB102TechnicalPrePilot(input:LB102TechnicalPrePilotInputs):LB102PilotAcceptanceStatus{
 const base=evaluateLB102PilotAcceptance({
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
 if(input.deployedGenerationReady)return base;
 const generationBlocker="El despliegue debe generar correctamente los cuatro paquetes del piloto con sus activos persistidos validados.";
 return{
  ...base,
  technicalPrePilotReady:false,
  appViableForPilot:false,
  blockers:base.blockers.includes(generationBlocker)?base.blockers:[generationBlocker,...base.blockers],
 };
}
